import "dotenv/config";
export default {
  expo: {
    name: "BudgetTracker",
    slug: "BudgetTracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "budgettracker",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.app.budgetTracker",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      googleServicesFile: process.env.GOOGLE_SERVICE_PLIST,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.app.budgetTracker",
      googleServicesFile: process.env.GOOGLE_SERVICE_JSON,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      ],
      "expo-font",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.IOS_RESERVED_CLIENT_ID,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "51ae6493-10e8-43dd-aacc-33c3fbe0be9e",
      },
      firebaseConfig: {
        apiKey: "AIzaSyAhMPLGUWcrRfDjS5NcdG1M5dnbr43BUmo",
        authDomain: "budget-tracker-973da.firebaseapp.com",
        projectId: "budget-tracker-973da",
        storageBucket: "budget-tracker-973da.firebasestorage.app",
        messagingSenderId: "1095483865963",
        appId: "1:1095483865963:ios:9cecdd01095c182d5f6a2e",
        measurementId: "G-FW0YV3ZCF1",
      },
    },
    doctor: {
      reactNativeDirectoryCheck: {
        listUnknownPackages: false,
      },
    },
  },
};
