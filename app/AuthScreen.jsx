import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useGoogleAuth } from "../utilities/useGoogleAuth";
import { useUser } from "../utilities/userProvider";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AuthScreen() {
  const { userInfo, authReady } = useUser();
  const {
    signin,
    loginWithEmail,
    error: authErrorRaw,
    loading,
  } = useGoogleAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authReady && userInfo) {
      router.replace("(tabs)");
    }
  }, [authReady, userInfo]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleEmailLogin = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    setEmailError("");

    if (!trimmedEmail && !trimmedPassword) {
      setEmailError("Please enter your email and password.");
      return;
    }

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      setEmailError("Password is required.");
      return;
    }

    loginWithEmail(trimmedEmail, trimmedPassword);
  };

  const getFriendlyAuthError = (message) => {
    if (!message) return "";
    if (message.includes("auth/invalid-email")) return "Invalid email address.";
    if (message.includes("auth/user-not-found"))
      return "No account found with this email.";
    if (message.includes("auth/wrong-password")) return "Incorrect password.";
    if (message.includes("auth/network-request-failed"))
      return "Network error. Check your connection.";
    return "Login failed. Please try again.";
  };

  const authError = getFriendlyAuthError(authErrorRaw);

  if (!authReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.topSection}>
              <Image
                source={require("../assets/images/splash-icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.title}>Sign In to Continue</Text>

              <TextInput
                style={[
                  styles.input,
                  emailError && !email ? { borderColor: "red" } : {},
                ]}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    emailError && !password ? { borderColor: "red" } : {},
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24} // 👁️ updated size
                    color="#aaa"
                  />
                </Pressable>
              </View>

              <Pressable style={styles.button} onPress={handleEmailLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>

              {emailError || authError ? (
                <Text style={styles.error}>{emailError || authError}</Text>
              ) : null}

              <Text style={{ color: "#aaa", marginVertical: 15 }}>or</Text>

              <GoogleSigninButton
                size={GoogleSigninButton.Size.Standard}
                color={GoogleSigninButton.Color.Dark}
                onPress={async () => {
                  await signin();
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15120F",
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#15120F",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  bottomSection: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    color: "#fefefe",
    marginBottom: 10,
  },
  input: {
    width: 280,
    height: 50,
    fontSize: 16,
    backgroundColor: "#2a2015",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#fefefe",
    marginTop: 10,
    borderColor: "#444",
    borderWidth: 1,
  },
  passwordWrapper: {
    width: 280,
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 20, // 👁️ updated positioning
  },
  button: {
    marginTop: 15,
    backgroundColor: "#FFD700",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#1D160E",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 8,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
