import {
  View,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import Header from "../../../components/Header";
import styles from "../../../utilities/styles";
import AssetCard from "../../../components/AssetCard";
import LiabilityCard from "../../../components/LiabilityCard";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ItemsInputModal from "../../../components/ItemsInputModal";
import {
  fetchBudgetDataForUser,
  addCardToFirestore,
  addItemToUserNetworth,
  removeNetworthItemForUser,
  removeCardFromFirestore,
  storeTransactionLog,
  updateItemInDoc,
} from "../../../utilities/store";
import uuid from "react-native-uuid";
import { useUser } from "../../../utilities/userProvider";
import { router, useNavigation } from "expo-router";
import { showToast } from "../../../utilities/toast";
import Spinner from "../../../utilities/spinner";
import AddCardGrid from "../../../utilities/addCardGrid";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const Networth = () => {
  const [cards, setCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [planned, setPlanned] = useState("");
  const [spent, setSpent] = useState("");
  const [note, setNote] = useState("");
  const [networth, setnetworth] = useState("");
  const [currentCardId, setCurrentCardId] = useState(null);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentCardType, setCurrentCardType] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [itemType, setItemType] = useState(null);
  const [cardChanges, setCardChanges] = useState([]);
  const [errors, setErrors] = useState({ name: "", networth: "" });
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [netWorthSummary, setNetWorthSummary] = useState(0);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);

  const navigation = useNavigation();
  const { userEmail, isLoggedIn } = useUser();

  const networthCardTypes = [
    {
      type: "asset",
      key: "fixed",
      label: "Fixed Asset",
      icon: <FontAwesome5 name="warehouse" size={24} color="#BA9731" />,
    },
    {
      type: "asset",
      key: "normal",
      label: "Normal Asset",
      icon: <FontAwesome5 name="piggy-bank" size={24} color="#BA9731" />,
    },
    {
      type: "liability",
      key: "normal",
      label: "Liability",
      icon: (
        <MaterialCommunityIcons
          name="credit-card-minus"
          size={26}
          color="#BA9731"
        />
      ),
    },
    {
      type: "liability",
      key: "longterm",
      label: "Longterm Liability",
      icon: (
        <MaterialCommunityIcons
          name="calendar-clock"
          size={26}
          color="#BA9731"
        />
      ),
    },
  ];

  useEffect(() => {
    if (!isLoggedIn) router.push("/AuthScreen");
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchBudgetDataForUser(userEmail);
        setCurrentDocId(data[0].id);
        const transformedData = formatBudgetData(data[0]);
        console.log("Transformed Data:", transformedData);
        setCards(transformedData);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const totals = calculateNetWorthSummary(cards);
    setNetWorthSummary(totals.netWorth);
  }, [cards]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardChanges.length > 5) {
        storeTransactionLog(userEmail, cardChanges);
        setCardChanges([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [cardChanges]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Net Worth: $${Math.round(netWorthSummary).toLocaleString()}`,
      headerTitleStyle: { color: "#FEFEFE" },
    });
  }, [netWorthSummary]);

  const getNetWorthBadgeLabel = (cardType, categoryType) => {
    const typeLabel = cardType === "asset" ? "Asset" : "Liability";

    const prefix =
      cardType === "asset"
        ? categoryType === "fixed"
          ? "Fixed"
          : "Normal"
        : categoryType === "longTerm"
        ? "Long-Term"
        : "Normal";

    return `Net Worth ${prefix} ${typeLabel}`;
  };

  const calculateNetWorthSummary = (cards) => {
    let totalFixed = 0,
      totalNormal = 0,
      totalLiabilities = 0,
      totalLongTermLiabilities = 0;
    cards.forEach((card) => {
      if (card.type === "asset") {
        totalFixed += card.totalFixed || 0;
        totalNormal += card.totalNormal || 0;
      } else if (card.type === "liability") {
        totalLiabilities += card.totalNormal || 0;
        totalLongTermLiabilities += card.totalLongTerm || 0;
      }
    });
    const netWorth =
      totalFixed + totalNormal - totalLiabilities - totalLongTermLiabilities;
    return { netWorth };
  };

  const formatBudgetData = (data) => {
    const { networth } = data;
    const assetCards = networth.asset.cards ?? {};
    const liabilityCards = networth.liability?.cards ?? {};
    let cards = [];

    const parseItems = (entries) =>
      Object.entries(entries ?? {}).map(([name, item]) => ({
        id: item.id,
        name: item.name,
        networth: parseFloat(item.networth),
      }));

    const calculateCategoryTotal = (itemsArray) =>
      itemsArray.reduce((sum, item) => sum + Number(item.networth), 0);

    Object.entries(assetCards).forEach(([key, value]) => {
      const fixed = parseItems(value.items.fixed);
      const normal = parseItems(value.items.normal);
      cards.push({
        id: key,
        type: "asset",
        items: { fixed, normal },
        totalFixed: calculateCategoryTotal(fixed),
        totalNormal: calculateCategoryTotal(normal),
      });
    });

    Object.entries(liabilityCards).forEach(([key, value]) => {
      const longTerm = parseItems(value.items.longTerm);
      const normal = parseItems(value.items.normal);
      cards.push({
        id: key,
        type: "liability",
        items: { longTerm, normal },
        totalLongTerm: calculateCategoryTotal(longTerm),
        totalNormal: calculateCategoryTotal(normal),
      });
    });

    return cards;
  };

  const recalculateTotal = (card) => {
    const categories = Object.values(card.items);
    return categories.reduce((sum, list) => {
      return (
        sum +
        list.reduce((innerSum, item) => innerSum + Number(item.networth), 0)
      );
    }, 0);
  };

  const recalculateAllTotals = (card, updatedItems) => {
    const totals = {};
    for (const [category, items] of Object.entries(updatedItems)) {
      const total = items.reduce((sum, item) => sum + Number(item.networth), 0);
      if (category === "fixed") totals.totalFixed = total;
      else if (category === "normal") totals.totalNormal = total;
      else if (category === "longTerm") totals.totalLongTerm = total;
    }
    return totals;
  };

  const addItem = async (currentCardId, newItem) => {
    const card = cards.find((c) => c.id === currentCardId);
    const newItemId = uuid.v4();
    const updatedItem = {
      ...newItem,
      id: newItemId,
      networth: parseFloat(newItem.networth),
    };

    await addItemToUserNetworth(currentDocId, card, itemType, updatedItem);

    setCards((prevCards) =>
      prevCards.map((c) => {
        if (c.id !== currentCardId) return c;
        const updatedItems = [...c.items[itemType], updatedItem];
        const newItems = { ...c.items, [itemType]: updatedItems };
        return {
          ...c,
          items: newItems,
          total: recalculateTotal({ ...c, items: newItems }),
          ...recalculateAllTotals(c, newItems),
        };
      })
    );

    setCardChanges((prev) => [
      ...prev,
      {
        type: "added",
        item: updatedItem,
        id: updatedItem.id,
        cardId: currentCardId,
        cardType: card.type,
        categoryType: itemType,
        timestamp: new Date(),
        month: new Date().toLocaleString("default", { month: "short" }),
        badgeLabel: getNetWorthBadgeLabel(card.type, itemType),
      },
    ]);

    setItemType(null);
    showToast("Item added successfully!", "success");
  };

  const removeItem = async (cardId, item) => {
    const currentCard = cards.find((card) => card.id === cardId);
    if (!currentCard) {
      console.warn("Card not found");
      return;
    }

    const cardType = currentCard.type;
    let itemToRemove = null;
    let itemType = null;

    for (const [category, itemsArray] of Object.entries(currentCard.items)) {
      const foundItem = itemsArray.find((i) => i.id === item.id);
      if (foundItem) {
        itemToRemove = foundItem;
        itemType = category;
        break;
      }
    }

    if (!itemToRemove || !itemType) {
      console.warn("Item not found in any category");
      return;
    }

    const itemTypePath = `networth.${cardType}.cards.${cardId}.items.${itemType}`;

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== cardId) return card;

        const updatedItems = {
          ...card.items,
          [itemType]: card.items[itemType].filter((i) => i.id !== item.id),
        };

        return {
          ...card,
          items: updatedItems,
          total: recalculateTotal({ ...card, items: updatedItems }),
          ...recalculateAllTotals(card, updatedItems),
        };
      })
    );

    setCardChanges((prev) => [
      ...prev,
      {
        type: "removed",
        item,
        id: item.id,
        cardId: currentCardId,
        cardType: currentCard.type,
        categoryType: itemType,
        timestamp: new Date(),
        month: new Date().toLocaleString("default", { month: "short" }),
        badgeLabel: getNetWorthBadgeLabel(currentCard.type, itemType),
      },
    ]);

    if (itemToRemove?.name) {
      await removeNetworthItemForUser(
        currentDocId,
        itemTypePath,
        itemToRemove.id
      );
    }

    showToast("Item removed successfully!", "success");
  };

  const handleSave = async () => {
    setErrors({ name: "", networth: "" });

    if (!name.trim()) {
      setErrors((e) => ({ ...e, name: "Name is required." }));
      return;
    }
    if (isNaN(parseFloat(networth))) {
      setErrors((e) => ({ ...e, networth: "Enter valid number." }));
      return;
    }

    if (modalEditMode) {
      const currentCard = cards.find((card) => card.id === currentCardId);
      if (!currentCard) return;

      const editedItem = {
        ...currentEditedItem,
        name,
        networth: parseFloat(networth),
      };

      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== currentCardId) return card;

          const updatedList = card.items[itemType].map((item) =>
            item.id === currentEditedItem.id ? editedItem : item
          );

          const newItems = { ...card.items, [itemType]: updatedList };

          return {
            ...card,
            items: newItems,
            total: recalculateTotal({ ...card, items: newItems }),
            ...recalculateAllTotals(card, newItems),
          };
        })
      );

      await updateItemInDoc({
        docId: currentDocId,
        rootKey: "networth",
        cardType: currentCard.type,
        cardId: currentCardId,
        itemId: editedItem.id,
        updatedItem: {
          id: editedItem.id,
          name: editedItem.name,
          networth: editedItem.networth,
        },
        subType: itemType,
      });

      setCardChanges((prev) => [
        ...prev,
        {
          type: "edited",
          item: editedItem,
          id: editedItem.id,
          cardId: currentCardId,
          cardType: currentCard.type,
          categoryType: itemType,
          timestamp: new Date(),
          month: new Date().toLocaleString("default", { month: "short" }),
          badgeLabel: getNetWorthBadgeLabel(currentCard.type, itemType),
        },
      ]);

      setModalEditMode(false);
      setCurrentEditedItem(null);
      setItemType(null);
      showToast("Item updated successfully!", "success");
    } else {
      addItem(currentCardId, { name, networth: parseFloat(networth) });
    }

    setModalVisible(false);
    setName("");
    setnetworth("");
    Keyboard.dismiss();
  };

  const handleEdit = (item) => {
    setCurrentEditedItem(item);
    setName(item.name);
    setnetworth(item.networth?.toString() || "");
    setModalEditMode(true);
    setModalVisible(true);
  };

  const addCard = async (cardType) => {
    const newCard = {
      id: uuid.v4(),
      income: "",
      type: cardType,
      items:
        cardType === "asset"
          ? { fixed: [], normal: [] }
          : { longTerm: [], normal: [] },
    };

    setCards([...cards, newCard]);
    await addCardToFirestore(newCard, currentDocId, cardType);
    showToast("Card added successfully!", "success");
  };

  const removeCard = (id, type) => {
    setCards(cards.filter((card) => card.id !== id));
    removeCardFromFirestore(currentDocId, type, id);
    showToast("Card removed successfully!", "success");
  };

  const updateIncome = (id, value) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, income: value } : card
      )
    );
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          {cards.length === 0 ? (
            <AddCardGrid
              title="Add Networth"
              cardTypes={networthCardTypes}
              onAddCard={addCard}
            />
          ) : (
            <FlatList
              style={styles.scrollView}
              data={cards}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) =>
                item.type === "asset" ? (
                  <AssetCard
                    card={item}
                    addCard={addCard}
                    updateIncome={updateIncome}
                    removeCard={removeCard}
                    addItem={addItem}
                    removeItem={removeItem}
                    setCurrentCardId={setCurrentCardId}
                    setModalVisible={setModalVisible}
                    setModalType={setModalType}
                    setItemType={setItemType}
                    itemType={itemType}
                    handleEdit={handleEdit}
                    setCurrentCardType={setCurrentCardType}
                  />
                ) : (
                  <LiabilityCard
                    card={item}
                    addCard={addCard}
                    updateIncome={updateIncome}
                    removeCard={removeCard}
                    addItem={addItem}
                    removeItem={removeItem}
                    setCurrentCardId={setCurrentCardId}
                    setModalVisible={setModalVisible}
                    setModalType={setModalType}
                    setItemType={setItemType}
                    handleEdit={handleEdit}
                    setCurrentCardType={setCurrentCardType}
                    itemType={itemType}
                  />
                )
              }
            />
          )}
        </KeyboardAvoidingView>
        <ItemsInputModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          name={name}
          setName={setName}
          networth={networth}
          setnetworth={setnetworth}
          handleSave={handleSave}
          errors={errors}
          setErrors={setErrors}
          setPlanned={setPlanned}
          setSpent={setSpent}
          setNote={setNote}
          modalType={modalType}
          setModalEditMode={setModalEditMode}
          categories={categories}
          category={category}
          setCategory={setCategory}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Networth;
