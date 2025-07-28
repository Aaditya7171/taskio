// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxrpRKCfpyI0DSdDr7VHvS7uh9dzblWug",
  authDomain: "taskio-181f9.firebaseapp.com",
  projectId: "taskio-181f9",
  storageBucket: "taskio-181f9.firebasestorage.app",
  messagingSenderId: "414130592765",
  appId: "1:414130592765:web:ddf0896704bef406741794",
  measurementId: "G-Y4743Q0J73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters to fix COOP issues
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { analytics };
export default app;
