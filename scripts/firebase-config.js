// Firebase Configuration
// Replace these values with your actual Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyDCpnmqfI77LuhAPUeOBbJU99lPyIS52FQ",
  authDomain: "massage2wellness.firebaseapp.com",
  projectId: "massage2wellness",
  storageBucket: "massage2wellness.firebasestorage.app",
  messagingSenderId: "773947597093",
  appId: "1:773947597093:web:28c16f8ddc1c34b696facc"
};

// Initialize Firebase (using global Firebase object from CDN)
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Export for global use
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;