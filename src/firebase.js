import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBKuRCTzEVwbc2ZFgmwm050uxbRTk5ZONE",
  authDomain: "wealtmap.firebaseapp.com",
  projectId: "wealtmap",
  storageBucket: "wealtmap.firebasestorage.app",
  messagingSenderId: "1032022494910",
  appId: "1:1032022494910:web:159458d9bb410a350f58ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };