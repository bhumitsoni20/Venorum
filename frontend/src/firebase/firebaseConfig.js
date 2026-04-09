// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpe8vRe99N47LDgrTC7W1H9Kqex9g0Uuo",
  authDomain: "venorum-07.firebaseapp.com",
  projectId: "venorum-07",
  storageBucket: "venorum-07.firebasestorage.app",
  messagingSenderId: "1016938404653",
  appId: "1:1016938404653:web:22515d705f800f9dda11a4",
  measurementId: "G-18F92KF8JS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// AUTH EXPORTS
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail
};  