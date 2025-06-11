// userAccount.js

import { StatusBar } from "expo-status-bar";
import { Button, View, Image, SafeAreaView } from "react-native";
import styles from "../../../utilities/styles";
import Text from "../../../components/Text";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useGoogleAuth } from "../../../utilities/useGoogleAuth";
import { useUser } from "../../../utilities/userProvider";
import ExportCSV from "../../../components/ExportCSV";
import { useEffect, useState } from "react";
import { fetchBudgetDataForUser } from "../../../utilities/store.js";
import { transformUserDataToRows } from "../../../utilities/transformUserDataToRows.js";

const UserAccount = () => {
  const { signin, logout } = useGoogleAuth();
  const { userEmail, isLoggedIn, userInfo } = useUser();
  const [exportData, setExportData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isLoggedIn) {
          const data = await fetchBudgetDataForUser(userEmail);
          const flattenedData = transformUserDataToRows(data);
          setExportData(flattenedData);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
                  : require("../../../assets/images/userIcon.png")
              }
              style={styles.profilePicture}
            />
            <Text style={styles.name}>{userInfo.name}</Text>
            <Text style={styles.email}>{userInfo.email}</Text>
            <Button title="Logout" onPress={logout} />
            <ExportCSV
              data={exportData}
              filename={`${userInfo.name.replace(/\s+/g, "_")}budget_data.csv`}
              disabled={!exportData || exportData.length === 0}
            />
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
