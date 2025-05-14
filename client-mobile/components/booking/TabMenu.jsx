import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const TabMenu = ({ activeTab, setActiveTab }) => {
  const tabs = ["Upcoming", "Completed", "Refunded"];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    borderRadius: 10,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
    width: "100%",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#0066ff",
  },
  tabText: {
    fontSize: 15,
    color: "#666",
    fontFamily: "GT Easti Medium",
  },
  activeTabText: {
    color: "white",
    fontWeight: "500",
  },
});

export default TabMenu;
