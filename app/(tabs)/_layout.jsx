import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="(budget)"
        options={{
          headerTitleStyle: { color: "#FEFEFE" },
          title: "Budget",
        }}
      />
      <Tabs.Screen
        name="(networth)"
        options={{
          headerTitleStyle: { color: "#FEFEFE" },
          title: "Net Worth",
        }}
      />
      <Tabs.Screen
        name="userAccount"
        options={{
          headerTitleStyle: { color: "#FEFEFE" },
          title: "Account",
        }}
      />
    </Tabs>
  );
}
