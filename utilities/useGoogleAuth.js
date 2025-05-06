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
            cards: {
              "monthly-budget": {
                id: "monthly-budget",
                type: "custom",
                items: {
                  planned: {
                    groceries: { id: "groceries", planned: 300 },
                    transport: { id: "transport", planned: 150 },
                    rent: { id: "rent", planned: 1200 },
                  },
                  spent: [
                    {
                      id: "s1",
                      category: "groceries",
                      amount: 75,
                      name: "Sams Club",
                    },
                    {
                      id: "s2",
                      category: "transport",
                      amount: 40,
                      name: "Uber",
                    },
                    {
                      id: "s3",
                      category: "rent",
                      amount: 1200,
                      name: "Landlord",
                    },
                  ],
                },
              },
            },
          },

          standard: {
            cards: {
              "weekly-budget": {
                id: "weekly-budget",
                type: "standard",
                discretionaryItems: {
                  planned: {
                    fuel: { id: "fuel", planned: 60 },
                    snacks: { id: "snacks", planned: 50 },
                  },
                  spent: [
                    { id: "s4", category: "fuel", amount: 30, name: "Shell" },
                    {
                      id: "s5",
                      category: "snacks",
                      amount: 20,
                      name: "7-Eleven",
                    },
                  ],
                },
                nonDiscretionaryItems: {
                  planned: {
                    groceries: { id: "groceries", planned: 300 },
                    transport: { id: "transport", planned: 150 },
                  },
                  spent: [
                    {
                      id: "s6",
                      category: "groceries",
                      amount: 75,
                      name: "Sams Club",
                    },
                    {
                      id: "s7",
                      category: "transport",
                      amount: 40,
                      name: "Uber",
                    },
                  ],
                },
              },
            },
          },
        },

        networth: {
          asset: {
            cards: {
              "personal-assets": {
                id: "personal-assets",
                type: "asset",
                totalNormal: 20000,
                totalFixed: 35000,
                items: {
                  normal: [
                    { id: "a1", name: "Phone", networth: 800 },
                    { id: "a2", name: "Laptop", networth: 1200 },
                  ],
                  fixed: [
                    { id: "a3", name: "Car", networth: 15000 },
                    { id: "a4", name: "House", networth: 20000 },
                  ],
                },
              },
            },
          },

          liability: {
            cards: {
              "personal-liabilities": {
                id: "personal-liabilities",
                type: "liability",
                totalNormal: 5000,
                totalFixed: 10000,
                items: {
                  normal: [{ id: "l1", name: "Credit Card", networth: 3000 }],
                  fixed: [{ id: "l2", name: "Car Loan", networth: 10000 }],
                },
              },
            },
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

    // ✅ Store in context and AsyncStorage
    const enhancedUserData = { ...userData, docId };
    updateUserInfo(enhancedUserData);
    await AsyncStorage.setItem("userInfo", JSON.stringify(enhancedUserData));
    await AsyncStorage.setItem("currentUserDocId", docId);

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
