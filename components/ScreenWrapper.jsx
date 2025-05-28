import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const ScreenWrapper = ({ children }) => {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(isFocused ? 1 : 0);
  const display = useSharedValue(isFocused ? 1 : 0); // use to avoid full unmount flicker

  useEffect(() => {
    if (isFocused) {
      display.value = 1;
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      opacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          display.value = 0;
        }
      });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    display: display.value === 0 ? "none" : "flex",
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15120F",
  },
});

export default ScreenWrapper;
