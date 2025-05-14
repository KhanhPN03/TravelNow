import { View, Text, StyleSheet } from "react-native";
import AvgPointBar from "./AvgPointBar";

function ReviewSummaryCategory({ category, avg }) {
  return (
    <View style={styles.feedbackSummaryCategory}>
      <Text style={styles.category}>{category}</Text>
      <AvgPointBar avg={avg} />
      <Text>{avg}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackSummaryCategory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  category: {
    minWidth: 80,
    color: "#1A2B49",
    fontWeight: "500",
  },
});

export default ReviewSummaryCategory;
