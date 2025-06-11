import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAhMPLGUWcrRfDjS5NcdG1M5dnbr43BUmo",
  authDomain: "budget-tracker-973da.firebaseapp.com",
  projectId: "budget-tracker-973da",
  storageBucket: "budget-tracker-973da.firebasestorage.app",
  messagingSenderId: "1095483865963",
  appId: "1:1095483865963:ios:9cecdd01095c182d5f6a2e",
  measurementId: "G-FW0YV3ZCF1",
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
