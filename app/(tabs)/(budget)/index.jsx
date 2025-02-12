import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import Text from "../../../components/Text";
import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Header from "../../../components/Header";

const Budget = () => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  const hideOptions = () => {
    setShowOptions(false);
  };
  return (
    <SafeAreaView>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View id="first-card" style={styles.card}>
            <View id="head" style={styles.cardHead}>
              <View>
                <View style={styles.iconContainer}>
                  <Menu>
                    <MenuTrigger>
                      <AntDesign name="pluscircleo" size={24} color="#BA9731" />
                    </MenuTrigger>
                    <MenuOptions customStyles={{ backgroundColor: "red" }}>
                      <MenuOption onSelect={() => alert(`Save`)}>
                        <Text style={styles.option}>Custom</Text>
                      </MenuOption>
                      <MenuOption onSelect={() => alert(`Delete`)}>
                        <Text style={styles.option}>Standard</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>
              </View>
            </View>
            {/* <View id="body" style={styles.cardBody}>
              <View style={styles.cardBodyHeader}>
                <Text style={styles.income}>Income</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Type here..."
                  placeholderTextColor="#BA9731"
                  value="$$$$"
                  keyboardType="numeric"
                  // onChangeText={handleInputChange}
                />
              </View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemHeader}>Name</Text>
                <Text style={styles.cardItemHeader}>Planned</Text>
                <Text style={styles.cardItemHeader}>Spent</Text>
                <Text style={styles.cardItemHeader}>Remaining</Text>
              </View>
              <View style={styles.dividerHeader}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category 2</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyAction}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="#BA9731" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </View>
            </View> */}
            <View id="body" style={styles.cardBody}>
              <View style={styles.cardBodyHeader}>
                <Text style={styles.income}>Income</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Type here..."
                  placeholderTextColor="#BA9731"
                  value="$$$$"
                  keyboardType="numeric"
                  // onChangeText={handleInputChange}
                />
              </View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemHeader}>Name</Text>
                <Text style={styles.cardItemHeader}>Planned</Text>
                <ScrollView horizontal={true}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.cardItemHeader}>Spent</Text>
                    <Text style={styles.cardItemHeader}>Remaining</Text>
                  </View>
                </ScrollView>
              </View>
              <View style={styles.dividerHeader}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category 2</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyAction}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="#BA9731" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </View>
            </View>
            <View id="foot" style={styles.foot}>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemFooter}>Total</Text>
                <Text style={styles.cardItemFooter}>Planned</Text>
                <Text style={styles.cardItemFooter}>Spent</Text>
                <Text style={styles.cardItemFooter}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardFooterContent}>
                <Text style={styles.footerCardItem}>$100,000</Text>
                <Text style={styles.footerCardItem}>$50,000</Text>
                <Text style={styles.footerCardItem}>$7,000</Text>
                <Text style={styles.footerCardItem}>$43,000</Text>
              </View>
            </View>
          </View>
          <View id="second-card" style={styles.card}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View id="head" style={styles.cardHead}>
                <View style={{ width: 300 }}>
                  <View style={styles.iconContainer}>
                    <Menu>
                      <MenuTrigger>
                        <AntDesign
                          name="pluscircleo"
                          size={24}
                          color="#BA9731"
                        />
                      </MenuTrigger>
                      <MenuOptions customStyles={{ backgroundColor: "red" }}>
                        <MenuOption onSelect={() => alert(`Save`)}>
                          <Text style={styles.option}>Custom</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => alert(`Delete`)}>
                          <Text style={styles.option}>Standard</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                </View>
              </View>
              <View style={styles.badge}>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: "center",
                    color: "#ODODOD",
                  }}
                >
                  Fixed
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardBodyHeader}>
                <Text style={styles.income}>Income</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Type here..."
                  placeholderTextColor="#BA9731"
                  value="$$$$"
                  // onChangeText={handleInputChange}
                />
              </View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemHeader}>Non Discretionary</Text>
                <Text style={styles.cardItemHeader}>Planned</Text>
                <Text style={styles.cardItemHeader}>Spent</Text>
                <Text style={styles.cardItemHeader}>Remaining</Text>
              </View>
              <View style={styles.dividerHeader}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category 1</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyAction}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="#BA9731" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </View>
            </View>
            <View id="foot" style={styles.foot}>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemFooter}>Total</Text>
                <Text style={styles.cardItemFooter}>Planned</Text>
                <Text style={styles.cardItemFooter}>Spent</Text>
                <Text style={styles.cardItemFooter}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardFooterContent}>
                <Text style={styles.footerCardItem}>$100,000</Text>
                <Text style={styles.footerCardItem}>$50,000</Text>
                <Text style={styles.footerCardItem}>$7,000</Text>
                <Text style={styles.footerCardItem}>$43,000</Text>
              </View>
            </View>
            <View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemHeader}>Discretionary</Text>
                <Text style={styles.cardItemHeader}>Planned</Text>
                <Text style={styles.cardItemHeader}>Spent</Text>
                <Text style={styles.cardItemHeader}>Remaining</Text>
              </View>
              <View style={styles.dividerHeader}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category 1</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyAction}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="#BA9731" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </View>
              <View id="foot" style={styles.foot}>
                <View style={styles.cardBodyContent}>
                  <Text style={styles.cardItemFooter}>Total</Text>
                  <Text style={styles.cardItemFooter}>Planned</Text>
                  <Text style={styles.cardItemFooter}>Spent</Text>
                  <Text style={styles.cardItemFooter}>Remaining</Text>
                </View>
                <View style={styles.dividerItem}></View>
                <View style={styles.cardFooterContent}>
                  <Text style={styles.footerCardItem}>$100,000</Text>
                  <Text style={styles.footerCardItem}>$50,000</Text>
                  <Text style={styles.footerCardItem}>$7,000</Text>
                  <Text style={styles.footerCardItem}>$43,000</Text>
                </View>
              </View>
            </View>
          </View>
          <View id="third-card" style={styles.card}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View id="head" style={styles.cardHead}>
                <View style={{ width: 300 }}>
                  <View style={styles.iconContainer}>
                    <Menu>
                      <MenuTrigger>
                        <AntDesign
                          name="pluscircleo"
                          size={24}
                          color="#BA9731"
                        />
                      </MenuTrigger>
                      <MenuOptions customStyles={{ backgroundColor: "red" }}>
                        <MenuOption onSelect={() => alert(`Save`)}>
                          <Text style={styles.option}>Custom</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => alert(`Delete`)}>
                          <Text style={styles.option}>Standard</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                </View>
              </View>
              <View style={styles.badge}>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: "center",
                    color: "#ododod",
                  }}
                >
                  Variable
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardBodyHeader}>
                <Text style={styles.income}>Income</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Type here..."
                  placeholderTextColor="#BA9731"
                  value="$$$$"
                  // onChangeText={handleInputChange}
                />
              </View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemHeader}>Non Discretionary</Text>
                <Text style={styles.cardItemHeader}>Planned</Text>
                <Text style={styles.cardItemHeader}>Spent</Text>
                <Text style={styles.cardItemHeader}>Remaining</Text>
              </View>
              <View style={styles.dividerHeader}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category 1</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyAction}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="#BA9731" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </View>
            </View>
            <View id="foot" style={styles.foot}>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemFooter}>Total</Text>
                <Text style={styles.cardItemFooter}>Planned</Text>
                <Text style={styles.cardItemFooter}>Spent</Text>
                <Text style={styles.cardItemFooter}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardFooterContent}>
                <Text style={styles.footerCardItem}>$100,000</Text>
                <Text style={styles.footerCardItem}>$50,000</Text>
                <Text style={styles.footerCardItem}>$7,000</Text>
                <Text style={styles.footerCardItem}>$43,000</Text>
              </View>
            </View>
            <View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItemHeader}>Discretionary</Text>
                <Text style={styles.cardItemHeader}>Planned</Text>
                <Text style={styles.cardItemHeader}>Spent</Text>
                <Text style={styles.cardItemHeader}>Remaining</Text>
              </View>
              <View style={styles.dividerHeader}></View>
              <View style={styles.cardBodyContent}>
                <Text style={styles.cardItem}>Category 1</Text>
                <Text style={styles.cardItem}>Planned</Text>
                <Text style={styles.cardItem}>Spent</Text>
                <Text style={styles.cardItem}>Remaining</Text>
              </View>
              <View style={styles.dividerItem}></View>
              <View style={styles.cardBodyAction}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="#BA9731" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </View>
              <View id="foot" style={styles.foot}>
                <View style={styles.cardBodyContent}>
                  <Text style={styles.cardItemFooter}>Total</Text>
                  <Text style={styles.cardItemFooter}>Planned</Text>
                  <Text style={styles.cardItemFooter}>Spent</Text>
                  <Text style={styles.cardItemFooter}>Remaining</Text>
                </View>
                <View style={styles.dividerItem}></View>
                <View style={styles.cardFooterContent}>
                  <Text style={styles.footerCardItem}>$100,000</Text>
                  <Text style={styles.footerCardItem}>$50,000</Text>
                  <Text style={styles.footerCardItem}>$7,000</Text>
                  <Text style={styles.footerCardItem}>$43,000</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  income: { color: "#BA9731", fontSize: 16, fontWeight: "bold" },
  buttonText: {
    fontFamily: "Outfit-Regular",
    color: "#BA9731",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1D160E",
  },
  scrollView: {
    marginTop: 60,
  },
  card: {
    width: "75%",
    backgroundColor: "#322A28",
    borderRadius: 15,
    margin: 10,
    padding: 5,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "auto",
  },
  cardBody: {
    marginTop: 10,
  },
  cardBodyHeader: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 40,
    width: "100%",
  },
  cardBodyContent: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BA9731",
    borderRadius: 10,
    padding: 4,
    width: "auto",
    marginRight: 15,
  },
  cardBodyAction: {
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardFooterContent: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dividerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#BA9731",
    borderStyle: "solid",
  },
  dividerItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#BA9731",
    borderStyle: "dashed",
    margin: 2,
  },
  dividerFooter: {
    borderBottomWidth: 1,
    borderBottomColor: "#BA9731",
    borderStyle: "solid",
    marginTop: 10,
  },
  cardItem: {
    fontSize: 12,
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#fefefe",
  },
  footerCardItem: {
    fontSize: 14,
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#BA9731",
  },
  cardItemHeader: {
    fontSize: 14,
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#fefefe",
  },
  cardItemFooter: {
    fontSize: 14,
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#FEFEFE",
  },
  badge: {
    backgroundColor: "#fefefe",
    width: "auto",
    height: 15,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  foot: {
    // backgroundColor: "#f2f2f2",
    borderRadius: 10,
  },
  iconContainer: {
    padding: 2,
    borderRadius: 3,
  },
  optionsContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 40,
    backgroundColor: "#DACE84",
    borderRadius: 5,
    padding: 5,
    width: "auto",
  },
  option: {
    color: "#050505",
    fontSize: 16,
  },
  input: {
    width: "25%",
    height: 40,
    textAlign: "center",
    color: "#BA9731", // Text color to make it readable
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "transparent", // Makes the background invisible
    paddingLeft: 0, // No padding, so it blends in with the text
    borderWidth: 0, // Remove border
  },
});

export default Budget;
