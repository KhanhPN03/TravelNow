import React, { useState, useEffect, useRef, useContext } from "react";
import { Alert, AppState, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { URL_ANDROID } from "@env";
import { PaymentContext } from "../../context/PaymentProvider";

function CountdownTimer() {  

  const {timeLeft, setTimeLeft} = useContext(PaymentContext);
  const appState = React.useRef(AppState.currentState);
  const lastBackgroundTime = useRef(null);



  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        // App chuyển sang background, lưu lại thời điểm
        lastBackgroundTime.current = Date.now();
      }
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App quay lại foreground, tính toán thời gian đã trôi qua
        if (lastBackgroundTime.current) {
          const elapsedTime = Math.floor((Date.now() - lastBackgroundTime.current) / 1000); // Tính bằng giây
          setTimeLeft((prev) => Math.max(prev - elapsedTime, 0));
          lastBackgroundTime.current = null;
        }
      }
      appState.current = nextAppState;
    };

    // Lắng nghe sự thay đổi của trạng thái ứng dụng
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);



  useEffect(() => {
    if (timeLeft <= 0) {
      const timeout = setTimeout(() => {
        router.replace("/"); // Tự động chuyển hướng sau 5 giây
      }, 5000);

      Alert.alert("Warning", "We can only hold your spot for about 10 minutes", [
        {
          text: "OK",
          onPress: () => {
            clearTimeout(timeout); // Hủy tự động chuyển hướng nếu người dùng nhấn OK
            router.replace("/");
          },
        },
      ]);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeLeft]);

  // Định dạng thời gian thành mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#FFE8ED",
        width: "100%",
        paddingVertical: 4,
        justifyContent: "center",
        borderRadius: 10,
        marginVertical: 6,
      }}
    >
      <MaterialCommunityIcons name="timer-outline" size={14} color="red" />
      <Text>We'll hold your spot for {formatTime(timeLeft)} minutes</Text>
    </View>
  );
}

export default CountdownTimer;
