import { Stack } from "expo-router/stack";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Budget",
        headerTitleStyle: { color: "#fefefe" },
        headerStyle: { backgroundColor: "#1D160E" },
        headerLeft: () => {
          const navigation = useNavigation();
          return (
            <Pressable
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 10 }}
            >
              <Entypo name="menu" size={24} color="#fefefe" />
            </Pressable>
          );
        },
        headerRight: () => <AntDesign name="bells" size={24} color="#fefefe" />,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
