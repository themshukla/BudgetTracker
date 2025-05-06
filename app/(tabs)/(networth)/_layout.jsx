import { Stack } from "expo-router/stack";

import { AntDesign, Entypo } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1D160E" },
        headerLeft: () => <Entypo name="menu" size={24} color="#fefefe" />,
        headerRight: () => <AntDesign name="bells" size={24} color="#fefefe" />,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
