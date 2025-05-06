import { useContext } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { UserContext } from "../utilities/userProvider";

export default function Index() {
  const { userInfo } = useContext(UserContext);

  if (userInfo === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fefefe" />
        <Text style={{ color: "#fefefe" }}>Loading app...</Text>
      </View>
    );
  }

  if (userInfo === null) {
    return <Redirect href="/AuthScreen" />;
  } else {
    return <Redirect href="/(tabs)" />;
  }
}
