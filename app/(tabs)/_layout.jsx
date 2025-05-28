import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import TabBar from "../../components/TabBar";

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          lazy: false,
          unmountOnBlur: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#15120F",
          },
          sceneContainerStyle: {
            backgroundColor: "#15120F",
          },
        }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="(budget)"
          options={{
            title: "Budget",
          }}
        />
        <Tabs.Screen
          name="(networth)"
          options={{
            title: "Net Worth",
          }}
        />
        <Tabs.Screen
          name="userAccount"
          options={{
            title: "Account",
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#15120F",
  },
});
