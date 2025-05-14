import { router } from "expo-router";
import React from "react";

import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from "react-native";

const titleToDisplay = [
  {
    title: "Settings",
    data: [
      { name: "Notifications" },
    ],
  },
  {
    title: "Support",
    data: [
      { name: "About TravelNow" },
      { name: "Help Center" },
      { name: "Chat with us" },
    ],
  },
  {
    title: "Legal",
    data: [
      { name: "Legal Notice" },
      { name: "Privacy" },
      { name: "Privacy Policy" },
    ],
  },
];

const handleFeature = (name) => {
  if (name === "Chat with us") {
    router.push("/chatbot");
  }
  if (name === "About TravelNow") {
    router.push("/aboutsUs");
  }
}

const Item = ({ name }) => (
  <TouchableOpacity onPress={() => handleFeature(name)}>
    <View style={styles.innerContainer}>
      <Text style={styles.itemText}>{name}</Text>
    </View>
  </TouchableOpacity>
);

const ListFunction = () => {
  const renderItem = ({ item }) => <Item name={item.name} />;

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.headerStyle}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        scrollEnabled={false}
        sections={titleToDisplay}
        // keyExtractor={(item, index) => item + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
  },
  itemText: {
    color: "#1A2B49",
    fontSize: 16,
  },
  headerStyle: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E9E9E9",
  },
  sectionHeader: {
    color: "#1A2B49",
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
  },
});

export default ListFunction;
