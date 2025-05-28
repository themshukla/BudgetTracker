import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Slot } from "expo-router";

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#1D160E", padding: 20 }}>
      <TouchableOpacity onPress={() => navigation.navigate("(tabs)/budget")}>
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          🏠 Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("(tabs)/budget")}>
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          📅 Monthly Budgets
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("/transactions")}>
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          📝 Transaction Logs
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("/userAccount")}>
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          ⚙️ Settings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("/export")}>
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          📤 Export/Backup
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => Linking.openURL("mailto:milan@example.com")}
      >
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          📧 Contact Developer
        </Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#aaa", fontSize: 12 }}>
          Built by Milan Budhathoki
        </Text>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://milan.budhathoki.netlify.app")
          }
        >
          <Text style={{ color: "#BA9731", fontSize: 14 }}>
            Visit Portfolio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Main" component={Slot} />
    </Drawer.Navigator>
  );
}
