// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArA0OO9Wd1edo2BW9Enpe-AMhm8eUN3c0",
  authDomain: "moriknit-ceea9.firebaseapp.com",
  projectId: "moriknit-ceea9",
  storageBucket: "moriknit-ceea9.firebasestorage.app",
  messagingSenderId: "683285854424",
  appId: "1:683285854424:web:31cebe736d620b4d21bfad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
