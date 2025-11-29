import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


const Stack = createNativeStackNavigator();

const API_KEY = "fca_live_1wlibatIllp4HFv7Wq6CCCXAzCuEq113mgaFVe3i";

//Reusable labeled input component (for optional requirement part)
const LabeledInput = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      autoCapitalize="characters"
    />
  </View>
);

//MainScreen: main functionality
const MainScreen = ({ navigation }) => {
  const [baseCurrency, setBaseCurrency] = useState("CAD");
  const [destCurrency, setDestCurrency] = useState("");
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);

  const validateInputs = () => {
    const currencyRegex = /^[A-Z]{3}$/;

    if (!currencyRegex.test(baseCurrency.trim())) {
      return "Base currency must be a 3-letter UPPERCASE code (e.g. CAD).";
    }

    if (!currencyRegex.test(destCurrency.trim())) {
      return "Destination currency must be a 3-letter UPPERCASE code (e.g. USD).";
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return "Amount must be a positive number.";
    }

    return null;
  };

  const handleConvert = async () => {
    setError("");
    setExchangeRate(null);
    setConvertedAmount(null);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    const base = baseCurrency.trim().toUpperCase();
    const dest = destCurrency.trim().toUpperCase();
    const numericAmount = Number(amount);

    setLoading(true);

    try {
      const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&base_currency=${base}&currencies=${dest}`;