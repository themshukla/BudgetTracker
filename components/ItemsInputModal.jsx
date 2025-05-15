import React from "react";
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal as RNModal,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Text from "./Text";
import { Picker } from "@react-native-picker/picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const ItemsInputModal = ({
  modalVisible,
  setModalVisible,
  name,
  setName,
  category,
  setCategory,
  networth,
  setnetworth,
  planned,
  setPlanned,
  spent,
  setSpent,
  handleSave,
  errors,
  setErrors,
  modalType,
  itemFormType,
  categories,
  setModalEditMode,
}) => {
  const closeModal = () => {
    setModalEditMode(false);
    setModalVisible(false);
    setErrors({});
    setName("");
    setCategory("");
    setnetworth("");
    setPlanned("");
    setSpent("");
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.centeredView}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <View style={styles.modalView}>
            <Pressable style={{ left: 0 }} onPress={closeModal}>
              <FontAwesome5 name="times-circle" size={30} color="#FF5A5F" />
            </Pressable>
            <Text style={styles.modalText}>Enter Details</Text>

            {modalType === "asset" || modalType === "liability" ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter name"
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      setErrors({ ...errors, name: "" });
                    }}
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Networth:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter amount"
                    value={networth}
                    onChangeText={(value) => {
                      setnetworth(value);
                      setErrors({ ...errors, networth: "" });
                    }}
                    keyboardType="numeric"
                  />
                </View>
                {errors.networth ? (
                  <Text style={styles.errorText}>{errors.networth}</Text>
                ) : null}
              </>
            ) : itemFormType === "planned" ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter category name"
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      setErrors({ ...errors, name: "" });
                    }}
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Planned:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter planned amount"
                    value={planned}
                    onChangeText={(value) => {
                      setPlanned(value);
                      setErrors({ ...errors, planned: "" });
                    }}
                    keyboardType="numeric"
                  />
                </View>
                {errors.planned ? (
                  <Text style={styles.errorText}>{errors.planned}</Text>
                ) : null}
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Category:</Text>
                  <View style={{ flex: 1 }}>
                    <Picker
                      selectedValue={category}
                      onValueChange={(value) => {
                        setCategory(value);
                        setErrors({ ...errors, category: "" });
                      }}
                      style={{ color: "#BA9731" }}
                    >
                      <Picker.Item label="Select category" value="" />
                      {categories?.map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                      ))}
                    </Picker>
                  </View>
                </View>
                {errors.category ? (
                  <Text style={styles.errorText}>{errors.category}</Text>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter name (e.g., Walmart)"
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      setErrors({ ...errors, name: "" });
                    }}
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Spent:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter spent amount"
                    value={spent}
                    onChangeText={(value) => {
                      setSpent(value);
                      setErrors({ ...errors, spent: "" });
                    }}
                    keyboardType="numeric"
                  />
                </View>
                {errors.spent ? (
                  <Text style={styles.errorText}>{errors.spent}</Text>
                ) : null}
              </>
            )}

            <View style={styles.buttonContainer}>
              <Animated.View style={[animatedStyle]}>
                <Pressable
                  onPressIn={() => (scale.value = withSpring(0.95))}
                  onPressOut={() => (scale.value = withSpring(1))}
                  onPress={handleSave}
                  style={[styles.saveButton]}
                >
                  <FontAwesome5 name="save" size={20} color="#6b8e23" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalView: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 35,
    paddingVertical: 20,
    backgroundColor: "#322A28",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    width: "30%",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    height: 40,
    textAlign: "left",
    color: "#BA9731",
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "transparent",
    padding: 5,
    borderBottomWidth: 1,
    borderColor: "#fefefe",
  },
  errorText: {
    color: "#FF5A5F",
    fontSize: 13,
    marginLeft: "30%",
    marginTop: -5,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6b8e23",
    borderRadius: 10,
    padding: 6,
    width: "auto",
    marginRight: 15,
    padding: 10,
  },
  saveButtonText: {
    color: "#6b8e23",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ItemsInputModal;
