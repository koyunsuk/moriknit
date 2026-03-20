import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArA0OO9Wd1edo2BW9Enpe-AMhm8eUN3c0",
  authDomain: "moriknit-ceea9.firebaseapp.com",
  projectId: "moriknit-ceea9",
  storageBucket: "moriknit-ceea9.firebasestorage.app",
  messagingSenderId: "683285854424",
  appId: "1:683285854424:web:31cebe736d620b4d21bfad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ── UI 업데이트 ────────────────────────────────────────────
function updateUI(user) {
  const profileBtn = document.getElementById('profileButton');
  const authBtn = document.getElementById('authButton');
  const profileName = document.getElementById('profileName');
  const modal = document.getElementById('authModal');

  if (user) {
    // 로그인 상태
    if (profileBtn) {
  profileBtn.style.display = 'flex';
  profileBtn.setAttribute('onclick', "showSection('myPage')");
}
    if (authBtn) authBtn.style.display = 'none';
    if (profileName) profileName.textContent = user.name;
    if (modal) {
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

    // 마이페이지 로그아웃 버튼 추가 (없으면)
    if (!document.getElementById('firebaseLogoutBtn')) {
      const myPageDesc = document.querySelector('#myPageSection p.text-gray-600');
      if (myPageDesc) {
        const btn = document.createElement('button');
        btn.id = 'firebaseLogoutBtn';
        btn.className = 'mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-all';
        btn.textContent = '로그아웃';
        btn.onclick = () => window.logoutUser();
        myPageDesc.insertAdjacentElement('afterend', btn);
      }
    }
    document.getElementById('firebaseLogoutBtn')?.style.setProperty('display', 'inline-block');

  } else {
    // 로그아웃 상태
    if (profileBtn) profileBtn.style.display = 'none';
    if (authBtn) authBtn.style.display = '';
    document.getElementById('firebaseLogoutBtn')?.style.setProperty('display', 'none');
  }

  if (typeof window.updateAuthUI === "function") window.updateAuthUI();
}

// ── 로그인 상태 감지 ───────────────────────────────────────
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
    const profile = docSnap.exists() ? docSnap.data() : {};
    window.currentUser = {
      id: firebaseUser.uid,
      name: profile.nickname || firebaseUser.displayName || firebaseUser.email.split("@")[0],
      email: firebaseUser.email,
      profileImage: profile.profileImage || firebaseUser.photoURL || null,
      subscription: profile.subscription || "free"
    };
    localStorage.setItem('moriknit_current_user', JSON.stringify(window.currentUser));
  } else {
    window.currentUser = null;
    localStorage.removeItem('moriknit_current_user');
  }
  updateUI(window.currentUser);
});

// ── 회원가입/로그인 ────────────────────────────────────────
window.submitAuth = async function () {
  const isLogin = document.getElementById("loginTabBtn")?.classList.contains("bg-indigo-600");
  const email = document.getElementById("authEmail")?.value?.trim();
  const password = document.getElementById("authPassword")?.value;
  const name = document.getElementById("authName")?.value?.trim();

  if (!email || !password) {
    window.showNotification?.("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  try {
    if (!isLogin) {
      if (!name || name.length < 2) {
        window.showNotification?.("닉네임은 2자 이상이어야 해요.");
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid, email, nickname: name,
        createdAt: serverTimestamp(), subscription: "free", profileImage: null
      });
      window.showNotification?.("가입 완료! 모리니트에 오신 걸 환영해요 🧶");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      window.showNotification?.("환영해요! 🧶");
    }
  } catch (err) {
    window.showNotification?.(getMsg(err.code));
  }
};

// ── 로그아웃 ───────────────────────────────────────────────
window.logoutUser = async function () {
  try {
    await signOut(auth);
    window.showNotification?.("로그아웃 됐어요 👋");
    if (typeof window.showSection === "function") window.showSection("home");
  } catch (err) {
    console.error(err);
  }
};

// ── Google 로그인 버튼 동적 추가 ──────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("authSubmitBtn");
  if (btn && !document.getElementById("googleAuthBtn")) {
    const g = document.createElement("button");
    g.id = "googleAuthBtn";
    g.type = "button";
    g.className = "mt-3 w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2";
    g.innerHTML = `<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.3 0-9.6-2.9-11.3-7.1l-6.6 5C9.7 39.7 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/></svg> Google로 계속하기`;
    g.onclick = async () => {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const ref = doc(db, "users", cred.user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: cred.user.uid, email: cred.user.email,
            nickname: cred.user.displayName || "뜨개인",
            createdAt: serverTimestamp(), subscription: "free",
            profileImage: cred.user.photoURL || null
          });
        }
        window.showNotification?.("Google로 로그인했어요 🧶");
      } catch (err) {
        window.showNotification?.(getMsg(err.code));
      }
    };
    btn.insertAdjacentElement("afterend", g);
  }
});

// ── 에러 메시지 ────────────────────────────────────────────
function getMsg(code) {
  const m = {
    "auth/email-already-in-use": "이미 사용 중인 이메일이에요.",
    "auth/invalid-email": "이메일 형식이 올바르지 않아요.",
    "auth/weak-password": "비밀번호는 6자 이상이어야 해요.",
    "auth/user-not-found": "가입되지 않은 이메일이에요.",
    "auth/wrong-password": "비밀번호가 틀렸어요.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 틀렸어요.",
    "auth/too-many-requests": "잠시 후 다시 시도해주세요.",
    "auth/popup-closed-by-user": "Google 로그인이 취소됐어요."
  };
  return m[code] || "오류가 발생했어요.";
}
