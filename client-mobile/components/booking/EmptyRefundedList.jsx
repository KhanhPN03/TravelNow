import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';

const EmptyRefundedList = () => {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../assets/images/empty_refund.png")}
        resizeMode="cover"
        style={{width: 150, height: 150}}
      />
      <Text style={styles.emptyTitleText}>No refunded tickets</Text>
      <Text style={styles.emptyDescText}>
        Any tickets you've requested a refund for will appear here
      </Text>
      <Link href={"/(tabs)"} asChild>
        <Pressable style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Explore tours</Text>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 20
  },
  emptyTitleText: {
    color: "#1A2B49",
    fontSize: 18,
    fontFamily: "GT Easti Bold",
    marginBottom: 8
  },
  emptyDescText: {
    width: "80%",
    textAlign: "center",
    marginBottom: 24,
    color: "#858995",
    fontFamily: "GT Easti Regular",
    fontSize: 14,
    lineHeight: 20
  },
  exploreButton: {
    backgroundColor: "#0071EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "GT Easti Bold",
  }
});

export default EmptyRefundedList;