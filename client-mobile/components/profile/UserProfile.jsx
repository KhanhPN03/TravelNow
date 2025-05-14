import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import Colors from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { URL_ANDROID } from "@env";
import axios from "axios";

const UserProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [unreadCount, setUnreadCount] = useState(0); // Số lượng thông báo chưa đọc

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);
        if (user) {
          setUsername(user.username);
          setEmail(user.email);
          setUserId(user._id);
          fetchUnreadNotifications(user._id, user.role || "customer"); // Gọi ngay sau khi có userId
        }
      } catch (error) {
        console.error("Error fetching user: ", error);
      }
    };
    getUser();
  }, []);

  const fetchUnreadNotifications = async (userId, role) => {
    if (!userId) return;
    try {
      const response = await axios.get(
        `${URL_ANDROID}/notification/check-notification/${userId}/${role}`
      );
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
          <Pressable
            onPress={() => router.push(`/notifications/${userId}`)}
            style={styles.notificationIcon}
          >
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
            <Ionicons name="notifications" size={18} color={Colors.blackColorText} />
          </Pressable>
        </View>
        <Text style={styles.description}>
          <Text style={styles.username}>{username}</Text>
          {"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    paddingBottom: 12,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "GT Easti Bold",
  },
  notificationIcon: {
    borderWidth: 1,
    padding: 6,
    borderRadius: 50,
    borderColor: Colors.grey,
    position: "relative",
  },
  badge: {
    width: 16,
    height: 16,
    position: "absolute",
    backgroundColor: "red",
    borderRadius: 50,
    right: -2,
    top: -2,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.blackColorText,
  },
  email: {
    fontFamily: "GT Easti Regular",
  },
});

export default UserProfile;
