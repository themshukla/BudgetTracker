import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Create context for user information
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { displayName: name, email, photoURL: photo } = user;
        setUserInfo({ name, email, photo });
      } else {
        setUserInfo(null);
      }
      setAuthReady(true); // ✅ mark readiness once auth status is known
    });

    return () => unsubscribe();
  }, []);

  const updateUserInfo = async (info) => {
    setUserInfo(info);
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, authReady }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user context
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  const { userInfo, updateUserInfo, authReady } = context;

  return {
    userInfo,
    updateUserInfo,
    userEmail: userInfo?.email || null,
    isLoggedIn: !!userInfo,
    authReady,
  };
};
