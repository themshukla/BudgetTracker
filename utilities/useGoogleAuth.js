import { useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth, db } from "./firebaseConfig";
import { useUser } from "./userProvider";
import { createDocumentForUser } from "./store";
import { showToast } from "./toast";

export const useGoogleAuth = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUserInfo } = useUser();

  const ensureUserDocument = async (email, userData) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    let docId;

    if (querySnapshot.empty) {
      // Add user metadata to 'users' collection
      await addDoc(usersRef, userData);

      // Create budgetData doc and return its ID
      const newDocRef = await createDocumentForUser(email, {
        income: "50000",

        budget: {
          custom: {
            cards: {},
          },

          standard: {
            cards: {},
          },
        },

        networth: {
          asset: {
            cards: {},
          },

          liability: {
            cards: {},
          },
        },
      });

      docId = newDocRef.id;
    } else {
      const budgetQuery = query(
        collection(db, "budgetData"),
        where("userEmail", "==", email)
      );
      const budgetSnapshot = await getDocs(budgetQuery);

      if (!budgetSnapshot.empty) {
        docId = budgetSnapshot.docs[0].id;
      } else {
        console.warn("⚠️ No budgetData doc found — creating a new one...");
        const newDocRef = await createDocumentForUser(email, {
          income: "",
          budget: {
            custom: { cards: {} },
            standard: { cards: {} },
          },
          networth: {
            asset: { cards: {} },
            debt: { cards: {} },
          },
        });
        docId = newDocRef.id;
      }
    }

    const enhancedUserData = { ...userData, docId };
    updateUserInfo(enhancedUserData);
    await AsyncStorage.setItem("userInfo", JSON.stringify(enhancedUserData));
    await AsyncStorage.setItem("currentUserDocId", JSON.stringify(docId));

    return docId;
  };

  const signin = async () => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_CLIENT_ID,
    });

    try {
      setError(null);
      await GoogleSignin.hasPlayServices();
      const googleUser = await GoogleSignin.signIn();

      if (!googleUser?.data && googleUser.type === "cancelled") {
        showToast("Google Sign-In failed", "info");
        return;
      }

      const { idToken } = await GoogleSignin.getTokens();
      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(
        auth,
        credential
      );
      const { user } = firebaseUserCredential;
      const { displayName: name, email, photoURL: photo } = user;

      const userData = { name, email, photo };
      await ensureUserDocument(email, userData); // userInfo set here

      showToast("Logged in successfully", "success");
    } catch (e) {
      setError(e);
      console.error("Google Sign-In Error:", e);
    }
  };

  const loginWithEmail = async (email, password) => {
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );
      const { user } = userCredential;
      const { displayName: name, email, photoURL: photo } = user;

      const userData = { name: name || "User", email, photo: photo || null };
      await ensureUserDocument(email, userData); // userInfo set here

      showToast("Logged in successfully", "success");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("currentUserDocId");
      updateUserInfo(null);
      showToast("Logged out successfully", "success");
    } catch (e) {
      setError(e);
      console.error("Logout Error:", e);
    }
  };

  return {
    signin,
    loginWithEmail,
    logout,
    error,
    loading,
  };
};
