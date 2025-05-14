import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { URL_ANDROID } from "@env";
import Colors from "../../constants/Colors";

export default function ForgotPasswordReset() {
    const router = useRouter();
    const { email, otp } = useLocalSearchParams();
    const [passwords, setPasswords] = useState({
      password: "",
      confirmPassword: ""
    });
    const [error, setError] = useState("");
  
    const handleSubmit = async () => {
      if (passwords.password !== passwords.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
  
      if (passwords.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
  
      try {
        const response = await axios.post(`${URL_ANDROID}/account/reset-password`, {
          email,
          otp,
          newPassword: passwords.password
        });
        
        if (response.data.success) {
          // Quay về login screen và xóa stack navigation history
          router.replace("/(tabs)/logintab");
        }
      } catch (error) {
        setError("Failed to reset password");
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.subText}>
          Enter your new password
        </Text>
  
        <View style={styles.inputWrapper}>
          <Text style={styles.inputText}>New Password</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              value={passwords.password}
              onChangeText={(text) => setPasswords(prev => ({...prev, password: text}))}
              placeholder="Enter new password"
              style={styles.input}
              secureTextEntry
            />
          </View>
        </View>
  
        <View style={styles.inputWrapper}>
          <Text style={styles.inputText}>Confirm Password</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              value={passwords.confirmPassword}
              onChangeText={(text) => setPasswords(prev => ({...prev, confirmPassword: text}))}
              placeholder="Confirm new password"
              style={styles.input}
              secureTextEntry
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Change Password</Text>
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