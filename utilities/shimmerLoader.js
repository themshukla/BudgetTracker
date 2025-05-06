// utilities/shimmerLoader.js
import React from "react";
import { View } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";

const ShimmerLoader = ({ rows = 6 }) => {
  return (
    <View style={{ padding: 20 }}>
      {[...Array(rows)].map((_, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <ShimmerPlaceHolder
            style={{
              height: 30,
              width: "100%",
              marginBottom: 8,
              borderRadius: 4,
            }}
            shimmerColors={["#2a2015", "#3b2a1f", "#2a2015"]}
          />
          <ShimmerPlaceHolder
            style={{ height: 30, width: "80%", borderRadius: 4 }}
            shimmerColors={["#2a2015", "#3b2a1f", "#2a2015"]}
          />
        </View>
      ))}
    </View>
  );
};

export default ShimmerLoader;
