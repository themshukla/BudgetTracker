import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCcUwq2h-u6Q36MhyzyFE6lOfmYlAepAdA",
  authDomain: "budgettracker-bb444.firebaseapp.com",
  projectId: "budgettracker-bb444",
  storageBucket: "budgettracker-bb444.appspot.com",
  messagingSenderId: "877359022917",
  appId: "1:877359022917:android:e1ba7ae16456d6b3fc742c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Function to check Firestore connection
const checkFirestoreConnection = async () => {
  try {
    await getDocs(collection(db, "users"));
    console.log("🔥 Firestore is connected!");
  } catch (error) {
    console.error("❌ Firestore connection failed:", error);
  }
};

// Call the function
checkFirestoreConnection();

export { db, auth };
