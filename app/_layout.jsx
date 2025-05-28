import { Slot } from "expo-router";
import { UserProvider } from "../utilities/userProvider";
import { MenuProvider } from "react-native-popup-menu";
import { RootSiblingParent } from "react-native-root-siblings";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DrawerLayout from "../components/DrawerLayout";

export default function RootLayout() {
  return (
    <UserProvider>
      <RootSiblingParent>
        <MenuProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Slot />
          </GestureHandlerRootView>
        </MenuProvider>
      </RootSiblingParent>
    </UserProvider>
  );
}
