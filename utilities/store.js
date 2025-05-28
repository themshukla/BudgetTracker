// store.js
import { db } from "./firebaseConfig"; // Import the Firestore instance
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayRemove,
  query,
  where,
  arrayUnion,
  deleteField,
} from "firebase/firestore";
import { showToast } from "./toast";
import { v4 as uuidv4 } from "uuid";

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

const addItemToUserBudget = async (docId, itemType, newItem) => {
  try {
    const docRef = doc(db, "budgetData", docId);

    if (itemType === "custom") {
      const path =
        newItem.entryType === "planned"
          ? `budget.custom.cards.${newItem.cardId}.items.planned.${newItem.name}`
          : `budget.custom.cards.${newItem.cardId}.items.spent`;

      if (newItem.entryType === "planned") {
        await updateDoc(docRef, {
          [path]: {
            id: newItem.id,
            planned: newItem.planned,
          },
        });
      } else {
        await updateDoc(docRef, {
          [path]: arrayUnion({
            id: newItem.id,
            amount: newItem.amount,
            category: newItem.category,
            name: newItem.name,
            timestamp: new Date(),
          }),
        });
      }
    } else if (itemType === "standard") {
      const basePath = `budget.standard.cards.${newItem.cardId}.${newItem.section}`;

      if (newItem.entryType === "planned") {
        const plannedPath = `${basePath}.planned.${newItem.name}`;
        await updateDoc(docRef, {
          [plannedPath]: {
            id: newItem.id,
            planned: newItem.planned,
          },
        });
      } else if (newItem.entryType === "spent") {
        const spentPath = `${basePath}.spent`;
        await updateDoc(docRef, {
          [spentPath]: arrayUnion({
            id: newItem.id,
            amount: newItem.amount,
            category: newItem.category,
            name: newItem.name,
            timestamp: new Date(),
          }),
        });
      }
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
      showToast("Document not found or doesn't belong to the user.", "error");
    }
  } catch (error) {
    console.error("Error updating document:", error);
  }
};

const removeItemForUser = async (docId, path, itemToRemove) => {
  try {
    const docRef = doc(db, "budgetData", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn("Document not found.");
      return;
    }

    const isArrayPath = path.endsWith(".spent") || path.includes(".spent");
    const isPlannedObjectPath = path.includes(".planned");

    // ✅ Handle spent array (use arrayRemove)
    if (isArrayPath && itemToRemove?.id) {
      await updateDoc(docRef, {
        [path]: arrayRemove(itemToRemove),
      });
      return;
    }

    // ✅ Handle planned object (use deleteField on full path)
    if (isPlannedObjectPath && itemToRemove?.name) {
      await updateDoc(docRef, {
        [path]: deleteField(),
      });
      return;
    }

    console.warn("Nothing removed. Path or item format may be incorrect.");
  } catch (error) {
    console.error("Error removing item from Firestore:", error);
  }
};

const removeNetworthItemForUser = async (docId, arrayPath, itemId) => {
  try {
    const docRef = doc(db, "budgetData", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn("Document not found.");
      return;
    }

    const currentArray = docSnap.get(arrayPath) || [];
    const updatedArray = currentArray.filter((item) => item.id !== itemId);

    await updateDoc(docRef, {
      [arrayPath]: updatedArray,
    });
  } catch (error) {
    console.error("Error removing net worth item:", error);
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
          id: newCard.id,
          type: "custom",
          items: {
            planned: {},
            spent: [],
          },
        };
        break;

      case "standard":
        cardPath = `budget.standard.cards.${newCard.id}`;
        cardValue = {
          id: newCard.id,
          type: "standard",
          discretionaryItems: {
            planned: {},
            spent: [],
          },
          nonDiscretionaryItems: {
            planned: {},
            spent: [],
          },
        };
        break;

      case "asset":
        cardPath = `networth.asset.cards.${newCard.id}`;
        cardValue = {
          id: newCard.id,
          type: "asset",
          totalNormal: 0,
          totalFixed: 0,
          items: {
            normal: [],
            fixed: [],
          },
        };
        break;

      case "liability":
      default:
        cardPath = `networth.liability.cards.${newCard.id}`;
        cardValue = {
          id: newCard.id,
          type: "liability",
          totalNormal: 0,
          totalFixed: 0,
          items: {
            normal: [],
            longTerm: [],
          },
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
      path = `networth.liability.cards.${cardId}`;
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
    const normalizeNumber = (value) => {
      const n = Number(value);
      return isNaN(n) ? 0 : n;
    };

    const normalizedTransactions = transactionData.map((transaction) => ({
      ...transaction,
      item: {
        ...transaction.item,
        planned: normalizeNumber(transaction.item.planned),
        spent: normalizeNumber(transaction.item.spent),
        amount: normalizeNumber(transaction.item.amount),
        value: normalizeNumber(transaction.item.value),
        category: transaction.item.category || "", // optional safeguard
      },
      timestamp: new Date(),
      restored: false,
      id: transaction.id || `${transaction.item?.id || uuidv4()}-${Date.now()}`,
    }));

    for (const tx of normalizedTransactions) {
      if (!tx.item?.id || !tx.item?.name) continue; // safeguard
      const logRef = doc(
        collection(db, "transactionLogs", userEmail, "logs"),
        tx.id
      );
      await setDoc(logRef, tx);
    }
  } catch (error) {
    console.error("❌ Error storing transaction logs:", error);
  }
};

const fetchAllTransactionLogsForUser = async (userEmail) => {
  try {
    const logsRef = collection(db, "transactionLogs", userEmail, "logs");
    const querySnapshot = await getDocs(logsRef);

    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    return logs;
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return [];
  }
};

const updateItemInDoc = async (data) => {
  const {
    docId,
    rootKey, // "budget" or "networth"
    cardType, // "custom", "standard", "asset", "liability"
    cardId,
    itemId,
    updatedItem,
    section,
    subType,
  } = data;

  try {
    const docRef = doc(db, "budgetData", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return console.warn("❌ Document not found");

    const docData = docSnap.data();
    const cardPath = `${rootKey}.${cardType}.cards.${cardId}`;
    const card = docData?.[rootKey]?.[cardType]?.cards?.[cardId];
    if (!card) return console.warn("❌ Card not found");

    // 🔹 Custom Card
    if (cardType === "custom") {
      const planned = card.items?.planned ?? {};
      const spent = card.items?.spent ?? [];
      const entryType = updatedItem.entryType;

      if (entryType === "planned") {
        const oldKey = Object.keys(planned).find(
          (k) => planned[k].id === itemId
        );

        const deletePath = `${cardPath}.items.planned.${oldKey}`;
        const updatePath = `${cardPath}.items.planned.${updatedItem.name}`;

        await updateDoc(docRef, {
          [deletePath]: deleteField(),
          [updatePath]: {
            id: updatedItem.id,
            planned: updatedItem.planned,
          },
        });
      } else if (entryType === "spent") {
        const newSpentArray = spent.map((item) =>
          item.id === itemId
            ? {
                ...item,
                name: updatedItem.name,
                amount: updatedItem.amount,
                category: updatedItem.category,
              }
            : item
        );
        await updateDoc(docRef, {
          [`${cardPath}.items.spent`]: newSpentArray,
        });
      }
    }

    // 🔹 Standard Card
    else if (cardType === "standard") {
      const sectionData = card?.[section];
      const planned = sectionData?.planned ?? {};
      const spent = sectionData?.spent ?? [];
      const entryType = updatedItem.entryType;

      if (entryType === "planned") {
        const oldKey = Object.keys(planned).find(
          (k) => planned[k].id === itemId
        );
        const deletePath = `${cardPath}.${section}.planned.${oldKey}`;
        const updatePath = `${cardPath}.${section}.planned.${updatedItem.name}`;

        await updateDoc(docRef, {
          [deletePath]: deleteField(),
          [updatePath]: {
            id: updatedItem.id,
            planned: updatedItem.planned,
          },
        });
      } else if (entryType === "spent") {
        const newSpentArray = spent.map((item) =>
          item.id === itemId
            ? {
                ...item,
                name: updatedItem.name,
                amount: updatedItem.amount,
                category: updatedItem.category,
              }
            : item
        );
        await updateDoc(docRef, {
          [`${cardPath}.${section}.spent`]: newSpentArray,
        });
      }
    }

    // 🔹 Net Worth Card (Asset / Liability)
    else if (cardType === "asset" || cardType === "liability") {
      console.log("Updating net worth item...", data);

      const items = card?.items?.[subType] ?? [];

      const updatedArray = items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: updatedItem.name,
              networth: updatedItem.networth,
            }
          : item
      );
      console.log(updatedArray);

      await updateDoc(docRef, {
        [`${cardPath}.items.${subType}`]: updatedArray,
      });
    }
  } catch (error) {
    console.error("🔥 Firestore update failed:", error);
  }
};

const addItemToUserNetworth = async (docId, card, itemType, newItem) => {
  try {
    const docRef = doc(db, "budgetData", docId);
    const cardPath = `networth.${card.type}.cards.${card.id}.items.${itemType}`;

    const itemToAdd = {
      id: newItem.id,
      name: newItem.name,
      networth: parseFloat(newItem.networth),
      timestamp: new Date(),
    };

    const docSnap = await getDoc(docRef);
    const existingItems = docSnap.get(cardPath) || [];

    const updatedArray = [...existingItems, itemToAdd];

    await updateDoc(docRef, {
      [cardPath]: updatedArray,
    });
  } catch (error) {
    console.error("Error adding item to user net worth:", error);
  }
};

const restoreItemFromLog = async (docId, logItemId, userEmail) => {
  try {
    const logRef = doc(db, "transactionLogs", userEmail, "logs", logItemId);
    const logSnap = await getDoc(logRef);

    if (!logSnap.exists()) {
      showToast("Log item not found.", "warning");
      return { success: false, reason: "log_not_found" };
    }

    const logItem = logSnap.data();
    const {
      item,
      cardType,
      cardId,
      section,
      entryType,
      categoryType,
      restored,
    } = logItem;

    if (restored) {
      showToast("Item already restored. Skipping.", "warning");
      return { success: false, reason: "already_restored" };
    }

    const userDocRef = doc(db, "budgetData", docId);
    const userDocSnap = await getDoc(userDocRef);
    const data = userDocSnap.data();

    // 🔍 Manually check if the card exists (deep path)
    const cardExists =
      cardType === "custom"
        ? !!data?.budget?.custom?.cards?.[cardId]
        : cardType === "standard"
        ? !!data?.budget?.standard?.cards?.[cardId]
        : !!data?.networth?.[cardType]?.cards?.[cardId];

    if (!cardExists) {
      showToast("The card for this item no longer exists.", "warning");
      return { success: false, reason: "missing_card" };
    }

    // 🛡️ Sanitize key for Firestore
    const safeName = item.name.replace(/[.#$/[\]]/g, "_");

    // ─── CUSTOM BUDGET ───
    if (cardType === "custom") {
      const path =
        entryType === "planned"
          ? `budget.custom.cards.${cardId}.items.planned.${safeName}`
          : `budget.custom.cards.${cardId}.items.spent`;

      if (entryType === "planned") {
        await updateDoc(userDocRef, {
          [path]: {
            id: item.id,
            planned: item.planned,
          },
        });
      } else {
        const existing =
          data?.budget?.custom?.cards?.[cardId]?.items?.spent || [];
        const alreadyExists = existing.some((i) => i.id === item.id);
        if (!alreadyExists) {
          await updateDoc(userDocRef, {
            [path]: arrayUnion({
              id: item.id,
              amount: item.amount,
              category: item.category,
              name: item.name,
              timestamp: new Date(),
            }),
          });
        }
      }
    }

    // ─── STANDARD BUDGET ───
    else if (cardType === "standard") {
      const basePath = `budget.standard.cards.${cardId}.${section}`;

      if (entryType === "planned") {
        const plannedPath = `${basePath}.planned.${safeName}`;
        await updateDoc(userDocRef, {
          [plannedPath]: {
            id: item.id,
            planned: item.planned,
          },
        });
      } else {
        const spentPath = `${basePath}.spent`;
        const existing =
          data?.budget?.standard?.cards?.[cardId]?.[section]?.spent || [];
        const alreadyExists = existing.some((i) => i.id === item.id);
        if (!alreadyExists) {
          await updateDoc(userDocRef, {
            [spentPath]: arrayUnion({
              id: item.id,
              amount: item.amount,
              category: item.category,
              name: item.name,
              timestamp: new Date(),
            }),
          });
        }
      }
    }

    // ─── NET WORTH ───
    else if (cardType === "asset" || cardType === "liability") {
      const itemType =
        categoryType === "fixed" || categoryType === "longTerm"
          ? categoryType
          : "normal";

      const path = `networth.${cardType}.cards.${cardId}.items.${itemType}`;
      const existing =
        data?.networth?.[cardType]?.cards?.[cardId]?.items?.[itemType] || [];
      const alreadyExists = existing.some((i) => i.id === item.id);

      if (!alreadyExists) {
        const updatedArray = [
          ...existing,
          {
            id: item.id,
            name: item.name,
            networth: parseFloat(item.value ?? item.networth ?? 0),
            timestamp: new Date(),
          },
        ];

        await updateDoc(userDocRef, {
          [path]: updatedArray,
        });
      }
    }

    // ✅ Mark the log as restored (and wait before showing toast)
    try {
      await updateDoc(logRef, { restored: true });
      showToast("Item restored successfully!", "success");
      return { success: true, restoredId: item.id };
    } catch (logError) {
      console.error("❌ Failed to mark log as restored:", logError);
      showToast("Item restored, but log update failed.", "warning");
      return { success: true, restoredId: item.id, logRestored: false };
    }
  } catch (error) {
    console.error("❌ Failed to restore item:", error);
    showToast("Failed to restore item.", "error");
    return { success: false, reason: "error", error };
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
  addItemToUserNetworth,
  removeNetworthItemForUser,
  restoreItemFromLog,
};
