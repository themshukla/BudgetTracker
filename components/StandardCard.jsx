import React, { useRef, useState, useEffect } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import Text from "./Text";
import { AntDesign, Ionicons, EvilIcons } from "@expo/vector-icons";
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
  const swipeableRefs = useRef([]);
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const discretionaryPlanned = card?.discretionaryItems?.planned ?? {};
    const discretionarySpent = card?.discretionaryItems?.spent ?? [];
    const nonDiscretionaryPlanned = card?.nonDiscretionaryItems?.planned ?? {};
    const nonDiscretionarySpent = card?.nonDiscretionaryItems?.spent ?? [];

    const hasPlanned =
      Object.keys(discretionaryPlanned).length > 0 ||
      Object.keys(nonDiscretionaryPlanned).length > 0;
    const hasSpent =
      discretionarySpent.length > 0 || nonDiscretionarySpent.length > 0;

    setHasContent(hasPlanned || hasSpent);
  }, [card]);

  useEffect(() => {
    const timer = setInterval(() => {
      swipeableRefs.current.forEach((ref) => ref?.close());
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const routes = [
    { key: "plan", title: "Planned" },
    { key: "spent", title: "Spent" },
    { key: "remaining", title: "Remaining" },
  ];

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

  const RightAction = (progress, dragX, item, section, tabKey, i) => {
    const styleAnimation = useAnimatedStyle(() => ({
      opacity: interpolate(dragX.value, [-100, 0], [1, 0]),
      transform: [
        {
          scale: interpolate(dragX.value, [-100, 0], [1, 0.7]),
        },
      ],
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
            setItemType(section);
            setItemFormType(tabKey === "spent" ? "spent" : "planned");
            setModalType("standard");
            if (tabKey === "spent") {
              const plannedCategories = Object.keys(
                card?.[section]?.planned ?? {}
              );
              setCategories(plannedCategories);
            }
            setModalVisible(true);
            swipeableRefs.current.forEach((ref) => ref?.close());
          }}
        >
          <AntDesign name="edit" size={20} color="#fefefe" />
        </Pressable>
        <Pressable
          style={{ marginLeft: 10 }}
          onPress={() => {
            const path =
              tabKey === "spent"
                ? `budget.standard.cards.${card.id}.${section}.spent`
                : `budget.standard.cards.${card.id}.${section}.planned`;
            removeItem(path, item.id);
            swipeableRefs.current.forEach((ref) => ref?.close());
          }}
        >
          <EvilIcons name="trash" size={28} color="#FF5A5F" />
        </Pressable>
      </Reanimated.View>
    );
  };

  const renderSection = (label, section, tabKey) => {
    const parsedItems = buildParsedItems(section);
    const spent = card?.[section]?.spent ?? [];

    const items =
      tabKey === "plan"
        ? parsedItems
        : tabKey === "spent"
        ? spent
        : parsedItems.filter((item) => item.remaining !== 0);

    const total =
      tabKey === "plan"
        ? parsedItems.reduce((sum, i) => sum + i.planned, 0)
        : tabKey === "spent"
        ? spent.reduce((sum, s) => sum + s.amount, 0)
        : parsedItems.reduce((sum, i) => sum + i.remaining, 0);

    const renderItems = () =>
      items.map((item, i) => {
        const value =
          tabKey === "plan"
            ? item.planned
            : tabKey === "spent"
            ? item.amount
            : item.remaining;
        const label =
          tabKey === "spent" ? item.name || item.category : item.name;

        return (
          <Swipeable
            key={item.id}
            renderRightActions={(progress, dragX) =>
              RightAction(progress, dragX, item, section, tabKey, i)
            }
            dragOffsetFromLeftEdge={20}
            ref={(ref) => (swipeableRefs.current[i] = ref)}
          >
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>{label}</Text>
              <Text style={styles.cardItem}>{formatCurrency(value)}</Text>
            </View>
          </Swipeable>
        );
      });

    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.cardItemHeader}>{label}</Text>
        {items.length > 0 ? (
          <>
            <ScrollView
              style={{ maxHeight: 200 }}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <View style={styles.cardBody}>{renderItems()}</View>
            </ScrollView>
            <View style={styles.dividerFooter} />
            <View style={styles.foot}>
              <View style={styles.cardBodyContent}>
                <Text style={styles.footerCardItem}>Total</Text>
                <Text style={styles.footerCardItem}>
                  {formatCurrency(total)}
                </Text>
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
                      if (tabKey === "spent") {
                        const plannedCategories = Object.keys(
                          card?.[section]?.planned ?? {}
                        );
                        setCategories(plannedCategories); // ✅ category population
                      }
                      setModalVisible(true);
                      swipeableRefs.current.forEach((ref) => ref?.close());
                    }}
                  >
                    <AntDesign name="plus" size={18} color="#BA9731" />
                    <Text style={styles.buttonText}>Add</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </>
        ) : null}
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
            <Text style={{ color: "#BA9731", fontSize: 12 }}>STANDARD</Text>
          </View>
          <Pressable onPress={() => removeCard(card.id, card.type)}>
            <Ionicons name="remove-circle-outline" size={30} color="#FF5A5F" />
          </Pressable>
        </View>
      </View>

      <View style={hasContent ? { height: 500 } : { minHeight: 150 }}>
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
