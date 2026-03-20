// auth.js - 회원가입, 로그인, 로그아웃 로직
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase-config.js";

const googleProvider = new GoogleAuthProvider();

// ── 회원가입 (이메일/비밀번호) ──────────────────────────────
export async function signUp(email, password, nickname) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 닉네임 설정
  await updateProfile(user, { displayName: nickname });

  // Firestore에 유저 정보 저장
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    nickname: nickname,
    createdAt: serverTimestamp(),
    subscription: "free",
    profileImage: null
  });

  return user;
}

// ── 로그인 (이메일/비밀번호) ───────────────────────────────
export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// ── Google 로그인 ──────────────────────────────────────────
export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // 신규 유저면 Firestore에 저장
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      nickname: user.displayName || "뜨개인",
      createdAt: serverTimestamp(),
      subscription: "free",
      profileImage: user.photoURL || null
    });
  }

  return user;
}

// ── 로그아웃 ───────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
}

// ── 유저 정보 가져오기 ─────────────────────────────────────
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

// ── 로그인 상태 감지 ───────────────────────────────────────
export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}
