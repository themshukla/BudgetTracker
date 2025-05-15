import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const Header = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const flatListRef = useRef(null);

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  useEffect(() => {
    const currentMonth = new Date()
      .toLocaleString("default", { month: "short" })
      .toUpperCase();
    const index = months.indexOf(currentMonth);
    setSelectedMonth(currentMonth);

    // Safe scroll
    if (flatListRef.current && index !== -1) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex?.({ index, animated: true });
      });
    }
  }, []);

  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.calendar}>
        <FlatList
          // ref={flatListRef}
          data={months}
          horizontal
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                setSelectedMonth(item);
                router.push({
                  pathname: "transaction",
                  params: { month: item },
                });
              }}
              style={[
                styles.button,
                selectedMonth === item && { backgroundColor: "#BA9731" },
              ]}
            >
              <Text
                style={[
                  styles.item,
                  selectedMonth === item && {
                    color: "#1D160E",
                    fontWeight: "bold",
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.transaction}>
        <Pressable
          onPress={() => router.push("transaction")}
          style={styles.button}
        >
          <FontAwesome6 name="money-bill-transfer" size={24} color="#BA9731" />
          <Text style={styles.subItem}>Transaction</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#15120F",
    height: 60,
    width: "100%",
    padding: 5,
  },
  calendar: {
    width: "75%",
  },
  transaction: {
    width: "20%",
  },
  item: {
    fontFamily: "Outfit-Regular",
    color: "#BA9731",
    fontSize: 16,
    padding: 5,
  },
  subItem: {
    fontFamily: "Outfit-Regular",
    color: "#BA9731",
    fontSize: 8,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BA9731",
    borderRadius: 10,
    margin: 5,
    height: 40,
    width: "auto",
  },
});

export default Header;