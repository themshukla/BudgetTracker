import {
  FlatList,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useEffect, useRef } from "react";
import React, { useState } from "react";
import Header from "../../../components/Header";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ItemsInputModal from "../../../components/ItemsInputModal";
import CustomCard from "../../../components/CustomCard";
import StandardCard from "../../../components/StandardCard";
import styles from "../../../utilities/styles";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import {
  fetchBudgetDataForUser,
  addCardToFirestore,
  updateDocumentForUser,
  removeItemForUser,
  removeCardFromFirestore,
  storeTransactionLog,
  updateItemInDoc,
} from "../../../utilities/store";
import uuid from "react-native-uuid";
import { useUser } from "../../../utilities/userProvider";
import { showToast } from "../../../utilities/toast";
import { router } from "expo-router";
import Spinner from "../../../utilities/spinner";
import AddCardGrid from "../../../utilities/addCardGrid";

const Budget = () => {
  const [cards, setCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [planned, setPlanned] = useState(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [networth, setNetworth] = useState("");
  const [currentCardId, setCurrentCardId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [itemType, setItemType] = useState(null);
  const [cardChanges, setCardChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    name: "",
    planned: "",
    category: "",
    spent: "",
    remaining: "",
  });
  const currentDocIdRef = useRef(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [categories, setCategories] = useState([]);

  const budgetCardTypes = [
    {
      type: "custom",
      key: "custom",
      label: "Custom Budget",
      icon: <AntDesign name="form" size={24} color="#BA9731" />,
    },
    {
      type: "standard",
      key: "discretionary",
      label: "Discretionary Budget",
      icon: <MaterialIcons name="local-dining" size={26} color="#BA9731" />,
    },
    {
      type: "standard",
      key: "nonDiscretionary",
      label: "Non-Discretionary Budget",
      icon: <MaterialIcons name="home-work" size={26} color="#BA9731" />,
    },
  ];
  const [note, setNote] = useState("");
  const [itemFormType, setItemFormType] = useState("planned");

  const { userEmail, isLoggedIn, userInfo } = useUser();
  const currentDocId = userInfo?.docId;
  const currentCard = cards.find((c) => c.id === currentCardId);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/AuthScreen");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isLoggedIn) {
          setLoading(true);
          const data = await fetchBudgetDataForUser(userEmail);

          if (data && data.length > 0 && data[0]) {
            const transformedData = formatBudgetData(data[0]);
            setCards(transformedData);
            console.log("Transformed Data:", transformedData);
            setIsDataReady(true);
          } else {
            console.log(data);

            console.log("No budget data found for user.");
            setCards([]);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  setTimeout(() => {
    if (cardChanges.length > 5) {
      storeTransactionLog(userEmail, cardChanges);
      setCardChanges([]);
    }
  }, 1500);

  const convertArrayToObject = (arr) => {
    return arr.reduce((acc, item) => {
      acc[item.name] = {
        id: item.id,
        planned: item.planned,
        spent: item.spent,
      };
      return acc;
    }, {});
  };

  const recalculateTotal = (card) => {
    if (card.type === "custom") {
      const total = card.parsedItems.reduce(
        (acc, item) => {
          const planned = Number(item.planned);
          const spent = Number(item.spent);
          acc.totalPlanned += planned;
          acc.totalSpent += spent;
          acc.totalRemaining += planned - spent;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );
      return total;
    } else if (card.type === "standard") {
      const discretionaryArray = Object.values(card.items.discretionary ?? {});
      const nonDiscretionaryArray = Object.values(
        card.items.nonDiscretionary ?? {}
      );

      const discretionaryTotal = discretionaryArray.reduce(
        (acc, item) => {
          const planned = Number(item.planned);
          const spent = Number(item.spent);
          acc.totalPlanned += planned;
          acc.totalSpent += spent;
          acc.totalRemaining += planned - spent;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );

      const nonDiscretionaryTotal = nonDiscretionaryArray.reduce(
        (acc, item) => {
          const planned = Number(item.planned);
          const spent = Number(item.spent);
          acc.totalPlanned += planned;
          acc.totalSpent += spent;
          acc.totalRemaining += planned - spent;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );

      return {
        totalDiscretionaryPlanned: discretionaryTotal.totalPlanned,
        totalDiscretionarySpent: discretionaryTotal.totalSpent,
        totalDiscretionaryRemaining: discretionaryTotal.totalRemaining,
        totalNonDiscretionaryPlanned: nonDiscretionaryTotal.totalPlanned,
        totalNonDiscretionarySpent: nonDiscretionaryTotal.totalSpent,
        totalNonDiscretionaryRemaining: nonDiscretionaryTotal.totalRemaining,
      };
    }

    return {};
  };

  const formatBudgetData = (data) => {
    const { income, budget } = data;
    const customCards = budget.custom.cards ?? {};
    const standardCards = budget.standard.cards ?? {};
    let cards = [];

    const parseCardItems = (planned = {}, spent = []) => {
      return Object.entries(planned).map(([category, p]) => {
        const totalSpent = spent
          .filter((entry) => entry.category === category)
          .reduce((sum, entry) => sum + entry.amount, 0);

        return {
          id: p.id,
          name: category,
          planned: p.planned,
          spent: totalSpent,
          remaining: p.planned - totalSpent,
        };
      });
    };

    const customItems = Object.entries(customCards).map(([key, value]) => {
      const { items = {} } = value;
      const planned = items.planned ?? {};
      const spent = items.spent ?? [];

      const parsedItems = parseCardItems(planned, spent);

      const totals = parsedItems.reduce(
        (acc, item) => {
          acc.totalPlanned += item.planned;
          acc.totalSpent += item.spent;
          acc.totalRemaining += item.remaining;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );

      return {
        id: key,
        type: "custom",
        items: { planned, spent },
        parsedItems,
        income,
        ...totals,
      };
    });

    const standardItems = Object.entries(standardCards).map(([key, value]) => {
      const discretionaryPlanned = value?.discretionaryItems?.planned ?? {};
      const discretionarySpent = value?.discretionaryItems?.spent ?? [];
      const nonDiscretionaryPlanned =
        value?.nonDiscretionaryItems?.planned ?? {};
      const nonDiscretionarySpent = value?.nonDiscretionaryItems?.spent ?? [];

      // Fallback: handle legacy flat items
      const fallbackPlanned = value?.items?.planned ?? {};
      const fallbackSpent = value?.items?.spent ?? [];

      const isLegacyFormat =
        Object.keys(discretionaryPlanned).length === 0 &&
        Object.keys(nonDiscretionaryPlanned).length === 0;

      const parsedItems = [];

      const parse = (planned, spent) =>
        Object.entries(planned).map(([category, p]) => {
          const totalSpent = spent
            .filter((entry) => entry.category === category)
            .reduce((sum, entry) => sum + entry.amount, 0);

          return {
            id: p.id,
            name: category,
            planned: p.planned,
            spent: totalSpent,
            remaining: p.planned - totalSpent,
          };
        });

      const discretionaryParsed = isLegacyFormat
        ? parse(fallbackPlanned, fallbackSpent)
        : parse(discretionaryPlanned, discretionarySpent);

      const nonDiscretionaryParsed = isLegacyFormat
        ? []
        : parse(nonDiscretionaryPlanned, nonDiscretionarySpent);

      const discretionaryTotal = discretionaryParsed.reduce(
        (acc, item) => {
          acc.totalPlanned += item.planned;
          acc.totalSpent += item.spent;
          acc.totalRemaining += item.remaining;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );

      const nonDiscretionaryTotal = nonDiscretionaryParsed.reduce(
        (acc, item) => {
          acc.totalPlanned += item.planned;
          acc.totalSpent += item.spent;
          acc.totalRemaining += item.remaining;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );

      return {
        id: key,
        type: "standard",
        discretionaryItems: {
          planned: isLegacyFormat ? fallbackPlanned : discretionaryPlanned,
          spent: isLegacyFormat ? fallbackSpent : discretionarySpent,
        },
        nonDiscretionaryItems: {
          planned: isLegacyFormat ? {} : nonDiscretionaryPlanned,
          spent: isLegacyFormat ? [] : nonDiscretionarySpent,
        },
        income,
        totalDiscretionaryPlanned: discretionaryTotal.totalPlanned,
        totalDiscretionarySpent: discretionaryTotal.totalSpent,
        totalDiscretionaryRemaining: discretionaryTotal.totalRemaining,
        totalNonDiscretionaryPlanned: nonDiscretionaryTotal.totalPlanned,
        totalNonDiscretionarySpent: nonDiscretionaryTotal.totalSpent,
        totalNonDiscretionaryRemaining: nonDiscretionaryTotal.totalRemaining,
      };
    });

    cards.push(...customItems, ...standardItems);
    return cards;
  };

  const updateItemInFirestore = async (item) => {
    await updateItemInDoc(userEmail, item);
  };

  const handleSave = () => {
    console.log("Saving item...", planned, spent, name, category);

    setErrors({
      name: "",
      planned: "",
      spent: "",
      category: "",
      networth: "",
    });

    let hasError = false;

    // Basic validations
    if (modalType === "asset" || modalType === "liability") {
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required." }));
        hasError = true;
      }
      if (!isNumeric(networth)) {
        setErrors((prev) => ({
          ...prev,
          networth: "Please enter a valid number.",
        }));
        hasError = true;
      }
    } else if (itemFormType === "planned") {
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required." }));
        hasError = true;
      }
      if (!isNumeric(planned)) {
        setErrors((prev) => ({
          ...prev,
          planned: "Please enter a valid number.",
        }));
        hasError = true;
      }
    } else if (itemFormType === "spent") {
      if (!category) {
        setErrors((prev) => ({
          ...prev,
          category: "Please select a category.",
        }));
        hasError = true;
      }
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required." }));
        hasError = true;
      }
      if (!isNumeric(spent)) {
        setErrors((prev) => ({
          ...prev,
          spent: "Please enter a valid number.",
        }));
        hasError = true;
      }
    }

    if (hasError) return;

    if (modalEditMode) {
      const currentCard = cards.find((card) => card.id === currentCardId);
      if (!currentCard) return;

      const editedItem = {
        ...currentEditedItem,
        name,
        planned: parseFloat(planned),
        spent: parseFloat(spent),
      };

      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id !== currentCardId) return card;

          let updatedItems;
          if (currentCard.type === "custom") {
            updatedItems = card.items.map((item) =>
              item.id === currentEditedItem.id ? editedItem : item
            );
          } else {
            const updatedSection = card.items[itemType].map((item) =>
              item.id === currentEditedItem.id ? editedItem : item
            );

            updatedItems = {
              ...card.items,
              [itemType]: updatedSection,
            };
          }

          const updatedCard = {
            ...card,
            items: updatedItems,
          };

          const totals = recalculateTotal(updatedCard);

          return {
            ...updatedCard,
            ...totals,
          };
        })
      );

      setCardChanges((prev) => [
        ...prev,
        {
          type: "edited",
          item: editedItem,
          itemType:
            currentCard.type === "standard"
              ? `budget.standard.${itemType}`
              : "budget.custom",
          timestamp: Date.now(),
          month: new Date().toLocaleString("default", { month: "short" }),
        },
      ]);

      updateItemInFirestore({
        docId: currentDocId,
        rootKey: "budget",
        cardType: currentCard.type,
        cardId: currentCardId,
        itemId: editedItem.id,
        updatedItem: {
          id: editedItem.id,
          name: editedItem.name,
          planned: editedItem.planned,
          spent: editedItem.spent,
        },
      });

      showToast("Item updated successfully!", "success");
      setModalEditMode(false);
      setCurrentEditedItem(null);
    } else {
      if (modalType === "asset" || modalType === "liability") {
        // (Optional) Save logic for networth-based items
      } else if (itemFormType === "planned") {
        addItem(currentCardId, {
          name,
          planned: parseFloat(planned),
          entryType: "planned",
        });
      } else if (itemFormType === "spent") {
        addItem(currentCardId, {
          category,
          name,
          amount: parseFloat(spent),
          name,
          entryType: "spent",
        });
      }
    }

    setModalVisible(false);
    setCurrentCardId(null);
    Keyboard.dismiss();
    setName("");
    setPlanned("");
    setSpent("");
    setCategory("");
    setNote("");
  };

  const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  };

  const addCard = async (cardType) => {
    if (!currentDocId) {
      console.warn("❌ Cannot add card: currentDocId is null");
      showToast(
        "Something went wrong. Please wait a moment and try again.",
        "error"
      );
      return;
    }

    const newCard = {
      id: uuid.v4(),
      income: "",
      type: cardType,
      items:
        cardType === "custom"
          ? []
          : {
              discretionary: {},
              nonDiscretionary: {},
            },
    };

    try {
      setCards((prevCards) => [...prevCards, newCard]);

      await addCardToFirestore(newCard, currentDocId, cardType);

      showToast("Card added successfully!", "success");
    } catch (error) {
      showToast("Failed to add card. Please try again.", "error");
    }
  };

  const removeCard = (id, type) => {
    setCards(cards.filter((card) => card.id !== id));
    removeCardFromFirestore(currentDocId, type, id);
    showToast("Card removed successfully!", "success");
  };

  const updateIncome = (id, income) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === id ? { ...card, income } : card))
    );
    showToast("Income updated successfully!", "success");
  };

  const addItem = async (currentCardId, newItem) => {
    console.log("Adding item...", newItem);

    const card = cards.find((c) => c.id === currentCardId);
    if (!card) return;

    const cardType = card.type;
    const itemKey = newItem.name;
    const newItemId = uuid.v4();
    const entryType = newItem.entryType; // "planned" or "spent"

    let path;
    let firestorePayload;

    if (cardType === "standard") {
      path = `budget.standard.cards.${currentCardId}.${itemType}.${itemKey}`;

      const updatedItem = {
        id: newItemId,
        name: itemKey,
        planned: parseFloat(newItem.planned),
        spent: parseFloat(newItem.spent),
        remaining: parseFloat(newItem.planned) - parseFloat(newItem.spent),
      };

      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id !== currentCardId) return card;

          const originalItemMap = Array.isArray(card.items[itemType])
            ? convertArrayToObject(card.items[itemType])
            : { ...card.items[itemType] };

          const updatedItemMap = {
            ...originalItemMap,
            [itemKey]: {
              id: newItemId,
              planned: updatedItem.planned,
              spent: updatedItem.spent,
            },
          };

          const updatedItemArray = Object.entries(updatedItemMap).map(
            ([name, item]) => ({
              id: item.id,
              name,
              planned: item.planned,
              spent: item.spent,
              remaining: item.planned - item.spent,
            })
          );

          const updatedItems = {
            ...card.items,
            [itemType]: updatedItemArray,
          };

          const totals = recalculateTotal({ ...card, items: updatedItems });

          return {
            ...card,
            items: updatedItems,
            ...totals,
          };
        })
      );

      firestorePayload = {
        planned: newItem.planned,
        spent: newItem.spent,
        id: newItemId,
      };
    } else {
      if (entryType === "planned") {
        path = `budget.custom.cards.${currentCardId}.planned.${itemKey}`;
        firestorePayload = {
          id: newItemId,
          planned: parseFloat(newItem.planned),
        };

        setCards((prevCards) =>
          prevCards.map((card) => {
            if (card.id !== currentCardId) return card;

            const updatedPlanned = {
              ...card.items.planned,
              [itemKey]: firestorePayload,
            };

            const updatedItems = {
              ...card.items,
              planned: updatedPlanned,
            };

            return {
              ...card,
              items: updatedItems,
            };
          })
        );
      } else if (entryType === "spent") {
        path = `budget.custom.cards.${currentCardId}.spent`;

        firestorePayload = {
          id: newItemId,
          category: newItem.category,
          amount: parseFloat(newItem.amount),
          name: newItem.name || "",
          timestamp: new Date(),
        };

        setCards((prevCards) =>
          prevCards.map((card) => {
            if (card.id !== currentCardId) return card;

            const updatedSpent = [
              ...(card.items.spent || []),
              firestorePayload,
            ];

            const updatedItems = {
              ...card.items,
              spent: updatedSpent,
            };

            return {
              ...card,
              items: updatedItems,
            };
          })
        );
      }
    }

    // 🔁 Firestore update
    await updateDocumentForUser(userEmail, currentDocId, {
      [path]:
        entryType === "spent" ? arrayUnion(firestorePayload) : firestorePayload,
    });

    // 📝 Log
    setCardChanges((prev) => [
      ...prev,
      {
        type: "added",
        item: firestorePayload,
        itemType: path,
        timestamp: Date.now(),
        month: new Date().toLocaleString("default", { month: "short" }),
      },
    ]);

    setItemType(null);
    showToast("Item added successfully!", "success");
  };

  const removeItem = async (cardId, itemId) => {
    const currentCard = cards.find((card) => card.id === cardId);
    const currentCardType = currentCard?.type;

    let itemToRemove;
    let itemTypePath;

    if (currentCardType === "standard") {
      if (itemType === "discretionary") {
        itemToRemove = currentCard.items.discretionary.find(
          (item) => item.id === itemId
        );
        itemTypePath = `budget.standard.cards.${cardId}.discretionary`;
      } else {
        itemToRemove = currentCard.items.nonDiscretionary.find(
          (item) => item.id === itemId
        );
        itemTypePath = `budget.standard.cards.${cardId}.nonDiscretionary`;
      }
    } else {
      itemToRemove = currentCard.items.find((item) => item.id === itemId);
      itemTypePath = `budget.custom.cards.${cardId}`;
    }

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== cardId) return card;

        let updatedItems;
        if (currentCardType === "standard") {
          updatedItems = {
            ...card.items,
            [itemType]: card.items[itemType].filter(
              (item) => item.id !== itemId
            ),
          };
        } else {
          updatedItems = card.items.filter((item) => item.id !== itemId);
        }

        const totals = recalculateTotal({ ...card, items: updatedItems });

        return {
          ...card,
          items: updatedItems,
          ...totals,
        };
      })
    );
    setCardChanges((prev) => [
      ...prev,
      {
        type: "removed",
        item: itemToRemove,
        itemType:
          currentCardType === "standard"
            ? `budget.standard.${itemType}`
            : "budget.custom",

        timestamp: Date.now(),
        month: new Date().toLocaleString("default", { month: "short" }),
      },
    ]);

    if (itemToRemove?.name) {
      await removeItemForUser(currentDocId, itemTypePath, itemToRemove.name);
    }
    showToast("Item removed successfully!", "success");
  };

  const handleEdit = (item) => {
    setCurrentEditedItem(item);
    console.log("Editing item...", item);

    const isSpentItem = item.hasOwnProperty("amount");

    setItemFormType(isSpentItem ? "spent" : "planned");
    setName(item.name || "");
    setCategory(item.category || ""); // For spent
    setSpent(isSpentItem ? item.amount?.toString() || "" : "");
    setPlanned(!isSpentItem ? item.planned?.toString() || "" : "");

    setModalEditMode(item); // ✅ pass full item
    setModalVisible(true);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1D160E" }}>
        <Header />
        <KeyboardAvoidingView
          style={{ flex: 1, marginTop: 60 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust based on your layout
        >
          {cards.length === 0 ? (
            <AddCardGrid
              title="Add Budget"
              cardTypes={budgetCardTypes}
              onAddCard={addCard}
            />
          ) : (
            <FlatList
              data={cards} // ✅ Use cards as data source
              keyExtractor={(item) => item.id.toString()} // Ensure unique keys
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) =>
                item.type === "custom" ? (
                  <CustomCard
                    card={item}
                    updateIncome={updateIncome}
                    handleEdit={handleEdit}
                    removeItem={removeItem}
                    setModalVisible={setModalVisible}
                    setCurrentCardId={setCurrentCardId}
                    addCard={addCard}
                    removeCard={removeCard}
                    setModalType={setModalType}
                    setItemType={setItemType}
                    setItemFormType={setItemFormType}
                    itemFormType={itemFormType}
                    setCategories={setCategories}
                  />
                ) : (
                  <StandardCard
                    card={item}
                    updateIncome={updateIncome}
                    handleEdit={handleEdit}
                    removeItem={removeItem}
                    setModalVisible={setModalVisible}
                    setCurrentCardId={setCurrentCardId}
                    addCard={addCard}
                    removeCard={removeCard}
                    setModalType={setModalType}
                    setItemType={setItemType}
                    itemType={itemType}
                    setItemFormType={setItemFormType}
                    itemFormType={itemFormType}
                    setCategories={setCategories}
                  />
                )
              }
              style={styles.scrollView}
            />
          )}
        </KeyboardAvoidingView>
        <ItemsInputModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          name={name}
          setName={setName}
          planned={planned}
          setPlanned={setPlanned}
          spent={spent}
          setSpent={setSpent}
          networth={networth}
          setnetworth={setNetworth}
          remaining={remaining}
          setRemaining={setRemaining}
          note={note}
          setNote={setNote}
          errors={errors}
          setErrors={setErrors}
          handleSave={handleSave}
          setModalEditMode={setModalEditMode}
          modalEditMode={modalEditMode}
          itemType={itemType}
          itemFormType={itemFormType}
          categories={categories}
          category={category}
          setCategory={setCategory}
          modalType={modalType}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Budget;
