// store.js
import { db } from "./firebaseConfig"; // Import the Firestore instance
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  deleteField,
} from "firebase/firestore";

// Create a new document for a user
const createDocumentForUser = async (userEmail, newData) => {
  try {
    const newDocRef = doc(collection(db, "budgetData"));
    const documentData = { userEmail, ...newData };
    await setDoc(newDocRef, documentData);
    return newDocRef;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

const fetchBudgetDataForUser = async (userEmail) => {
  try {
    // Create a query to fetch documents matching the user's email
    const q = query(
      collection(db, "budgetData"),
      where("userEmail", "==", userEmail)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const addItemToUserBudget = async (userEmail, docId, newItem, itemType) => {
  try {
    // Create a query to fetch the document for the specific user and document ID
    const q = query(
      collection(db, "budgetData"),
      where("userEmail", "==", userEmail),
      where("__name__", "==", docId) // Query for the specific document ID
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    // Get the reference of the document
    const docRef = querySnapshot.docs[0]; // Get the first match (should only be one)

    // Create the new data structure based on the itemType and categoryType
    let fieldPath = "";
    if (itemType === "discretionary") {
      fieldPath = "budget.standard.discretionary";
    } else if (itemType === "nonDiscretionary") {
      fieldPath = "budget.standard.nonDiscretionary";
    } else if (itemType === "custom") {
      if (newItem.type === "planned") {
        fieldPath = `budget.custom.cards.${newItem.cardId}.planned.${newItem.name}`;
        await updateDoc(docRef.ref, {
          [fieldPath]: {
            id: newItem.id,
            planned: newItem.planned,
          },
        });
      } else if (newItem.type === "spent") {
        fieldPath = `budget.custom.cards.${newItem.cardId}.spent`;
        await updateDoc(docRef.ref, {
          [fieldPath]: arrayUnion({
            id: newItem.id,
            amount: newItem.amount,
            category: newItem.category,
            note: newItem.note || "",
            timestamp: new Date(),
          }),
        });
      }
    }

    if (fieldPath) {
      // Add the new item to the correct field using arrayUnion to avoid duplicates
      await updateDoc(docRef.ref, {
        [fieldPath]: arrayUnion(newItem),
      });
    } else {
      console.log("Invalid itemType or categoryType.");
    }
  } catch (error) {
    console.error("Error adding item to user budget:", error);
  }
};

const updateDocumentForUser = async (userEmail, docId, updatedData) => {
  try {
    // Create a query to fetch the document for the specific user and document ID
    const q = query(
      collection(db, "budgetData"),
      where("userEmail", "==", userEmail),
      where("__name__", "==", docId) // Query for the specific document ID as well
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      const docRef = querySnapshot.docs[0]; // Get the first match (should only be one)
      await updateDoc(docRef.ref, updatedData);
    } else {
      console.log("Document not found or doesn't belong to the user.");
    }
  } catch (error) {
    console.error("Error updating document:", error);
  }
};

const removeItemForUser = async (docId, path, itemKey) => {
  try {
    const docRef = doc(db, "budgetData", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const pathSegments = path.split(".");

      let current = data;
      for (let i = 0; i < pathSegments.length - 1; i++) {
        current = current[pathSegments[i]];
        if (!current) throw new Error("Invalid path in Firestore structure");
      }

      const lastSegment = pathSegments[pathSegments.length - 1];

      if (Array.isArray(current[lastSegment])) {
        // For spent array: remove by id
        current[lastSegment] = current[lastSegment].filter(
          (item) => item.id !== itemKey
        );
        await updateDoc(docRef, data);
      } else if (current[lastSegment]?.[itemKey]) {
        // For planned object: delete by key
        delete current[lastSegment][itemKey];
        await updateDoc(docRef, data);
      } else {
        console.warn("Item not found in Firestore document.");
      }
    } else {
      console.warn("Document not found.");
    }
  } catch (error) {
    console.error("Error removing item from Firestore:", error);
  }
};

const addCardToFirestore = async (newCard, docId, cardType) => {
  try {
    const docRef = doc(db, "budgetData", docId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      console.warn("Document not found!");
      return;
    }

    let cardPath;
    let cardValue;

    switch (cardType) {
      case "custom":
        cardPath = `budget.custom.cards.${newCard.id}`;
        cardValue = {
          planned: {},
          spent: [],
        };
        break;

      case "standard":
        cardPath = `budget.standard.cards.${newCard.id}`;
        cardValue = {
          discretionary: {},
          nonDiscretionary: {},
        };
        break;

      case "asset":
        cardPath = `networth.asset.cards.${newCard.id}`;
        cardValue = {
          fixed: {},
          normal: {},
        };
        break;

      case "liability":
      default:
        cardPath = `networth.liability.cards.${newCard.id}`;
        cardValue = {
          normal: {},
          longTerm: {},
        };
        break;
    }

    await updateDoc(docRef, {
      [cardPath]: cardValue,
    });
  } catch (error) {
    console.error("❌ Error adding card to Firestore:", error);
  }
};

const removeCardFromFirestore = async (docId, cardType, cardId) => {
  try {
    const docRef = doc(db, "budgetData", docId);

    let path = "";

    if (cardType === "custom") {
      path = `budget.custom.cards.${cardId}`;
    } else if (cardType === "standard") {
      path = `budget.standard.cards.${cardId}`;
    } else if (cardType === "asset") {
      path = `networth.asset.cards.${cardId}`;
    } else if (cardType === "liability") {
      path = `networth.debt.cards.${cardId}`;
    } else {
      throw new Error("Invalid card type.");
    }

    await updateDoc(docRef, {
      [path]: deleteField(),
    });
  } catch (error) {
    console.error("Error removing card from Firestore:", error);
  }
};

const storeTransactionLog = async (userEmail, transactionData) => {
  try {
    // Get reference to the user's document in the Firestore collection
    const userRef = doc(db, "transactionLogs", userEmail);

    // Check if the document exists
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // If the document does not exist, create it with an empty 'logs' array
      await setDoc(userRef, {
        logs: [],
      });
    }

    // Normalize the transaction data to ensure planned and spent are numbers
    const normalizedTransactionData = transactionData.map((transaction) => ({
      ...transaction,
      item: {
        ...transaction.item,
        planned: Number(transaction.item.planned),
        spent: Number(transaction.item.spent),
      },
      timestamp: new Date(), // Add current timestamp to each transaction
    }));

    // Update the user's document with the new transaction logs
    await updateDoc(userRef, {
      logs: arrayUnion(...normalizedTransactionData), // Use arrayUnion to add new logs without duplicating existing ones
    });
  } catch (error) {
    console.error("Error adding transaction log:", error);
  }
};

const fetchAllTransactionLogsForUser = async (userEmail) => {
  try {
    const docRef = doc(db, "transactionLogs", userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.logs || []; // assuming logs are stored under a "logs" array
    } else {
      console.warn("No transaction log found for user:", userEmail);
      return [];
    }
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return [];
  }
};

const updateItemInDoc = async (userEmail, data) => {
  const { docId, rootKey, cardType, cardId, itemId, updatedItem } = data;

  try {
    const docRef = doc(db, "budgetData", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn("Document not found");
      return;
    }

    const docData = docSnap.data();
    const cards = docData?.[rootKey]?.[cardType]?.cards;
    const card = cards?.[cardId];

    if (!card) {
      console.warn("Card not found");
      return;
    }

    const { name, ...itemWithoutName } = updatedItem;

    if (cardType === "custom") {
      // Direct lookup under card
      for (const [itemKey, itemValue] of Object.entries(card)) {
        if (itemValue?.id === itemId) {
          const deletePath = `${rootKey}.${cardType}.cards.${cardId}.${itemKey}`;
          const updatePath = `${rootKey}.${cardType}.cards.${cardId}.${name}`;

          await updateDoc(docRef, {
            [deletePath]: deleteField(),
            [updatePath]: itemWithoutName,
          });

          return;
        }
      }
    } else {
      // Need one extra loop: category → item
      for (const [categoryKey, categoryItems] of Object.entries(card)) {
        for (const [itemKey, itemValue] of Object.entries(categoryItems)) {
          if (itemValue?.id === itemId) {
            const deletePath = `${rootKey}.${cardType}.cards.${cardId}.${categoryKey}.${itemKey}`;
            const updatePath = `${rootKey}.${cardType}.cards.${cardId}.${categoryKey}.${name}`;

            await updateDoc(docRef, {
              [deletePath]: deleteField(),
              [updatePath]: itemWithoutName,
            });
            return;
          }
        }
      }
    }

    console.warn("Item not found in card");
  } catch (error) {
    console.error("Firestore update error:", error);
  }
};

export {
  createDocumentForUser,
  fetchBudgetDataForUser,
  addItemToUserBudget,
  updateDocumentForUser,
  removeItemForUser,
  addCardToFirestore,
  removeCardFromFirestore,
  storeTransactionLog,
  fetchAllTransactionLogsForUser,
  updateItemInDoc,
};
