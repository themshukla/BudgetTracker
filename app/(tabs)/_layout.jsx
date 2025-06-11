import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import TabBar from "../../components/TabBar";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Text from "../../components/Text";

const Drawer = createDrawerNavigator();

function AllTabs() {
  return (
    <View style={styles.root}>
      <Tabs
        initialRouteName="(budget)"
        name="(tabs)"
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

function CustomDrawerContent({ navigation }) {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "#322A28" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          marginTop: 150,
          paddingVertical: 24,
        }}
      >
        {[
          { label: "🏠 Home", href: "/(tabs)/(budget)" },
          { label: "📅 Monthly Expenses", href: "/(tabs)/(networth)" },
          { label: "📝 Transaction Logs", href: "/transaction" },
          { label: "⚙️ Account", href: "/(tabs)/userAccount" },
        ].map(({ label, href }) => (
          <TouchableOpacity
            key={href}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: "#444",
            }}
            onPress={() => router.replace(href) || navigation.closeDrawer()}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#FEFEFE", fontSize: 16 }}>{label}</Text>
          </TouchableOpacity>
        ))}

        {/* Contact Developer */}
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:kmilan604@gmail.com")}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: "#444",
          }}
        >
          <Text style={{ color: "#FEFEFE", fontSize: 16 }}>
            📧 Contact Developer
          </Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Footer */}
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <Text style={{ color: "#aaa", fontSize: 12 }}>
            Built by Milan Budhathoki
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://milan-budhathoki.netlify.app")
            }
          >
            <Text style={{ color: "#BA9731", fontSize: 14, marginTop: 4 }}>
              Visit Portfolio
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerType: "back" }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={AllTabs} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#15120F",
  },
});
