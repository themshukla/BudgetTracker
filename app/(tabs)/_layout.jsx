import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#CF7500", headerShown: false }}
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
          title: "Networth",
        }}
      />
    </Tabs>
  );
}
