import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SectionList,
} from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.headerText}>Profile</Text>
        <Text style={styles.description}>
          Access your bookings from any device. Sign up, sync your existing
          bookings, add activities to your wishlist, and checkout quicker thanks
          to stored information.
        </Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.navigate("/logintab")}
        >
          <Text style={styles.loginButtonText}>Log in or sign up</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileHeader: {
    marginTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    paddingLeft: 20,
    paddingBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 180,
    alignSelf: "center",
    marginBottom: 30,
  },
  loginButtonText: {
    alignItems: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
