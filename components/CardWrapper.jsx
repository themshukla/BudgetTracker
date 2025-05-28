import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const CardWrapper = ({
  children,
  isRemoving,
  cardId,
  onExitComplete,
  onEnterComplete,
  index,
}) => {
  const translateX = useSharedValue(-500);
  const opacity = useSharedValue(0);
  const [hasEntered, setHasEntered] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!hasEntered) {
      const delay = index * 350;

      setTimeout(() => {
        translateX.value = withTiming(0, { duration: 400 });
        opacity.value = withTiming(1, { duration: 400 }, () => {
          runOnJS(setHasEntered)(true);
          if (onEnterComplete) runOnJS(onEnterComplete)();
        });
      }, delay);
    } else if (isRemoving) {
      translateX.value = withTiming(-500, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished && onExitComplete) {
          runOnJS(onExitComplete)(cardId);
        }
      });
    }
  }, [isRemoving, hasEntered]);

  return (
    <View style={styles.card}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 5,
  },
});

export default CardWrapper;
