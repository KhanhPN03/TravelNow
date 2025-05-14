// components/payment/PaymentHeader.js
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Progress from "react-native-progress";
import Colors from "../../constants/Colors";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import CoundownTimer from "../../components/payment/CountdownTimer";

const PaymentHeader = ({ progressStep, onBackPress, bookingId }) => {
  return (
    <View style={styles.headerContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          position: "relative",
          width: "100%",     
          justifyContent: "center"
        }}
      >
        {progressStep > 0 && (
          <Pressable
            style={{
              position: "absolute",
              left: 0,               
            }}
            onPress={onBackPress}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </Pressable>
        )}
        <Text style={styles.headerText}>Payment Progress</Text>
      </View>
      <CoundownTimer bookingId={bookingId} />
      <Progress.Bar
        progress={progressStep / 2} // Giả sử có 2 bước, điều chỉnh nếu cần
        width={300}
        height={15}
        color={Colors.orange}
        unfilledColor="#e0e0e0"
        borderWidth={0}
        borderRadius={5}
      />
      <Text style={styles.stepText}>Step {progressStep + 1} of 2</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 10,
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontFamily: "GT Easti Bold",
    color: Colors.blackColorText
  },
  stepText: {
    fontSize: 14,
    fontFamily: "GT Easti Medium",
    color: Colors.blackColorText,
    
  },
});

export default PaymentHeader;