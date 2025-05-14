import React, { useState, useEffect, useRef, useContext } from "react";
import { Alert, AppState, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";


function CountdownTimer({timeLeft, setTimeLeft}) {  

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
        marginTop: 12
      }}
    >
      <MaterialCommunityIcons name="timer-outline" size={14} color="red" />
      <Text>We'll hold your spot for {formatTime(timeLeft)} minutes</Text>
    </View>
  );
}

export default CountdownTimer;
