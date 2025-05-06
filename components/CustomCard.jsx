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
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { formatCurrency } from "../utilities/formartCurrency";
import { TabView, TabBar } from "react-native-tab-view";

const CustomCard = ({
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
  const openSwipeableIndexRef = useRef(null);
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();

  const routes = [
    { key: "plan", title: "Planned" },
    { key: "spent", title: "Spent" },
    { key: "remaining", title: "Remaining" },
  ];

  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const planned = card?.items?.planned ?? {};
    const spent = card?.items?.spent ?? [];

    const hasPlanned = Object.keys(planned).length > 0;
    const hasSpent = spent.length > 0;

    setHasContent(hasPlanned || hasSpent);
  }, [card.items]);

  const buildParsedItems = () => {
    const planned = card.items?.planned ?? {};
    const spent = card.items?.spent ?? [];

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

  const parsedItems = buildParsedItems();

  const RightAction = (progress, dragX, item, index, type) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        opacity: interpolate(dragX.value, [-100, 0], [1, 0]),
        transform: [
          {
            scale: interpolate(dragX.value, [-100, 0], [1, 0.7]),
          },
        ],
      };
    });

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
            setItemType(type);
            setModalType("custom");
            handleEdit(item);
            if (swipeableRefs.current[index])
              swipeableRefs.current[index].close();
            if (type === "spent") {
              const plannedCategories = Object.keys(card?.items?.planned ?? {});
              setCategories(plannedCategories);
            }
          }}
        >
          <AntDesign name="edit" size={20} color="#fefefe" />
        </Pressable>
        <Pressable
          style={{ marginLeft: 10 }}
          onPress={() => {
            const path =
              type === "spent"
                ? `budget.custom.cards.${card.id}.spent`
                : `budget.custom.cards.${card.id}.planned`;
            removeItem(path, item.id);
            if (swipeableRefs.current[index])
              swipeableRefs.current[index].close();
          }}
        >
          <EvilIcons name="trash" size={28} color="#FF5A5F" />
        </Pressable>
      </Reanimated.View>
    );
  };

  const renderScene = ({ route }) => {
    const type = route.key;

    const filteredItems =
      type === "plan"
        ? parsedItems
        : type === "spent"
        ? card.items.spent ?? []
        : parsedItems.filter((item) => item.remaining !== 0);

    const renderItems = () =>
      filteredItems.map((item, index) => {
        const value =
          type === "plan"
            ? item.planned
            : type === "spent"
            ? item.amount
            : item.remaining;

        const label = type === "spent" ? item.name || item.category : item.name;
        const id = item.id;

        return (
          <Swipeable
            key={id}
            renderRightActions={(progress, dragX) =>
              RightAction(progress, dragX, item, index, type)
            }
            dragOffsetFromLeftEdge={20}
            onSwipeableWillOpen={() => {
              if (
                openSwipeableIndexRef.current !== null &&
                openSwipeableIndexRef.current !== index &&
                swipeableRefs.current[openSwipeableIndexRef.current]
              ) {
                swipeableRefs.current[openSwipeableIndexRef.current].close();
              }
              openSwipeableIndexRef.current = index;
            }}
            onSwipeableWillClose={() => {
              if (openSwipeableIndexRef.current === index) {
                openSwipeableIndexRef.current = null;
              }
            }}
            ref={(ref) => (swipeableRefs.current[index] = ref)}
          >
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>{label}</Text>
              <Text style={styles.cardItem}>{formatCurrency(value)}</Text>
            </View>
          </Swipeable>
        );
      });

    const total =
      type === "plan"
        ? parsedItems.reduce((sum, i) => sum + i.planned, 0)
        : type === "spent"
        ? (card.items.spent ?? []).reduce((sum, s) => sum + s.amount, 0)
        : parsedItems.reduce((sum, i) => sum + i.remaining, 0);

    return (
      <View style={{ flex: 1 }}>
        {filteredItems.length > 0 ? (
          <>
            <ScrollView
              style={{ flex: 1 }}
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
              {type !== "remaining" && (
                <View style={styles.cardBodyAction}>
                  <Pressable
                    style={styles.button}
                    onPress={() => {
                      setModalVisible(true);
                      setModalType("custom");
                      setCurrentCardId(card.id);
                      setItemType(type);
                      setItemFormType(type === "spent" ? "spent" : "planned");
                      if (type === "spent") {
                        const plannedCategories = Object.keys(
                          card?.items?.planned ?? {}
                        );
                        setCategories(plannedCategories);
                      }
                    }}
                  >
                    <AntDesign name="plus" size={18} color="#BA9731" />
                    <Text style={styles.buttonText}>Add</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: "flex-end", padding: 10 }}>
            <View style={{ alignItems: "flex-end" }}>
              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(true);
                  setModalType("custom");
                  setCurrentCardId(card.id);
                  setItemType(type);
                }}
              >
                <AntDesign name="plus" size={18} color="#BA9731" />
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={{ width: "100%" }}>
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
                style={{ color: "#BA9731", fontSize: 12, textAlign: "center" }}
              >
                CUSTOM
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

      <View style={hasContent ? { height: 300 } : { minHeight: 150 }}>
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

export default CustomCard;
