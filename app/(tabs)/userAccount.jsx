// userAccount.js

import { StatusBar } from "expo-status-bar";
import { Button, View, Image, SafeAreaView } from "react-native";
import styles from "../../utilities/styles";
import Text from "../../components/Text";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import { useGoogleAuth } from "../../utilities/useGoogleAuth"; // Importing the custom hook
import { useUser } from "../../utilities/userProvider"; // Importing the user context

const UserAccount = () => {
  const { signin, logout } = useGoogleAuth(); // Using the hook
  const { userInfo } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {userInfo ? (
          <>
            <Image
              source={
                userInfo.photo
                  ? { uri: userInfo.photo }
                  : require("../../assets/images/userIcon.png") // your static fallback icon
              }
              style={styles.profilePicture}
            />
            <Text style={styles.name}>{userInfo.name}</Text>
            <Text style={styles.email}>{userInfo.email}</Text>
            <Button title="Logout" onPress={logout} />
          </>
        ) : (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Dark}
            onPress={signin}
          />
        )}
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
};

export default UserAccount;
