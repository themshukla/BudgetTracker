import React, { useRef, useState, useEffect } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import Text from "./Text";
import { AntDesign, Ionicons, EvilIcons, Feather } from "@expo/vector-icons";
import styles from "../utilities/styles";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { TabView, TabBar } from "react-native-tab-view";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { formatCurrency } from "../utilities/formartCurrency";
import AnimatedRow from "../components/AnimatedRow";

const StandardCard = ({
  card,
  handleEdit,
  removeItem,
  setModalVisible,
  setCurrentCardId,
  addCard,
  removeCard,
  setModalType,
  setItemType,
  setItemFormType,
  setCategories,
}) => {
  const discretionaryPlannedRefs = useRef([]);
  const discretionarySpentRefs = useRef([]);
  const nonDiscretionaryPlannedRefs = useRef([]);
  const nonDiscretionarySpentRefs = useRef([]);

  const openDiscretionaryPlannedIndex = useRef(null);
  const openDiscretionarySpentIndex = useRef(null);
  const openNonDiscretionaryPlannedIndex = useRef(null);
  const openNonDiscretionarySpentIndex = useRef(null);
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const timeoutRef = useRef(null);

  const [hasContent, setHasContent] = useState(false);
  const routes = [
    { key: "planned", title: "Planned" },
    { key: "spent", title: "Spent" },
    { key: "remaining", title: "Remaining" },
  ];

  useEffect(() => {
    const discretionary = card?.discretionaryItems || {};
    const nonDiscretionary = card?.nonDiscretionaryItems || {};
    setHasContent(
      Object.keys(discretionary.planned || {}).length > 0 ||
        (discretionary.spent || []).length > 0 ||
        Object.keys(nonDiscretionary.planned || {}).length > 0 ||
        (nonDiscretionary.spent || []).length > 0
    );
  }, [card]);

  const getRefsFor = (section, tabKey) => {
    if (section === "discretionaryItems") {
      return tabKey === "spent"
        ? discretionarySpentRefs.current
        : discretionaryPlannedRefs.current;
    } else {
      return tabKey === "spent"
        ? nonDiscretionarySpentRefs.current
        : nonDiscretionaryPlannedRefs.current;
    }
  };

  const getOpenIndexRef = (section, tabKey) => {
    if (section === "discretionaryItems") {
      return tabKey === "spent"
        ? openDiscretionarySpentIndex
        : openDiscretionaryPlannedIndex;
    } else {
      return tabKey === "spent"
        ? openNonDiscretionarySpentIndex
        : openNonDiscretionaryPlannedIndex;
    }
  };

  const buildParsedItems = (section) => {
    const planned = card?.[section]?.planned ?? {};
    const spent = card?.[section]?.spent ?? [];

    return Object.entries(planned).map(([name, item]) => {
      const spentTotal = spent
        .filter((s) => s.category === name)
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        id: item.id,
        name,
        planned: item.planned,
        spent: spentTotal,
        remaining: item.planned - spentTotal,
      };
    });
  };

  const RightAction = (progress, dragX, item, index, section, tabKey) => {
    const entryType = tabKey === "spent" ? "spent" : "planned";
    const refArray = getRefsFor(section, tabKey);
    const openIndexRef = getOpenIndexRef(section, tabKey);

    const styleAnimation = useAnimatedStyle(() => ({
      opacity: interpolate(dragX.value, [-100, 0], [1, 0]),
      transform: [{ scale: interpolate(dragX.value, [-100, 0], [1, 0.7]) }],
    }));

    return (
      <Reanimated.View
        style={[
          styleAnimation,
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#333",
            borderRadius: 8,
            paddingHorizontal: 10,
            height: "90%",
            marginRight: 5,
          },
        ]}
      >
        <Pressable
          style={{ marginRight: 10 }}
          onPress={() => {
            setCurrentCardId(card.id);
            setItemType(entryType);
            setModalType("standard");
            handleEdit(item);

            if (entryType === "spent") {
              const plannedCategories = Object.keys(
                card?.[section]?.planned ?? {}
              );
              setCategories(plannedCategories);
            }

            if (refArray[index]) refArray[index].close();
            openIndexRef.current = null;
          }}
        >
          <AntDesign name="edit" size={20} color="#fefefe" />
        </Pressable>

        <Pressable
          style={{ marginLeft: 10 }}
          onPress={() => {
            removeItem(card.id, item, { entryType, section });
            if (refArray[index]) refArray[index].close();
            openIndexRef.current = null;
          }}
        >
          <EvilIcons name="trash" size={28} color="#FF5A5F" />
        </Pressable>
      </Reanimated.View>
    );
  };

  const renderSection = (label, section, tabKey) => {
    const parsedItems = buildParsedItems(section);
    const spentItems = card?.[section]?.spent ?? [];
    const filteredItems =
      tabKey === "planned"
        ? parsedItems
        : tabKey === "spent"
        ? spentItems
        : parsedItems.filter((item) => item.remaining !== 0);

    const renderItems = () =>
      filteredItems.map((item, i) => {
        const value =
          tabKey === "planned"
            ? item.planned
            : tabKey === "spent"
            ? item.amount
            : item.remaining;

        const labelText =
          tabKey === "spent" ? item.name || item.category : item.name;

        if (tabKey === "remaining") {
          return (
            <AnimatedRow key={item.id}>
              <View key={item.id} style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>{labelText}</Text>
                <Text style={styles.cardItem}>{formatCurrency(value)}</Text>
              </View>
            </AnimatedRow>
          );
        }

        const refArray = getRefsFor(section, tabKey);
        const openIndexRef = getOpenIndexRef(section, tabKey);

        return (
          <Swipeable
            key={item.id}
            renderRightActions={(progress, dragX) =>
              RightAction(progress, dragX, item, i, section, tabKey)
            }
            ref={(ref) => {
              if (ref && ref !== refArray[i]) {
                refArray[i] = ref;
              }
            }}
            onSwipeableWillOpen={() => {
              if (
                openIndexRef.current !== null &&
                openIndexRef.current !== i &&
                refArray[openIndexRef.current]
              ) {
                refArray[openIndexRef.current].close();
              }

              openIndexRef.current = i;

              setTimeout(() => {
                if (refArray[i] && typeof refArray[i].close === "function") {
                  refArray[i].close();
                  if (openIndexRef.current === i) {
                    openIndexRef.current = null;
                  }
                }
              }, 4000);
            }}
            onSwipeableWillClose={() => {
              if (openIndexRef.current === i) {
                openIndexRef.current = null;
              }
            }}
          >
            <AnimatedRow>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>{labelText}</Text>
                <Text style={styles.cardItem}>{formatCurrency(value)}</Text>
              </View>
            </AnimatedRow>
          </Swipeable>
        );
      });

    const total =
      tabKey === "planned"
        ? parsedItems.reduce((sum, i) => sum + i.planned, 0)
        : tabKey === "spent"
        ? spentItems.reduce((sum, s) => sum + s.amount, 0)
        : parsedItems.reduce((sum, i) => sum + i.remaining, 0);

    return (
      <View style={{ marginVertical: 10 }}>
        <View style={styles.cardHead}>
          <Text style={styles.cardItemHeader}>{label}</Text>
          <View style={styles.cardItemHeader}>
            <Feather name="dollar-sign" size={20} color="#BA9731" />
          </View>
        </View>
        <View style={styles.dividerFooter} />
        {filteredItems.length > 0 ? (
          <ScrollView
            style={{ height: 130 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <View style={styles.cardBody}>{renderItems()}</View>
          </ScrollView>
        ) : (
          <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
            <Text style={{ color: "#888", fontStyle: "italic" }}>
              No items yet
            </Text>
          </View>
        )}
        <View style={styles.dividerFooter} />
        <View style={styles.foot}>
          <View style={styles.cardBodyContent}>
            <Text style={styles.footerCardItem}>Total</Text>
            <Text style={styles.footerCardItem}>{formatCurrency(total)}</Text>
          </View>
          {tabKey !== "remaining" && (
            <View style={styles.cardBodyAction}>
              <Pressable
                style={styles.button}
                onPress={() => {
                  setCurrentCardId(card.id);
                  setItemType(section);
                  setItemFormType(tabKey === "spent" ? "spent" : "planned");
                  setModalType("standard");
                  setModalVisible(true);
                  const plannedCategories = Object.keys(
                    card?.[section]?.planned ?? {}
                  );
                  setCategories(plannedCategories);
                }}
              >
                <AntDesign name="plus" size={18} color="#BA9731" />
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderScene = ({ route }) => (
    <View style={{ flex: 1 }}>
      {renderSection("Discretionary", "discretionaryItems", route.key)}
      {renderSection("Non-Discretionary", "nonDiscretionaryItems", route.key)}
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={{ width: "100%", justifyContent: "space-between" }}>
          <View style={styles.iconContainer}>
            <Menu>
              <MenuTrigger>
                <AntDesign name="pluscircleo" size={28} color="#BA9731" />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => addCard("custom")}>
                  <Text style={styles.option}>Custom</Text>
                </MenuOption>
                <MenuOption onSelect={() => addCard("standard")}>
                  <Text style={styles.option}>Standard</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
            <View style={styles.badge}>
              <Text
                style={{
                  color: "#BA9731",
                  fontSize: 13,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {card.type.toUpperCase()}
              </Text>
            </View>
            <Pressable onPress={() => removeCard(card.id, card.type)}>
              <Ionicons
                name="remove-circle-outline"
                size={30}
                color="#FF5A5F"
              />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={hasContent ? { height: 600 } : { minHeight: 450 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          swipeEnabled={false}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              labelStyle={{ color: "#1D160E", fontWeight: "600" }}
              indicatorStyle={{
                backgroundColor: "#fff",
                height: 2,
                width: "15%",
                marginLeft: "9.2%",
              }}
              style={{ backgroundColor: "#BA9731", borderRadius: 10 }}
            />
          )}
        />
      </View>
    </View>
  );
};

export default StandardCard;
