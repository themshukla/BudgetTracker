import { View, StyleSheet } from "react-native";
import React from "react";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const TabBar = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const icons = {
    budget: (props) => (
      <FontAwesome size={22} name="dollar" color={"#ODODOD"} {...props} />
    ),
    networth: (props) => (
      <FontAwesome size={22} name="money" color={"#ODODOD"} {...props} />
    ),
    userAccount: (props) => (
      <MaterialIcons
        name="account-circle"
        size={24}
        color={"#ODODOD"}
        {...props}
      />
    ),
  };

  return (
    <View style={{ backgroundColor: "#15120F", paddingTop: 25 }}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const IconComponent =
            icons[route.name.replace(/[()]/g, "")] || (() => null);

          return (
            <PlatformPressable
              key={route.name}
              href={buildHref(route.name, route.params)}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBarItem}
            >
              <IconComponent color={isFocused ? "#FEFEFE" : "#ODODOD"} />
              <Text
                style={{
                  color: isFocused ? "#FEFEFE" : "#ODODOD",
                  fontSize: 11,
                }}
              >
                {label}
              </Text>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#BA9731",
    marginHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TabBar;
