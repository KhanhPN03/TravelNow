import { View, Pressable, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

function ActivityExperience({ name, url, params, onPress }) {
  const content = (
    <Pressable 
      style={styles.supContainer}
      onPress={onPress}
    >
      <View style={styles.pressableArea}>
        <Text style={styles.pressableAreaText}>{name}</Text>
        <AntDesign name="right" size={16} color="#1A2B49" />
      </View>
    </Pressable>
  );

  if (!url || onPress) {
    return content;
  }

  return (
    <Link
      href={{
        pathname: url,
        params: { tour: params },
      }}
      asChild
    >
      {content}
    </Link>
  );
}

const styles = StyleSheet.create({
  supContainer: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },

  pressableArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pressableAreaText: {
    color: "#1A2B49",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default ActivityExperience;