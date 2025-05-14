import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, BackHandler } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { URL_ANDROID } from "@env";
import Colors from "../../constants/Colors";

export default function ForgotPasswordEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add useEffect to handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress', 
      () => {
        // Navigate back to login explicitly
        router.navigate('/');
        return true; // Prevent default back button behavior
      }
    );

    return () => backHandler.remove(); // Cleanup listener
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Reset previous error
    setError("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      const response = await axios.post(`${URL_ANDROID}/account/forgot-password`, {
        email: email.toLowerCase(),
      });

      // Stop loading
      setIsLoading(false);

      if (response.data.success) {
        router.push({
          pathname: "/forgotPassword/otp",
          params: { email: email }
        });
      }
    } catch (error) {
      // Stop loading
      setIsLoading(false);
      setError("Email not found");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forgot Password</Text>
      <Text style={styles.subText}>
        Enter your email address and we'll send you a verification code
      </Text>
      
      <View style={styles.inputWrapper}>
        <Text style={styles.inputText}>Email Address</Text>
        <View style={styles.fieldStyle}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator 
            color={Colors.blackColorText} 
            size="small" 
          />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
      paddingTop: 50,
    },
    header: {
      fontSize: 25,
      textTransform: "uppercase",
      textAlign: "center",
      color: Colors.blackColorText,
      fontFamily: "GT Easti Bold",
      fontWeight: "900",
      marginBottom: 10,
    },
    subText: {
      fontSize: 14,
      textAlign: "center",
      color: Colors.grey,
      marginBottom: 30,
      fontFamily: "GT Easti Bold",
    },
    inputWrapper: {
      marginBottom: 15,
    },
    inputText: {
      fontSize: 15,
      color: Colors.blackColorText,
      fontWeight: "700",
      marginBottom: 10,
      fontFamily: "GT Easti Bold",
    },
    fieldStyle: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      fontFamily: "Roboto Regular",
      fontSize: 15,
    },
    button: {
      backgroundColor: "#fff",
      padding: 15,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "black",
      marginTop: 20,
    },
    buttonText: {
      color: "#333",
      fontSize: 13,
      fontWeight: "bold",
      fontFamily: "GT Easti Bold",
    },
    error: {
      color: "red",
      fontStyle: "italic",
      marginTop: 5,
    },
  });