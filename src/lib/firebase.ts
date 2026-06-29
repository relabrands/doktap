import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-vNGtAkEj7LQ3tBNHtto7Wdn5T0PvOs8",
  authDomain: "doktapdo.firebaseapp.com",
  projectId: "doktapdo",
  storageBucket: "doktapdo.firebasestorage.app",
  messagingSenderId: "417037366564",
  appId: "1:417037366564:web:9250664adb1c9ad6126fb1",
  measurementId: "G-GB4G0VEDVG"
};

export const app = initializeApp(firebaseConfig);
// Initialize analytics safely if window is defined (for SSR support)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
