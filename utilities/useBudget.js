import { useState, useEffect } from "react";
import { db } from "./firebaseConfig"; // Make sure to import your Firebase configuration

const useBudget = () => {
  const [budgetCards, setBudgetCards] = useState([]);

  // Fetch budget data from Firestore
  const fetchBudgetData = async () => {
    try {
      const snapshot = await db.collection("budget").get();
      const data = snapshot.docs.map((doc) => ({
        id: doc.id, // Save document ID to update/remove later
        ...doc.data(),
      }));
      setBudgetCards(data);
    } catch (error) {
      console.error("Error fetching budget data: ", error);
    }
  };

  useEffect(() => {
    fetchBudgetData(); // Fetch budget data when the component mounts
  }, []);

  // Update a budget item in Firestore
  const updateItem = async (itemId, newData) => {
    try {
      await db.collection("budget").doc(itemId).update(newData);
      // Update local state after Firestore update
      setBudgetCards((prevState) =>
        prevState.map((item) =>
          item.id === itemId ? { ...item, ...newData } : item
        )
      );
    } catch (error) {
      console.error("Error updating budget item: ", error);
    }
  };

  // Remove an item from Firestore
  const removeItem = async (itemId) => {
    try {
      await db.collection("budget").doc(itemId).delete();
      // Update local state after deletion
      setBudgetCards((prevState) =>
        prevState.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error removing budget item: ", error);
    }
  };

  return { budgetCards, updateItem, removeItem };
};

export default useBudget;
