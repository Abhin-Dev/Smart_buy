/**
 * SmartBuy — Firebase Configuration (Frontend)
 * Initializes Firebase app, Auth, and Analytics for the React frontend.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBD2cg93KVAobhbLtmlymAiCrZJli6_kOs",
    authDomain: "smartbuy-33eaf.firebaseapp.com",
    projectId: "smartbuy-33eaf",
    storageBucket: "smartbuy-33eaf.firebasestorage.app",
    messagingSenderId: "977625491620",
    appId: "1:977625491620:web:73007b68893f8ff6a19e31",
    measurementId: "G-5Z3SJT13MS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics — optional, won't break auth if it fails
let analytics = null;
try {
    const { getAnalytics } = await import("firebase/analytics");
    analytics = getAnalytics(app);
} catch (e) {
    console.warn("Firebase Analytics not available:", e.message);
}

export { app, analytics, auth };
