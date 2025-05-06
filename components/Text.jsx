import React from "react";
import { Text as RNText, StyleSheet } from "react-native";

const Text = ({ style, ...props }) => {
  return <RNText style={[styles.defaultFont, style]} {...props} />;
};

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: "Outfit-Regular",
    color: "#fefefe",
    fontSize: 18,
    textAlign: "center",
  },
});

export default Text;
