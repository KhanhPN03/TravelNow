import * as React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { ChildComponent } from "./PaymentHeader";
import FeatherIcon from "react-native-vector-icons/Feather";
import Error from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../constants/Colors";
import { URL_ANDROID } from "@env";
import axios from "axios";
import PaymentInfoSection from "./PaymentInfoSection";

export default function PaymentSection1({
  handleChange,
  errors,
  customer,
  setCustomer,
  order,
  bookingId,
  setOrder,
  totalMoney,
  onProgressNext,
  validateForm,
}) {
  const validNextStep = async () => {
    if (validateForm(customer)) {
      try {
        const response = await axios.put(
          `${URL_ANDROID}/booking/update/${bookingId}`, // Thay bằng API thực tế
          {
            buyerName: customer.fullname,
            buyerEmail: customer.email,
            buyerPhone: customer.phone,
          }
        );

        if (response.status === 200) {
          setOrder({
            ...order,
            buyerName: customer.fullname,
            buyerEmail: customer.email,
            buyerPhone: customer.phone,
          });

          onProgressNext();
        } else {
          Alert.alert(
            "Error",
            response.data.message || "Failed to update booking"
          );
        }
      } catch (error) {
        console.error("Update booking failed:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } else {
      Alert.alert(
        "Warning",
        "You just missed some fields. Please fill all of them to continue",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
  };

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);
        if (user) {
          setCustomer({
            fullname: user.firstname + " " + user.lastname,
            email: user.email,
            phone: user.phone,
          });
          validateForm({
            fullname: user.firstname + " " + user.lastname,
            email: user.email,
            phone: user.phone,
          })
        }
      } catch (error) {
        console.error("Error fetching user: ", error);
      }
    };
    getUser();
  }, []);

  return (
    <ScrollView
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Text style={styles.textTitle}>Enter your personal details</Text>
        <View style={styles.d_flex}>
          <Image
            width={16}
            height={16}
            source={require("../../assets/images/secure_green.png")}
          />
          <Text style={styles.t_14_g}>Check out is fast and secure</Text>
        </View>
        <View>
          <View style={{ marginTop: 12 }}>
            <View style={styles.inputContainer}>
              <View style={{ width: "90%" }}>
                <Text style={styles.inputTitle}>
                  Full name <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={customer.fullname}
                  placeholder="Enter your name"
                  onChangeText={(text) => handleChange("fullname", text)}
                />
              </View>
              {!errors.fullname ? (
                <FeatherIcon
                  style={styles.validIcon}
                  name="check-circle"
                  color="green"
                  size={20}
                />
              ) : (
                <Error
                  style={styles.invalidIcon}
                  name="error"
                  color="red"
                  size={20}
                />
              )}
            </View>
            {errors.fullname && (
              <Text style={{ color: "red" }}>{errors.fullname}</Text>
            )}
            <View style={styles.inputContainer}>
              <View style={{ width: "90%" }}>
                <Text style={styles.inputTitle}>
                  Email <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={customer.email}
                  placeholder="Enter your name"
                  onChangeText={(text) => handleChange("email", text)}
                />
              </View>
              {!errors.email ? (
                <FeatherIcon
                  style={styles.validIcon}
                  name="check-circle"
                  color="green"
                  size={20}
                />
              ) : (
                <Error
                  style={styles.invalidIcon}
                  name="error"
                  color="red"
                  size={20}
                />
              )}
            </View>
            {errors.email && (
              <Text style={{ color: "red" }}>{errors.email}</Text>
            )}

            <View style={styles.inputContainer}>
              <View style={{ width: "90%" }}>
                <Text style={styles.inputTitle}>
                  Phone Number <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={customer.phone}
                  placeholder="Enter your phone number"
                  onChangeText={(text) => handleChange("phone", text)}
                />
              </View>
              {!errors.phone ? (
                <FeatherIcon
                  style={styles.validIcon}
                  name="check-circle"
                  color="green"
                  size={20}
                />
              ) : (
                <Error
                  style={styles.invalidIcon}
                  name="error"
                  color="red"
                  size={20}
                />
              )}
            </View>
            {errors.phone && (
              <Text style={{ color: "red" }}>{errors.phone}</Text>
            )}
          </View>
          <PaymentInfoSection />
        </View>
        {/* footer */}

        <View style={styles.footerStyle}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              ₫{totalMoney}
            </Text>
            <Text>Total</Text>
          </View>
          <Pressable style={styles.paymentBtn} onPress={validNextStep}>
            <Text style={{ color: "#fff", fontSize: 14 }}>Go to payment</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 20,
    flex: 1,
  },
  mtb8: {
    marginVertical: 12,
  },
  d_flex: {
    display: "flex",
    flexDirection: "row",
  },

  t_14_g: {
    color: "green",
    fontSize: 14,
    paddingLeft: 8,
  },

  textTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 12,
    color: Colors.blackColorText,
  },
  inputContainer: {
    marginTop: 12,
    borderStyle: "solid",
    width: "100%",
    height: "fit-content",
    flexDirection: "row",
    borderWidth: 0.5,
    borderRadius: 4,
  },
  inputTitle: {
    fontWeight: "bold",
    paddingLeft: 8,
    paddingTop: 4,
    opacity: 0.7,
    color: Colors.black,
  },
  textInput: {
    paddingLeft: 8,
    fontSize: 16,
    width: "100%",
    fontFamily: "Roboto Regular",
  },
  paymentBtn: {
    width: "auto",
    backgroundColor: "#0071EB",
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footerStyle: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  textLink: {
    color: "#0071EBE5",
  },
  validIcon: {
    marginVertical: "auto",
  },
  invalidIcon: {
    marginVertical: "auto",
  },
});
