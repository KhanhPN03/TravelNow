import { router, useLocalSearchParams } from "expo-router";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { URL_ANDROID } from "@env";
import axios from "axios";

function Notification() {
  const { userId } = useLocalSearchParams();
  const [notifications, setNotifications] = useState([]);

  // Hàm định dạng ngày
  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Kiểm tra xem thông báo đã được đọc bởi userId chưa
  const isReadByUser = (notification) => {
    return notification.readBy.some((read) => read.userId === userId);
  };

  // Gọi API để đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationId) => {
    try {
      // Gọi API mark-as-read
      await axios.put(`${URL_ANDROID}/notification/${notificationId}`, {
        userId,
      });

      // Cập nhật state để phản ánh trạng thái đã đọc
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                readBy: [...notification.readBy, { userId }],
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    const getNotificationCustomer = async () => {
      try {
        const response = await axios.get(
          `${URL_ANDROID}/notification/customer/${userId}`
        );
        const { discountNotifications, refundNotifications } = response.data;

        // Kết hợp hai mảng
        const mergedNotifications = [
          ...discountNotifications,
          ...refundNotifications,
        ];
        
        // Sắp xếp giảm dần theo createdAt
        mergedNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Lưu vào state
        setNotifications(mergedNotifications);
      } catch (error) {
        console.log(error);
      }
    };
    getNotificationCustomer();
  }, []);

  // Render mỗi item thông báo
  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: isReadByUser(item) ? "#F5F5F5" : "#E6F0FA" },
        ]}
        onPress={() => {
          if (!isReadByUser(item)) {
            markAsRead(item._id); // Đánh dấu đã đọc nếu chưa đọc
          }
          // Điều hướng đến màn hình chi tiết (nếu cần)
          router.push({
            pathname: "/notifications/NotificationDetails",
            params: { notificationId: item._id },
          });
        }}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>
              [{item.type}] {item.message}
            </Text>

            <Text style={styles.notificationDate}>
              {formatDateString(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header với nút Back */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={{ padding: 8 }}
        >
          <AntDesign name="arrowleft" size={24} color="#1A2B49" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 23,
            fontWeight: "bold",
            color: "#1A2B49",
            marginLeft: 10,
          }}
        >
          Notifications
        </Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AntDesign name="inbox" size={50} color="#B0BEC5" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubText}>
              You'll see updates here when you have new notifications.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
    paddingHorizontal: 22,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1A2B49",
  },
  listContainer: {
    paddingBottom: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2B49",
    marginBottom: 4,
  },
  notificationInfo: {
    fontSize: 14,
    color: "#858995",
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: "#B0BEC5",
  },
  notificationIcon: {
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2B49",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#858995",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default Notification;
