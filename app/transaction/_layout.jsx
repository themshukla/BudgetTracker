import { Stack } from "expo-router/stack";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        title: "Transactions",
        tabBarActiveTintColor: "#FEFEFE",
        headerStyle: { backgroundColor: "#1D160E" },
        headerTitleStyle: { color: "#FEFEFE" },
        headerLeft: () => (
          <AntDesign
            name="arrowleft"
            size={24}
            color="#fefefe"
            onPress={() => router.back()}
          />
        ),
        headerRight: () => (
          <AntDesign name="search1" size={24} color="#fefefe" />
        ),
        headerShown: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
