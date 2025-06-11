import { View } from "react-native";
import Animated, {
  FadeInUp,
  FadeInLeft,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import Text from "./Text";

const AnimatedRow = ({ label, value, children, style, textStyle }) => {
  return (
    <Animated.View
      entering={FadeInLeft.duration(550)}
      exiting={FadeOut.duration(550)}
      layout={LinearTransition.springify()}
    >
      {children ? (
        children
      ) : (
        <View style={style}>
          <Text style={textStyle}>{label}</Text>
          <Text style={textStyle}>{value}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default AnimatedRow;
