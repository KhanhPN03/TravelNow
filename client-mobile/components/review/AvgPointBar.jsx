import { View } from "react-native";

function AvgPointBar({ avg }) {
  return (
    <View
      style={{
        backgroundColor: "#D9D9D9",
        width: 160,
        height: 12,
        borderRadius: 8,
      }}
    >
      <View
        style={{
          backgroundColor: "#FFD938",
          width: (avg / 5) * 160,
          height: 12,
          borderRadius: 8,
        }}
      ></View>
    </View>
  );
}

export default AvgPointBar;
