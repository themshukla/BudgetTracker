import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
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

const Networth = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View id="first-card" style={styles.card}>
          <View style={styles.cardBody}>
            <View style={styles.cardBodyHeader}>
              <Text style={styles.income}>Assets</Text>
              <TextInput
                style={styles.input}
                placeholder="Type here..."
                placeholderTextColor="#BA9731"
                value="$$$$"
                // onChangeText={handleInputChange}
              />
            </View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItemHeader}>Current Assets</Text>
              <Text style={styles.cardItemHeader}>Net Worth</Text>
            </View>
            <View style={styles.dividerHeader}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>TSLA</Text>
              <Text style={styles.cardItem}>$30,000</Text>
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
              <Text style={styles.footerCardItem}>$30,000</Text>
            </View>
          </View>
        </View>
        <View id="second-card" style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <View style={styles.badge}>
              <Text
                style={{ fontSize: 12, textAlign: "center", color: "#ODODOD" }}
              >
                Fixed
              </Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardBodyHeader}>
              <Text style={styles.income}>Assets</Text>
              <TextInput
                style={styles.input}
                placeholder="Type here..."
                placeholderTextColor="#BA9731"
                value="$$$$"
                // onChangeText={handleInputChange}
              />
            </View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItemHeader}>Current Assets</Text>
              <Text style={styles.cardItemHeader}>Net Worth</Text>
            </View>
            <View style={styles.dividerHeader}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>Valero</Text>
              <Text style={styles.cardItem}>$100,000</Text>
            </View>
            <View style={styles.dividerItem}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>Cit Go</Text>
              <Text style={styles.cardItem}>$180,000</Text>
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
              <Text style={styles.footerCardItem}>$280,000</Text>
            </View>
          </View>
        </View>
        <View id="third-card" style={styles.card}>
          <View style={styles.cardBody}>
            <View style={styles.cardBodyHeader}>
              <Text style={styles.income}>Liabilities</Text>
              <TextInput
                style={styles.input}
                placeholder="Type here..."
                placeholderTextColor="#BA9731"
                value="$$$$"
                // onChangeText={handleInputChange}
              />
            </View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItemHeader}>Current Liabilities</Text>
              <Text style={styles.cardItemHeader}>Net Worth</Text>
            </View>
            <View style={styles.dividerHeader}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>Tesla Model Y</Text>
              <Text style={styles.cardItem}>$40,000</Text>
            </View>
            <View style={styles.dividerItem}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>Range Rover</Text>
              <Text style={styles.cardItem}>$180,000</Text>
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
              <Text style={styles.footerCardItem}>$220,000</Text>
            </View>
          </View>
        </View>
        <View id="fourth-card" style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <View style={styles.badge}>
              <Text
                style={{ fontSize: 12, textAlign: "center", color: "#ODODOD" }}
              >
                Debt
              </Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardBodyHeader}>
              <Text style={styles.income}>Liabilities</Text>
              <TextInput
                style={styles.input}
                placeholder="Type here..."
                placeholderTextColor="#BA9731"
                value="$$$$"
                // onChangeText={handleInputChange}
              />
            </View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItemHeader}>Long-term Debt</Text>
              <Text style={styles.cardItemHeader}>Net Worth</Text>
            </View>
            <View style={styles.dividerHeader}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>Health Insurance</Text>
              <Text style={styles.cardItem}>$100,000</Text>
            </View>
            <View style={styles.dividerItem}></View>
            <View style={styles.cardBodyContent}>
              <Text style={styles.cardItem}>Loan Payments</Text>
              <Text style={styles.cardItem}>$180,000</Text>
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
              <Text style={styles.footerCardItem}>$280,000</Text>
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
    backgroundColor: "#050505",
  },
  scrollView: {
    margin: 5,
    marginTop: 60,
  },
  card: {
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#BA9731",
    borderRadius: 15,
    margin: 10,
    padding: 5,
    shadowColor: "#BA9731", // Gold shadow color
    shadowOffset: { width: 5, height: 5 }, // Shadow offset
    shadowOpacity: 0.8, // Shadow opacity
    shadowRadius: 10, // Shadow blur radius
    elevation: 8, // Elevation for Android shadow
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
    padding: 3,
    width: "15%",
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
    borderBottomColor: "#DACE84",
    borderStyle: "solid",
  },
  dividerItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#DACE84",
    borderStyle: "dashed",
    margin: 2,
  },
  dividerFooter: {
    borderBottomWidth: 1,
    borderBottomColor: "#DACE84",
    borderStyle: "solid",
    marginTop: 10,
  },
  cardItem: {
    fontSize: 12,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#fefefe",
  },
  footerCardItem: {
    fontSize: 14,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#BA9731",
  },
  cardItemHeader: {
    fontSize: 14,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#fefefe",
  },
  cardItemFooter: {
    fontSize: 14,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#ODODOD",
  },
  badge: {
    backgroundColor: "#fefefe",
    width: "auto",
    height: 15,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  foot: {
    backgroundColor: "#f2f2f2",
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

export default Networth;
