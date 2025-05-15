import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  SectionList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import Text from "../../components/Text";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fetchAllTransactionLogsForUser } from "../../utilities/store";
import { useUser } from "../../utilities/userProvider";
import { AntDesign } from "@expo/vector-icons";
import ShimmerLoader from "../../utilities/shimmerLoader";
import { getCategoryIcon } from "../../utilities/getCategoryIcon";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { restoreItemFromLog } from "../../utilities/store";
import { showToast } from "../../utilities/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { use } from "react";

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
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentDocId, setCurrentDocId] = useState(null);

  const monthScrollRef = useRef(null);
  const monthRefs = useRef({});
  const openSwipeRef = useRef(null);

  const loadCurrentDocId = async () => {
    const currentDocId = await AsyncStorage.getItem("currentUserDocId");
    if (currentDocId) {
      setCurrentDocId(currentDocId);
    } else {
      console.error("No currentDocId found in AsyncStorage");
    }
  };

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
    loadCurrentDocId();
  }, []);

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
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  const capitalize = (str) =>
    typeof str === "string" && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : str;

  const getValidAmount = (item) => {
    const fields = [
      item?.amount,
      item?.planned,
      item?.value,
      item?.spent,
      item?.networth,
    ];
    for (const val of fields) {
      if (typeof val === "number" && !isNaN(val)) {
        return val;
      }
    }
    return 0;
  };

  useEffect(() => {
    if (!logs || logs.length === 0) {
      setFormattedLogs([]);
      return;
    }

    // Step 1: Flatten logs
    let flattened = logs
      .filter((log) => !log.restored)
      .map((log) => {
        if (!log?.item || !log.timestamp?.seconds) return null;

        const dateObj = new Date(log.timestamp.seconds * 1000);
        const fallbackMonth = monthLookup[dateObj.getMonth()];
        const dateStr = `${(
          log.month || fallbackMonth
        ).toUpperCase()} ${dateObj.getDate()}`;

        return {
          id: log.id || log.item?.id || `${log.item?.name}-${Date.now()}`,
          icon: "feather-alt",
          name: log.item?.name || "Unnamed",
          badgeLabel: log.badgeLabel || "Uncategorized",
          type: log.cardType || "Uncategorized",
          actionType: log.type,
          date: dateStr,
          timestamp: log.timestamp.seconds * 1000,
          amount: `${
            log.type === "added" ? "+" : log.type === "removed" ? "-" : ""
          }${currencyFormatter.format(getValidAmount(log.item))}`,
          status: capitalize(log.type),
        };
      })
      .filter(Boolean);

    if (typeFilter !== "ALL") {
      flattened = flattened.filter(
        (item) => item.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (selectedMonth !== "ALL") {
      flattened = flattened.filter((item) => {
        const [month] = item.date.split(" ");
        return month.toUpperCase() === selectedMonth;
      });
    }

    if (searchQuery.trim() !== "") {
      flattened = flattened.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    const groupedMap = {};
    flattened.forEach((item) => {
      const dateKey = item.date;
      const timestamp = item.timestamp;

      if (!groupedMap[dateKey]) {
        groupedMap[dateKey] = { data: [], latestTimestamp: timestamp };
      }

      groupedMap[dateKey].data.push(item);

      if (timestamp > groupedMap[dateKey].latestTimestamp) {
        groupedMap[dateKey].latestTimestamp = timestamp;
      }
    });

    const grouped = Object.entries(groupedMap)
      .sort((a, b) => b[1].latestTimestamp - a[1].latestTimestamp)
      .map(([title, value]) => ({
        title,
        data: value.data,
      }));

    setFormattedLogs(grouped);
  }, [logs, selectedMonth, searchQuery, typeFilter]);

  const highlightMatch = (text = "", query = "") => {
    if (!query.trim()) return <Text>{text}</Text>;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={i} style={{ color: "#FFD700", fontWeight: "600" }}>
          {part}
        </Text>
      ) : (
        <Text key={i}>{part}</Text>
      )
    );
  };

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

  const shortenBadgeLabel = (label) => {
    return label
      .replace("Custom Budget", "Custom")
      .replace("Discretionary Budget", "Discretionary")
      .replace("Non-Discretionary", "Non-Disc.")
      .replace("Planned ", "Planned: ")
      .replace("Spent ", "Spent: ")
      .replace("Net Worth ", "");
  };

  const handleRestore = async (logItem) => {
    try {
      await restoreItemFromLog(currentDocId, logItem.id, userEmail);
      showToast("Item restored successfully", "success");
      loadTransactionLogs();
    } catch (err) {
      showToast("Failed to restore item", "error");
    }
  };

  const handleEditFromLog = (item) => {
    const { cardId, cardType, entryType, item: itemData, section } = item;

    setModalType(cardType); // "custom" or "standard"
    setItemFormType(entryType);
    setItemType(section || entryType); // for standard
    setCurrentCardId(cardId);
    setCurrentEditedItem(itemData);
    setModalEditMode(true);
    setModalVisible(true);
  };

  const renderRightActions = (item, progress, dragX) => {
    const isRemoved = item.actionType === "removed";
    const actionLabel = isRemoved ? "Restore" : "Edit";
    const actionIcon = isRemoved ? "reload1" : "edit";

    const animatedStyle = useAnimatedStyle(() => {
      const trans = interpolate(dragX.value, [-100, 0], [0, 80], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      const opacity = interpolate(dragX.value, [-100, -20, 0], [1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      return {
        transform: [{ translateX: trans }],
        opacity,
      };
    });

    return (
      <Reanimated.View
        style={[
          {
            width: 80,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#444",
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            marginRight: 5,
          },
          animatedStyle,
        ]}
      >
        <Pressable
          onPress={() => {
            isRemoved ? handleRestore(item) : handleEditFromLog(item);
            if (openSwipeRef.current) {
              openSwipeRef.current.close();
            }
          }}
          style={{ alignItems: "center", padding: 10 }}
        >
          <AntDesign name={actionIcon} size={20} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 12 }}>{actionLabel}</Text>
        </Pressable>
      </Reanimated.View>
    );
  };

  const renderItem = ({ item }) => {
    const color = getColorForType(item.actionType);
    const icon = getCategoryIcon({
      name: item.name,
      category: item.category,
      type: item.cardType,
    });
    const swipeableRef = useRef(null);

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={(progress, dragX) =>
          renderRightActions(item, progress, dragX)
        }
        onSwipeableWillOpen={() => {
          if (
            openSwipeRef.current &&
            openSwipeRef.current !== swipeableRef.current
          ) {
            openSwipeRef.current.close();
          }

          openSwipeRef.current = swipeableRef.current;
          setTimeout(() => {
            if (openSwipeRef.current === swipeableRef.current) {
              swipeableRef.current?.close();
              openSwipeRef.current = null;
            }
          }, 4000);
        }}
        onSwipeableWillClose={() => {
          if (openSwipeRef.current === swipeableRef.current) {
            openSwipeRef.current = null;
          }
        }}
      >
        <View style={styles.transactionItem}>
          <View style={styles.transactionDetails}>
            <AntDesign
              name={icon}
              size={24}
              style={[styles.transactionIcon, { color }]}
            />
            <View
              style={{
                marginLeft: 8,
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{ color, fontWeight: "600" }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {highlightMatch(item.name, searchQuery)}
              </Text>
            </View>
          </View>

          {/* Badge */}
          <View style={styles.transactionBadgeWrapper}>
            <Text
              style={styles.transactionBadge}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shortenBadgeLabel(item.badgeLabel)}
            </Text>
          </View>

          {/* Amount and Status */}
          <View style={styles.transactionAmount}>
            <Text style={{ color, fontWeight: "600" }}>{item.amount}</Text>
            <Text style={[styles.transactionStatus, { color }]}>
              {capitalize(item.actionType)}
            </Text>
          </View>
        </View>
      </Swipeable>
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
                  <Icon name="times" size={22} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {loading ? (
          <ShimmerLoader rows={6} />
        ) : formattedLogs.length !== 0 ? (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginVertical: 10,
                justifyContent: "center",
              }}
            >
              {["ALL", "custom", "standard", "asset", "liability"].map(
                (type) => (
                  <Pressable
                    key={type}
                    onPress={() => setTypeFilter(type)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: typeFilter === type ? "#BA9731" : "#444",
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 13 }}>
                      {type.toUpperCase()}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <SectionList
              sections={formattedLogs}
              keyExtractor={(item, index) =>
                item?.id || `${item.name}-${index}`
              }
              renderItem={renderItem}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
              style={{ width: "100%", flex: 1 }}
              refreshing={loading}
              onRefresh={loadTransactionLogs}
              initialNumToRender={25}
            />
          </>
        ) : (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <AntDesign name="inbox" size={32} color="#555" />
            <Text style={{ color: "#999", marginTop: 8 }}>
              No transactions found for {selectedMonth}.
            </Text>
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
    padding: 10,
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
    marginRight: 15,
  },
  transactionDate: {
    fontSize: 10,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionStatus: {
    fontSize: 12,
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
    padding: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingRight: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
    fontSize: 16,
    height: 50,
  },
  clearIcon: {
    position: "absolute",
    right: 15,
    top: "25%",
  },
  cancelText: {
    color: "#fefefe",
    fontSize: 14,
  },
});

export default App;
