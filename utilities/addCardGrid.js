import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";

const AddCardGrid = ({ title = "Add Cards", cardTypes = [], onAddCard }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#15120F" }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 32 }}>
        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {cardTypes.map((item) => (
            <Pressable
              key={`${item.type}-${item.key}`}
              onPress={() => onAddCard(item.type)}
              style={{
                backgroundColor: "#322A28",
                borderRadius: 16,
                width: "45%",
                aspectRatio: 1,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              {item.icon}
              <Text
                style={{
                  color: "#BA9731",
                  marginTop: 10,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddCardGrid;
