import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwYK5YNF_YX7rtEyUchp5nIC7vsCcgoWY",
  authDomain: "reelywood-studio.firebaseapp.com",
  projectId: "reelywood-studio",
  storageBucket: "reelywood-studio.firebasestorage.app",
  messagingSenderId: "481913366686",
  appId: "1:481913366686:web:690dfb51ac9e72fd17738f",
  measurementId: "G-FEPX73WH66"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();