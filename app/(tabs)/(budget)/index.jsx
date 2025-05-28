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
  addItemToUserBudget,
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
import { getBadgeLabel } from "../../../utilities/getBadgeLabel";
import CardWrapper from "../../../components/CardWrapper";

const Budget = () => {
  const [cards, setCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [planned, setPlanned] = useState(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [networth, setNetworth] = useState("");
  const [currentCardId, setCurrentCardId] = useState(null);
  const [currentDocId, setCurrentDocId] = useState(null);
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
  const [category, setCategory] = useState("");
  const [removingCardId, setRemovingCardId] = useState(null);
  const flatListRef = useRef(null);
  const [newlyAddedCardId, setNewlyAddedCardId] = useState(null);

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
            setIsDataReady(true);
            setCurrentDocId(data[0].id);
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
    if (cardChanges.length > 0) {
      storeTransactionLog(userEmail, cardChanges);
      setCardChanges([]);
    }
  }, 350);

  const recalculateTotal = (card) => {
    if (card.type === "custom") {
      const planned = card.items?.planned ?? {};
      const spent = card.items?.spent ?? [];

      const parsedItems = Object.entries(planned).map(([category, item]) => {
        const spentTotal = spent
          .filter((entry) => entry.category === category)
          .reduce((sum, entry) => sum + entry.amount, 0);

        return {
          id: item.id,
          name: category,
          planned: item.planned,
          spent: spentTotal,
          remaining: item.planned - spentTotal,
        };
      });

      const total = parsedItems.reduce(
        (acc, item) => {
          acc.totalPlanned += item.planned;
          acc.totalSpent += item.spent;
          acc.totalRemaining += item.remaining;
          return acc;
        },
        { totalPlanned: 0, totalSpent: 0, totalRemaining: 0 }
      );

      return total;
    }

    if (card.type === "standard") {
      const discretionaryPlanned = card.discretionaryItems?.planned ?? {};
      const discretionarySpent = card.discretionaryItems?.spent ?? [];
      const nonDiscretionaryPlanned = card.nonDiscretionaryItems?.planned ?? {};
      const nonDiscretionarySpent = card.nonDiscretionaryItems?.spent ?? [];

      const parse = (planned, spent) =>
        Object.entries(planned).map(([category, item]) => {
          const spentTotal = spent
            .filter((entry) => entry.category === category)
            .reduce((sum, entry) => sum + entry.amount, 0);

          return {
            id: item.id,
            name: category,
            planned: item.planned,
            spent: spentTotal,
            remaining: item.planned - spentTotal,
          };
        });

      const discretionaryParsed = parse(
        discretionaryPlanned,
        discretionarySpent
      );
      const nonDiscretionaryParsed = parse(
        nonDiscretionaryPlanned,
        nonDiscretionarySpent
      );

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
    const customCards = budget.custom?.cards ?? {};
    const standardCards = budget.standard?.cards ?? {};
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

    // 🟢 Custom Cards
    const customItems = Object.entries(customCards).map(([key, card]) => {
      const items = card?.items ?? {};
      const planned = items?.planned ?? {};
      const spent = items?.spent ?? [];

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
        id: card.id ?? key,
        type: "custom",
        items: { planned, spent },
        parsedItems,
        income,
        ...totals,
      };
    });

    // 🔵 Standard Cards
    const standardItems = Object.entries(standardCards).map(([key, card]) => {
      const discretionaryPlanned = card?.discretionaryItems?.planned ?? {};
      const discretionarySpent = card?.discretionaryItems?.spent ?? [];
      const nonDiscretionaryPlanned =
        card?.nonDiscretionaryItems?.planned ?? {};
      const nonDiscretionarySpent = card?.nonDiscretionaryItems?.spent ?? [];

      const fallbackPlanned = card?.items?.planned ?? {};
      const fallbackSpent = card?.items?.spent ?? [];

      const isLegacyFormat =
        Object.keys(discretionaryPlanned).length === 0 &&
        Object.keys(nonDiscretionaryPlanned).length === 0;

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
        id: card.id ?? key,
        type: "standard",
        discretionaryItems: {
          planned: isLegacyFormat ? fallbackPlanned : discretionaryPlanned,
          spent: isLegacyFormat ? fallbackSpent : discretionarySpent,
        },
        nonDiscretionaryItems: {
          planned: isLegacyFormat ? {} : nonDiscretionaryPlanned,
          spent: isLegacyFormat ? [] : nonDiscretionarySpent,
        },
        parsedItems: {
          discretionary: discretionaryParsed,
          nonDiscretionary: nonDiscretionaryParsed,
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

  const handleSave = async () => {
    setErrors({ name: "", planned: "", spent: "", category: "", networth: "" });

    let hasError = false;

    if (modalType === "asset" || modalType === "liability") {
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required." }));
        hasError = true;
      }
      if (!isNumeric(networth)) {
        setErrors((prev) => ({ ...prev, networth: "Enter a valid number." }));
        hasError = true;
      }
    } else if (itemFormType === "planned") {
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required." }));
        hasError = true;
      }
      if (!isNumeric(planned)) {
        setErrors((prev) => ({ ...prev, planned: "Enter a valid number." }));
        hasError = true;
      }
    } else if (itemFormType === "spent") {
      if (!category) {
        setErrors((prev) => ({ ...prev, category: "Select a category." }));
        hasError = true;
      }
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required." }));
        hasError = true;
      }
      if (!isNumeric(spent)) {
        setErrors((prev) => ({ ...prev, spent: "Enter a valid number." }));
        hasError = true;
      }
    }

    if (hasError) return;

    const currentCard = cards.find((card) => card.id === currentCardId);
    if (!currentCard) return;

    const isSpent = itemFormType === "spent";

    if (modalEditMode) {
      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id !== currentCardId) return card;

          if (card.type === "custom") {
            const updatedItems = { ...card.items };

            if (isSpent) {
              updatedItems.spent = updatedItems.spent.map((item) =>
                item.id === currentEditedItem.id
                  ? {
                      ...item,
                      name,
                      amount: parseFloat(spent),
                      category,
                    }
                  : item
              );
            } else {
              const oldKey = Object.keys(updatedItems.planned).find(
                (key) => updatedItems.planned[key].id === currentEditedItem.id
              );

              if (oldKey && oldKey !== name) {
                delete updatedItems.planned[oldKey];
              }

              updatedItems.planned[name] = {
                id: currentEditedItem.id,
                planned: parseFloat(planned),
              };
            }

            const totals = recalculateTotal({ ...card, items: updatedItems });
            return { ...card, items: updatedItems, ...totals };
          } else {
            // Standard card
            const section = itemType;
            const updatedSection = { ...card[section] };

            if (isSpent) {
              updatedSection.spent = updatedSection.spent.map((item) =>
                item.id === currentEditedItem.id
                  ? {
                      ...item,
                      name,
                      amount: parseFloat(spent),
                      category,
                    }
                  : item
              );
            } else {
              const oldKey = Object.keys(updatedSection.planned).find(
                (key) => updatedSection.planned[key].id === currentEditedItem.id
              );

              if (oldKey && oldKey !== name) {
                delete updatedSection.planned[oldKey];
              }

              updatedSection.planned[name] = {
                id: currentEditedItem.id,
                planned: parseFloat(planned),
              };
            }

            const updatedCard = {
              ...card,
              [section]: updatedSection,
            };

            const totals = recalculateTotal(updatedCard);
            return { ...updatedCard, ...totals };
          }
        })
      );

      setCardChanges((prev) => [
        ...prev,
        {
          type: "edited",
          cardId: currentCardId,
          cardType: currentCard.type,
          entryType: itemFormType,
          section: currentCard.type === "standard" ? itemType : null,
          id: currentEditedItem.id,
          item: {
            id: currentEditedItem.id,
            name,
            planned: !isSpent ? parseFloat(planned) : undefined,
            amount: isSpent ? parseFloat(spent) : undefined,
            category,
          },
          badgeLabel: getBadgeLabel({
            cardType: currentCard.type,
            entryType: itemFormType,
            section: currentCard.type === "standard" ? itemType : null,
          }),
          timestamp: Date.now(),
          month: new Date().toLocaleString("default", { month: "short" }),
        },
      ]);

      await updateItemInDoc({
        docId: currentDocId,
        rootKey: "budget",
        cardType: currentCard.type,
        cardId: currentCardId,
        section: currentCard.type === "standard" ? itemType : null,
        itemId: currentEditedItem.id,
        updatedItem: {
          id: currentEditedItem.id,
          name,
          planned: !isSpent ? parseFloat(planned) : undefined,
          amount: isSpent ? parseFloat(spent) : undefined,
          category,
          entryType: itemFormType,
        },
      });

      showToast("Item updated successfully!", "success");
      setModalEditMode(false);
      setCurrentEditedItem(null);
    } else {
      // ➕ New item
      if (modalType === "asset" || modalType === "liability") {
        // implement separately
      } else if (itemFormType === "planned") {
        addItem(currentCardId, {
          name,
          planned: parseFloat(planned),
          entryType: "planned",
          section: itemType,
        });
      } else if (itemFormType === "spent") {
        addItem(currentCardId, {
          name,
          category,
          amount: parseFloat(spent),
          entryType: "spent",
          section: itemType,
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
  };

  const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  };

  const addCard = async (cardType) => {
    if (!currentDocId) {
      console.warn("❌ Cannot add card: currentDocId is null");
      showToast("Something went wrong. Please wait and try again.", "error");
      return;
    }

    const newCardId = uuid.v4();

    const newCard =
      cardType === "custom"
        ? {
            id: newCardId,
            type: "custom",
            income: "",
            items: {
              planned: {},
              spent: [],
            },
          }
        : {
            id: newCardId,
            type: "standard",
            income: "",
            discretionaryItems: {
              planned: {},
              spent: [],
            },
            nonDiscretionaryItems: {
              planned: {},
              spent: [],
            },
          };

    try {
      setCards((prevCards) => [...prevCards, newCard]);
      setNewlyAddedCardId(newCardId);
      await addCardToFirestore(newCard, currentDocId, cardType);
      showToast("Card added successfully!", "success");
    } catch (error) {
      showToast("Failed to add card. Please try again.", "error");
      console.error(error);
    }
  };

  const removeCard = (id, type) => {
    setRemovingCardId(id);
    removeCardFromFirestore(currentDocId, type, id);
  };
  const finalizeCardRemoval = (id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    showToast("Card removed successfully!", "success");
    setRemovingCardId(null);
  };

  const updateIncome = (id, income) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === id ? { ...card, income } : card))
    );
    showToast("Income updated successfully!", "success");
  };

  const addItem = async (currentCardId, newItem) => {
    const card = cards.find((c) => c.id === currentCardId);
    if (!card) return;

    const cardType = card.type;
    const newItemId = uuid.v4();
    const entryType = newItem.entryType;
    const section = newItem.section || "discretionaryItems";
    const itemName = newItem.name;

    const updatedItem = {
      ...newItem,
      id: newItemId,
      name: itemName,
    };

    if (cardType === "standard") {
      setCards((prevCards) =>
        prevCards.map((c) => {
          if (c.id !== currentCardId) return c;

          const updatedSection = { ...c[section] };

          if (entryType === "planned") {
            updatedSection.planned = {
              ...updatedSection.planned,
              [itemName]: {
                id: newItemId,
                planned: parseFloat(newItem.planned),
              },
            };
          } else if (entryType === "spent") {
            updatedSection.spent = [
              ...(updatedSection.spent || []),
              {
                id: newItemId,
                category: newItem.category,
                name: newItem.name,
                amount: parseFloat(newItem.amount),
              },
            ];
          }

          const updatedCard = {
            ...c,
            [section]: updatedSection,
          };

          const totals = recalculateTotal(updatedCard);
          return { ...updatedCard, ...totals };
        })
      );

      await addItemToUserBudget(currentDocId, "standard", {
        ...updatedItem,
        cardId: currentCardId,
        section,
      });
    } else if (cardType === "custom") {
      setCards((prevCards) =>
        prevCards.map((c) => {
          if (c.id !== currentCardId) return c;

          const updatedItems = {
            planned: { ...(c.items?.planned ?? {}) },
            spent: [...(c.items?.spent ?? [])],
          };

          if (entryType === "planned") {
            updatedItems.planned[itemName] = {
              id: newItemId,
              planned: parseFloat(newItem.planned),
            };
          } else {
            updatedItems.spent.push({
              id: newItemId,
              category: newItem.category,
              name: newItem.name,
              amount: parseFloat(newItem.amount),
            });
          }

          return {
            ...c,
            items: updatedItems,
          };
        })
      );

      await addItemToUserBudget(currentDocId, "custom", {
        ...updatedItem,
        cardId: currentCardId,
      });
    }

    setCardChanges((prev) => [
      ...prev,
      {
        type: "added",
        cardId: currentCardId,
        cardType,
        entryType,
        section: cardType === "standard" ? section : null,
        id: updatedItem.id,
        item: updatedItem,
        badgeLabel: getBadgeLabel({
          cardType,
          entryType,
          section: cardType === "standard" ? section : null,
        }),
        timestamp: Date.now(),
        month: new Date().toLocaleString("default", { month: "short" }),
      },
    ]);

    setItemType(null);
    showToast("Item added successfully!", "success");
  };

  const removeItem = async (cardId, item, { entryType, section = null }) => {
    const currentCard = cards.find((card) => card.id === cardId);
    if (!currentCard) return;

    const cardType = currentCard.type;
    let path = "";
    let itemToRemove = null;

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== cardId) return card;

        if (cardType === "custom") {
          const updatedItems = { ...card.items };

          if (entryType === "spent") {
            itemToRemove = updatedItems.spent.find((i) => i.id === item.id);
            updatedItems.spent = updatedItems.spent.filter(
              (i) => i.id !== item.id
            );
            path = `budget.custom.cards.${cardId}.items.spent`;
          } else {
            const key = Object.keys(updatedItems.planned).find(
              (k) => updatedItems.planned[k].id === item.id
            );
            if (key) {
              itemToRemove = { id: item.id, name: key };
              delete updatedItems.planned[key];
              path = `budget.custom.cards.${cardId}.items.planned.${key}`;
            }
          }

          const totals = recalculateTotal({ ...card, items: updatedItems });
          return { ...card, items: updatedItems, ...totals };
        }

        if (cardType === "standard") {
          const updatedSection = { ...card[section] };

          if (entryType === "spent") {
            itemToRemove = updatedSection.spent.find((i) => i.id === item.id);
            updatedSection.spent = updatedSection.spent.filter(
              (i) => i.id !== item.id
            );
            path = `budget.standard.cards.${cardId}.${section}.spent`;
          } else {
            const key = Object.keys(updatedSection.planned).find(
              (k) => updatedSection.planned[k].id === item.id
            );
            if (key) {
              itemToRemove = { id: item.id, name: key };
              delete updatedSection.planned[key];
              path = `budget.standard.cards.${cardId}.${section}.planned.${key}`;
            }
          }

          const updatedCard = { ...card, [section]: updatedSection };
          const totals = recalculateTotal(updatedCard);
          return { ...updatedCard, ...totals };
        }

        return card;
      })
    );

    setCardChanges((prev) => [
      ...prev,
      {
        type: "removed",
        cardId,
        cardType,
        entryType,
        section,
        id: item?.id,
        item,
        badgeLabel: getBadgeLabel({ cardType, entryType, section }),
        timestamp: Date.now(),
        month: new Date().toLocaleString("default", { month: "short" }),
      },
    ]);

    if (itemToRemove?.name || itemToRemove?.id) {
      await removeItemForUser(currentDocId, path, itemToRemove);
    }

    showToast("Item removed successfully!", "success");
  };

  const handleEdit = (item, cardType, section = null) => {
    setCurrentEditedItem(item);
    console.log("Editing item...", item);

    const isSpentItem = item.hasOwnProperty("amount");
    setItemFormType(isSpentItem ? "spent" : "planned");

    // For planned items
    if (!isSpentItem) {
      setName(item.name || "");
      setPlanned(item.planned?.toString() || "");
      setCategory("");
      setSpent("");
    } else {
      // For spent items
      setName(item.name || "");
      setSpent(item.amount?.toString() || "");
      setCategory(item.category || "");
      setPlanned("");
    }

    // Store section for standard cards to use during save
    if (cardType === "standard" && section) {
      setItemType(section); // e.g., "discretionaryItems" or "nonDiscretionaryItems"
    }

    setModalEditMode(item); // trigger edit mode
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
              ref={flatListRef}
              data={cards}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) =>
                item.type === "custom" ? (
                  <CardWrapper
                    key={item.id}
                    index={index}
                    cardId={item.id}
                    isRemoving={removingCardId === item.id}
                    onExitComplete={finalizeCardRemoval}
                    onEnterComplete={() => {
                      if (item.id === newlyAddedCardId) {
                        const index = cards.findIndex((c) => c.id === item.id);
                        flatListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                        setNewlyAddedCardId(null); // reset
                      }
                    }}
                  >
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
                  </CardWrapper>
                ) : (
                  <CardWrapper
                    key={item.id}
                    index={index}
                    cardId={item.id}
                    isRemoving={removingCardId === item.id}
                    onExitComplete={finalizeCardRemoval}
                    onEnterComplete={() => {
                      if (item.id === newlyAddedCardId) {
                        const index = cards.findIndex((c) => c.id === item.id);
                        flatListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                        setNewlyAddedCardId(null); // reset
                      }
                    }}
                  >
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
                  </CardWrapper>
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
