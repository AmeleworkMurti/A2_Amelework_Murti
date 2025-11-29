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

      const response = await fetch(url);

      if (!response.ok) {
        // Network/HTTP error (e.g. invalid key, 4xx/5xx)
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();

      if (!json || !json.data) {
        throw new Error("Invalid response from the currency API.");
      }

      const rate = json.data[dest];

      if (!rate) {
        throw new Error(
          `The currency "${dest}" was not found in the API response.`
        );
      }
      const converted = numericAmount * rate;

      setExchangeRate(rate);
      setConvertedAmount(converted);
    } catch (err) {
      // error messages
      if (err.message.includes("status 401") || err.message.includes("403")) {
        setError("Invalid or missing API key. Please check your API key.");
      } else if (err.message.startsWith("Request failed with status")) {
        setError("Error from API: " + err.message);
      } else {
        setError("Network or API error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
   
  return (
   
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Currency Converter</Text>

        <LabeledInput
          label="Base Currency Code"
          value={baseCurrency}
          onChangeText={setBaseCurrency}
          placeholder="CAD"
          placeholderTextColor="#9CA3AF"

        />
        <LabeledInput
          label="Destination Currency Code"
          value={destCurrency}
          onChangeText={setDestCurrency}
          placeholder="USD"
          placeholderTextColor="#9CA3AF"

        />
        <LabeledInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="1"
          placeholderTextColor="#9CA3AF"

          keyboardType="numeric"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonWrapper}>
          <Button
            title={loading ? "Converting..." : "Convert"}
            onPress={handleConvert}
            disabled={loading} //Disable button while loading
          />
        </View>

        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Fetching exchange rate…</Text>
          </View>
        )}

        {exchangeRate !== null && convertedAmount !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              {amount} {baseCurrency.toUpperCase()} ={" "}
              {convertedAmount.toFixed(2)} {destCurrency.toUpperCase()}
            </Text>
            <Text style={styles.rateText}>
              Exchange rate used: 1 {baseCurrency.toUpperCase()} ={" "}
              {exchangeRate} {destCurrency.toUpperCase()}
            </Text>
          </View>
        )}
         <TouchableOpacity
          style={styles.aboutLink}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={styles.aboutLinkText}>Go to About Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


// AboutScreen: name, ID, short description
const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About This App</Text>

      
      <Text style={styles.aboutText}>Name: Amelework Murti</Text>
      <Text style={styles.aboutText}>ID: 101378582</Text>

      <Text style={[styles.aboutText, { marginTop: 16 }]}>
           This application converts an amount from a base currency into a
        destination currency using live exchange rates from freecurrencyapi.com.
        The user enters the base currency code, destination currency code, and
        amount, and the app fetches the latest rate and shows the converted
        value.
      </Text>
    </View>
  );
};
// Root App with Stack Navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: "Currency Converter" }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "About" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Simple styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 50,
    backgroundColor: "soft_grey", 
   

  },

  // Title styling
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
    color: "#1A1D1F",
  },
// Input wrapper
  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: "600",
    color: "#374151",
    
  },

  // Text input box
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "white",
    fontSize: 15,
    color: "grey",