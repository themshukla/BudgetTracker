import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import Header from "../components/Header";
import { Text } from "react-native";
import { MenuProvider } from "react-native-popup-menu";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
  });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <MenuProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </MenuProvider>
  );
}
