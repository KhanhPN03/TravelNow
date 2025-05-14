import { View, Text, StyleSheet } from "react-native";

function ActivityExperienceHeader({ name }) {
  return (
    <View style={styles.supContainer}>
      <Text style={styles.title}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  supContainer: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
  },

  title: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ActivityExperienceHeader;
