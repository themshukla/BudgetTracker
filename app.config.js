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
      bundleIdentifier: "budget.tracker",
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
      package: "budget.tracker",
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
        apiKey: "AIzaSyCcUwq2h-u6Q36MhyzyFE6lOfmYlAepAdA",
        authDomain: "budgettracker-bb444.firebaseapp.com",
        projectId: "budgettracker-bb444",
        storageBucket: "budgettracker-bb444.appspot.com",
        messagingSenderId: "877359022917",
        appId: "1:877359022917:android:e1ba7ae16456d6b3fc742c",
      },
    },
    doctor: {
      reactNativeDirectoryCheck: {
        listUnknownPackages: false,
      },
    },
  },
};
