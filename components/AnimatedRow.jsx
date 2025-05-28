import { View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import Text from "./Text";

const AnimatedRow = ({ label, value, children, style, textStyle }) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(450)}
      exiting={FadeOut.duration(400)}
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
