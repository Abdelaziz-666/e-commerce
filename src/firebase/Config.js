import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyA1QDdKpdklqeqVQJ8L3UZGom5SmgTRUPs",
    authDomain: "tester-7ac74.firebaseapp.com",
    projectId: "tester-7ac74",
    storageBucket: "tester-7ac74.firebasestorage.app",
    messagingSenderId: "76016402147",
    appId: "1:76016402147:web:d4d7cd5dd8eaba56de0fd6",
    measurementId: "G-KXH15Y5JDK"
  };
  const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

