
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Updated with the provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7E6n9hoxzeH5iFf7raIyL59U2ds6y4Ss",
  authDomain: "studio-7648492258-76684.firebaseapp.com",
  projectId: "studio-7648492258-76684",
  storageBucket: "studio-7648492258-76684.firebasestorage.app",
  messagingSenderId: "980161099808",
  appId: "1:980161099808:web:943a5c23ba036cc8a9e445"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
