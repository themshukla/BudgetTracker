import React from "react";
import { Button, Alert, Platform, ToastAndroid } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import { showToast } from "../utilities/toast.js";

const ExportCSVButton = ({
  data,
  filename = "export.csv",
  disabled = false,
}) => {
  const showSuccessToast = () => {
    showToast("User data exported successfully!", "success");
  };

  const exportData = async () => {
    try {
      const csv = Papa.unparse(data);
      const resolvedFilename = filename.endsWith(".csv")
        ? filename
        : `${filename}.csv`;
      const fileUri = FileSystem.documentDirectory + resolvedFilename;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri);
      showSuccessToast();
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export failed", error.message);
    }
  };

  const handleExport = () => {
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      typeof data[0] !== "object"
    ) {
      Alert.alert("No data to export", "Expected an array of objects.");
      return;
    }

    Alert.alert(
      "Export Data",
      "Are you sure you want to export your data to CSV?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: exportData },
      ]
    );
  };

  return (
    <Button title="Export to CSV" onPress={handleExport} disabled={disabled} />
  );
};

export default ExportCSVButton;
