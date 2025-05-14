import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { URL_ANDROID } from "@env";
import Colors from "../../constants/Colors";
import { useLocalSearchParams } from "expo-router";

export default function ForgotPasswordOTP() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const { email } = useLocalSearchParams();
  
    const handleSubmit = async () => {  
      try {
        const response = await axios.post(`${URL_ANDROID}/account/verify-otp`, {
          email,
          otp
        });
        
        if (response.data.success) {
          router.push({
            pathname: "/forgotPassword/reset",
            params: { email, otp }
          });
        }
      } catch (error) {
        setError("Invalid OTP code");
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Enter Verification Code</Text>
        <Text style={styles.subText}>
          We've sent a verification code to your email
        </Text>
  
        <View style={styles.inputWrapper}>
          <Text style={styles.inputText}>Verification Code</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP code"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
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