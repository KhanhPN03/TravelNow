import * as React from "react";
import { ScrollView, View, ActivityIndicator, StyleSheet, Text } from "react-native";

import ProfileScreen from "../../components/profile/ProfileScreen";
import ListFunction from "../../components/profile/ListFunction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserProfile from "../../components/profile/UserProfile";
import ListFunctionUser from "../../components/profile/ListFunctionUser";

export default function Profile() {
  const [id, setId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);  // Thêm state loading

  React.useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true); // Bắt đầu loading
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);
        if (user) {
          setId(user._id);
        } else {
          setId(null);
        }
      } catch (error) {
        console.log("error profile: ", error);
      } finally {
        setLoading(false); // Dừng loading sau khi hoàn thành hoặc gặp lỗi
      }
    };
    getUser();
  }, []); // Loại bỏ `id` khỏi dependency array.  Chỉ cần gọi useEffect một lần khi component mount.

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        {!id ? (
          <>
            <ProfileScreen />
            <ListFunction />
          </>
        ) : (
          <>
            <UserProfile />
            <ListFunctionUser />
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
});