import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

const CreditCardModal = ({ visible, onClose, handleBooking }) => {
  const [inputLeftCol, setInputLeftCol] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const router = useRouter();

  const showToast = () => {
    ToastAndroid.show("Request sent successfully!", ToastAndroid.SHORT);
  };

  const handleSubmit = () => {  
    handleBooking();
    showToast();

    setSuccessVisible(true);

    setTimeout(() => {
      setSuccessVisible(false);
      router.push("/(tabs)/booking");
    }, 3000);
  };

  return (
    <View style={{ flex: 1 }}>
      <Modal
        isVisible={visible && !successVisible}
        onBackdropPress={onClose}
        style={{ margin: 0, justifyContent: "flex-end" }}
        avoidKeyboard // This prop helps avoid keyboard issues
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust this value as needed
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>Enter Credit Card Information</Text>
            <View style={styles.inputLine}>
              <TextInput
                style={[styles.input, styles.inputLeftCol]}
                placeholder="Card Number"
                keyboardType="numeric"
                value={inputLeftCol}
                onChangeText={setInputLeftCol}
              />
              <TextInput
                style={[styles.input, styles.inputRightCol]}
                placeholder="CVV/CVC"
                keyboardType="numeric"
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
            <View style={styles.inputLine}>
              <TextInput
                style={[styles.input, styles.inputLeftCol]}
                placeholder="Name on Card"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, styles.inputRightCol]}
                placeholder="Expiry Date"
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.CreditPayBtn} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal
        isVisible={successVisible}
        transparent={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <View style={styles.successModalContainer}>
          <View style={styles.successModalContent}>
            <Ionicons name="checkmark-circle" size={48} color="green" />
            <Text style={styles.successTitle}>Your tour is ready!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
  },
  modalContent: {
    padding: 20,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  CreditPayBtn: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  inputLeftCol: {
    width: "60%",
    marginRight: 20,
  },
  inputLine: {
    flexDirection: "row",
  },
  inputRightCol: {
    width: "30%",
  },
  successModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successModalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    elevation: 5,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
});

export default CreditCardModal;
