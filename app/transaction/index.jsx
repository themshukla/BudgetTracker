import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  SectionList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import Text from "../../components/Text";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fetchAllTransactionLogsForUser } from "../../utilities/store";
import { useUser } from "../../utilities/userProvider";
import { AntDesign } from "@expo/vector-icons";
import ShimmerLoader from "../../utilities/shimmerLoader";

const App = () => {
  const { month } = useLocalSearchParams();
  const navigation = useNavigation();
  const { userInfo } = useUser();
  const userEmail = userInfo.email;

  const [logs, setLogs] = useState([]);
  const [formattedLogs, setFormattedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const monthScrollRef = useRef(null);
  const monthRefs = useRef({});

  const months = [
    "ALL",
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
          <AntDesign name="search1" size={24} color="#fefefe" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (month) {
      const upper = month.toUpperCase();
      if (months.includes(upper)) {
        setSelectedMonth(upper);
      }
    }
  }, [month]);

  useEffect(() => {
    const selectedRef = monthRefs.current[selectedMonth];
    if (selectedRef && monthScrollRef.current) {
      selectedRef.measureLayout(
        monthScrollRef.current,
        (x) => {
          monthScrollRef.current.scrollTo({ x: x - 16, animated: true });
        },
        (err) => console.warn("measureLayout error:", err)
      );
    }
  }, [selectedMonth]);

  const loadTransactionLogs = async () => {
    setLoading(true);
    const rawLogs = await fetchAllTransactionLogsForUser(userEmail);
    setLogs(rawLogs);

    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    loadTransactionLogs();
  }, []);

  useEffect(() => {
    if (!logs || logs.length === 0) {
      setFormattedLogs([]);
      return;
    }

    const monthLookup = [
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

    let flattened = logs.map((log) => {
      const dateObj = log.timestamp?.seconds
        ? new Date(log.timestamp.seconds * 1000)
        : new Date();

      const fallbackMonth = monthLookup[dateObj.getMonth()];
      const dateStr = `${(
        log.month || fallbackMonth
      ).toUpperCase()} ${dateObj.getDate()}`;

      const itemTypeParts = log.itemType?.split(".") || [];
      const mainType = itemTypeParts[0] || "unknown"; // 'budget' or 'networth'
      const subType = itemTypeParts[1] || "unknown"; // 'custom', 'standard', etc.

      const amountValue =
        mainType === "budget"
          ? log.item.spent
          : mainType === "networth"
          ? log.item.networth
          : 0;

      return {
        icon: "feather-alt",
        name: log.item.name,
        type: `${subType.toUpperCase()} ${mainType.toUpperCase()}`, // for badge display
        actionType: log.type, // for color logic
        date: dateStr,
        timestamp: log.timestamp?.seconds * 1000 || Date.now(),
        amount: `${
          log.type === "added" ? "+" : log.type === "removed" ? "-" : ""
        }${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(amountValue)}`,
        status: log.type.charAt(0).toUpperCase() + log.type.slice(1),
      };
    });

    // Filter by selected month
    if (selectedMonth !== "ALL") {
      flattened = flattened.filter(
        (transaction) =>
          (transaction.date?.split(" ")[0] || "").toUpperCase() ===
          selectedMonth
      );
    }

    // Filter by search
    if (searchQuery.trim() !== "") {
      flattened = flattened.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    // Group by date and track latest timestamp for sorting
    const groupedMap = {};
    flattened.forEach((item) => {
      const dateKey = item.date;
      const timestamp = item.timestamp;

      if (!groupedMap[dateKey]) {
        groupedMap[dateKey] = { data: [], latestTimestamp: timestamp };
      }

      groupedMap[dateKey].data.push(item);

      // update if newer timestamp
      if (timestamp > groupedMap[dateKey].latestTimestamp) {
        groupedMap[dateKey].latestTimestamp = timestamp;
      }
    });

    const grouped = Object.entries(groupedMap)
      .sort((a, b) => b[1].latestTimestamp - a[1].latestTimestamp)
      .map(([title, value]) => ({ title, data: value.data }));

    setFormattedLogs(grouped);
  }, [logs, selectedMonth, searchQuery]);

  const getColorForType = (type) => {
    switch (type) {
      case "added":
        return "#FFD700";
      case "removed":
        return "#FF6347";
      case "edited":
      default:
        return "#fefefe";
    }
  };

  const renderItem = ({ item }) => {
    const color = getColorForType(item.actionType);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionDetails}>
          <Icon
            name={item.icon}
            size={24}
            style={[styles.transactionIcon, { color }]}
          />
          <View style={{ alignItems: "flex-start" }}>
            <Text style={{ color }}>{item.name}</Text>
            <Text style={[styles.transactionDate, { color }]}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.transactionBadgeWrapper}>
          <Text style={styles.transactionBadge}>{item.type}</Text>
        </View>

        <View style={styles.transactionAmount}>
          <Text style={{ color }}>{item.amount}</Text>
          {item.status && (
            <Text style={{ ...styles.transactionStatus, color }}>
              {item.status}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthSelectorContainer}>
        <ScrollView
          ref={monthScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthScrollContainer}
        >
          {months.map((m) => {
            const isSelected = selectedMonth === m;
            return (
              <TouchableOpacity
                key={m}
                ref={(ref) => (monthRefs.current[m] = ref)}
                onPress={() => setSelectedMonth(m)}
                style={[
                  styles.monthButton,
                  isSelected && styles.monthButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.monthButtonText,
                    isSelected && styles.monthButtonTextSelected,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.listContainer}>
        {showSearch && (
          <View style={styles.searchRow}>
            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  style={styles.clearIcon}
                >
                  <Icon name="times" size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ShimmerLoader rows={6} />
        ) : formattedLogs.length !== 0 ? (
          <SectionList
            sections={formattedLogs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            style={{ width: "100%" }}
            refreshing={loading}
            onRefresh={loadTransactionLogs}
          />
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text>Sorry, no transactions.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D160E",
    alignItems: "center",
  },
  monthSelectorContainer: {
    height: 60,
    width: "100%",
  },
  monthScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  monthButton: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#2a2015",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  monthButtonSelected: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  monthButtonText: {
    color: "#d4d4d4",
    fontSize: 14,
  },
  monthButtonTextSelected: {
    color: "#1D160E",
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fefefe",
    backgroundColor: "#1D160E",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    marginRight: 16,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionStatus: {
    fontSize: 14,
  },
  transactionBadgeWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#2a2015",
    borderRadius: 8,
    alignSelf: "center",
  },

  transactionBadge: {
    color: "#ccc",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: "#2a2015",
    color: "#fefefe",
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
  },
  clearIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -8,
  },
  cancelText: {
    color: "#fefefe",
    fontSize: 14,
  },
});

export default App;
