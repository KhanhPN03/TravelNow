import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {URL_ANDROID} from "@env";
import axios from "axios";

function PaymentCancel() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

  const handleRetry = () => {
    // Điều hướng về trang thanh toán hoặc trang yêu cầu người dùng thử lại
    router.push("/");
  };

  useEffect(() => {
    console.log("payemnt cancel");
    
  })
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Failed Payment</Text>
      <Text style={styles.message}>    
        Your payment has failed. Please try again. 
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleRetry}>
        <Text style={styles.buttonText}>Go to discover</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#cc0000",
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#cc0000",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PaymentCancel;
