import React, { useRef, useState, useEffect } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import Text from "./Text";
import { AntDesign, Ionicons, EvilIcons } from "@expo/vector-icons";
import styles from "../utilities/styles";
import Reanimated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { formatCurrency } from "../utilities/formartCurrency";
import { TabView, TabBar } from "react-native-tab-view";

const AssetCard = ({
  card,
  updateIncome,
  handleEdit,
  removeItem,
  setModalVisible,
  setCurrentCardId,
  addCard,
  removeCard,
  setModalType,
  setItemType,
}) => {
  const normalSwipeableRefs = useRef([]);
  const fixedSwipeableRefs = useRef([]);
  const openSwipeableIndexRef = useRef(null);
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const normal = card?.items?.normal ?? [];
    const fixed = card?.items?.fixed ?? [];
    setHasContent(normal.length > 0 || fixed.length > 0);
  }, [card.items]);

  const RightAction = (progress, dragX, item, index, type) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        opacity: interpolate(dragX.value, [-100, 0], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: [
          {
            scale: interpolate(dragX.value, [-100, 0], [1, 0.7], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          },
        ],
      };
    });

    const refArray =
      type === "normal"
        ? normalSwipeableRefs.current
        : fixedSwipeableRefs.current;

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
            setModalType("asset");
            handleEdit(item);
            if (refArray[index]) refArray[index].close();
          }}
        >
          <AntDesign name="edit" size={20} color="#fefefe" />
        </Pressable>
        <Pressable
          style={{ marginLeft: 10 }}
          onPress={() => {
            removeItem(card.id, item.id);
            if (refArray[index]) refArray[index].close();
          }}
        >
          <EvilIcons name="trash" size={28} color="#FF5A5F" />
        </Pressable>
      </Reanimated.View>
    );
  };

  const renderSwipeableItems = (type, items, refArray) => (
    <>
      {items?.map((item, index) => (
        <Swipeable
          key={item.id}
          renderRightActions={(progress, dragX) =>
            RightAction(progress, dragX, item, index, type)
          }
          friction={1}
          dragOffsetFromLeftEdge={5}
          onSwipeableWillOpen={() => {
            if (
              openSwipeableIndexRef.current !== null &&
              openSwipeableIndexRef.current !== index &&
              refArray[openSwipeableIndexRef.current]
            ) {
              refArray[openSwipeableIndexRef.current].close();
            }
            openSwipeableIndexRef.current = index;
            setTimeout(() => {
              if (refArray[index]) {
                refArray[index].close();
                openSwipeableIndexRef.current = null;
              }
            }, 3000);
          }}
          ref={(ref) => (refArray[index] = ref)}
        >
          <View style={styles.cardBodyContent}>
            <Text style={styles.cardItem}>{item.name}</Text>
            <Text style={styles.cardItem}>{formatCurrency(item.networth)}</Text>
          </View>
        </Swipeable>
      ))}
    </>
  );

  const renderScene = ({ route }) => {
    const type = route.key;
    const items = card.items?.[type] || [];
    const refArray =
      type === "normal"
        ? normalSwipeableRefs.current
        : fixedSwipeableRefs.current;
    const total = type === "normal" ? card.totalNormal : card.totalFixed;

    if (!items.length) {
      return (
        <View style={{ flex: 1, justifyContent: "flex-end", padding: 10 }}>
          <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
            <Text style={{ color: "#888", fontStyle: "italic" }}>
              No items yet
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Pressable
              style={styles.button}
              onPress={() => {
                setModalVisible(true);
                setModalType("asset");
                setCurrentCardId(card.id);
                setItemType(type);
              }}
            >
              <AntDesign name="plus" size={18} color="#BA9731" />
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.cardBodyContent}>
          <Text style={styles.cardItemHeader}>Assets</Text>
          <Text style={styles.cardItemHeader}>$</Text>
        </View>
        <View style={styles.dividerHeader} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {renderSwipeableItems(type, items, refArray)}
        </ScrollView>
        <View style={styles.dividerFooter} />
        <View style={styles.foot}>
          <View style={styles.cardBodyContent}>
            <Text style={styles.footerCardItem}>Total</Text>
            <Text style={styles.footerCardItem}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.cardBodyAction}>
            <Pressable
              style={styles.button}
              onPress={() => {
                setModalVisible(true);
                setModalType("asset");
                setCurrentCardId(card.id);
                setItemType(type);
              }}
            >
              <AntDesign name="plus" size={18} color="#BA9731" />
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const routes = [
    { key: "normal", title: "Assets" },
    { key: "fixed", title: "Fixed" },
  ];

  return (
    <View style={[styles.card, !hasContent && { minHeight: 180 }]}>
      <View style={styles.cardHead}>
        <View style={{ width: "100%" }}>
          <View style={styles.iconContainer}>
            <Menu>
              <MenuTrigger>
                <AntDesign name="pluscircleo" size={28} color="#BA9731" />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => addCard("asset")}>
                  <Text style={styles.option}>Asset</Text>
                </MenuOption>
                <MenuOption onSelect={() => addCard("liability")}>
                  <Text style={styles.option}>Liability</Text>
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

      <View style={hasContent ? { height: 350 } : { minHeight: 150 }}>
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
                width: "20%",
                marginLeft: "15%",
              }}
              style={{ backgroundColor: "#BA9731", borderRadius: 10 }}
            />
          )}
        />
      </View>
    </View>
  );
};

export default AssetCard;
