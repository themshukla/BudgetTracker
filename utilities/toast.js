// utilities/toast.js
import Toast from "react-native-root-toast";
import { initialWindowMetrics } from "react-native-safe-area-context";

const TOAST_COLORS = {
  success: "#4BB543",
  error: "#D33F49",
  info: "#4F6D7A",
  warning: "#FFA500",
};

export const showToast = (message, type = "info") => {
  const topInset = initialWindowMetrics?.insets?.top || 20;

  const toast = Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.TOP,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor: TOAST_COLORS[type],
    textColor: "white",
    containerStyle: {
      marginTop: topInset + 10,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    textStyle: {
      fontSize: 16, // ✅ Increased font size
      fontWeight: "500",
    },
  });

  setTimeout(() => {
    Toast.hide(toast);
  }, 2000);
};
