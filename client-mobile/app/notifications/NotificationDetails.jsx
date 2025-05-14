import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useEffect, useState } from "react";
import axios from "axios";
import {URL_ANDROID} from "@env";


function NotificationDetails() {
  const router = useRouter();
  const {notificationId} = useLocalSearchParams();
  const [notification, setNotification] = useState();
  const [loading, setLoading] = useState(true); // Trạng thái loading

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

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await axios.get(`${URL_ANDROID}/notification/${notificationId}`);
        console.log(response.data);
        setNotification(response.data.notification);
      } catch (error) {
        console.log(error);
        alert(error.response.data.message);
      } finally {
        setLoading(false); // Kết thúc loading sau khi lấy dữ liệu
      }
    };
    fetchNotification();
  }, []);
  // Lấy icon theo loại thông báo
  const getIconForType = (type) => {
    return type === "REFUND" ? (
      <FontAwesome name="dollar" size={40} color="#FF9800" />
    ) : type === "RECEIVE DISCOUNT" ? (
      <Ionicons name="pricetags" size={40} color={Colors.orange} />
    ) : null;
  };

  // Hiển thị thông tin chi tiết theo phong cách blog
  const renderNotificationInfo = () => {
    return (
      <ScrollView style={styles.container}>
        {/* Header Blog */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            {getIconForType(notification.type)}
          </View>
          <Text style={styles.title}>{notification.type} Update</Text>
          <Text style={styles.date}>
            {formatDateString(notification.createdAt)}
          </Text>
        </View>

        {/* Body Blog */}
        <View style={styles.body}>
          <Text style={styles.message}>{notification.message}</Text>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Details:</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {notification.type === "REFUND"
                  ? `- TicketRef: ${notification.information.refund.ticketCode}\n- Amount: ${notification.information.refund.amount} VND`
                  : notification.type === "RECEIVE DISCOUNT"
                  ? `- Discount Code: ${notification.information.discount.discountCode}\n- Valid Until: ${formatDateString(notification.information.discount.discountDateEnd)}`
                  : "No details available."}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          {notification.type === "REFUND" && (
            <Text style={styles.note}>
            📌 Note: Thank you for your patience! The refund has been processed and should reflect in your account.
            </Text>
          )}
          {notification.type === "RECEIVE DISCOUNT" && (
            <Text style={styles.note}>
            📌 Note: Use your discount code at checkout to enjoy the offer!
            </Text>
          )}
          
        </View>

        {/* Footer Blog */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.backButtonText}>Return to Notifications</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return <View style={styles.container}>
      {loading ? ( 
        <ActivityIndicator size="large" color={Colors.orange} style={{ marginTop: 20 }} />
      ) : (
        renderNotificationInfo()
      )}
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  headerIconContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#2C3E50",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  date: {
    fontSize: 16,
    color: "#ECF0F1",
    marginTop: 5,
    opacity: 0.9,
  },
  body: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 15,
    marginTop: -20,
    marginHorizontal: 10,
    elevation: 3,
  },
  message: {
    fontSize: 20,
    color: "#2C3E50",
    lineHeight: 28,
    marginBottom: 20,
    textAlign: "left",
    fontStyle: "italic",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2980B9",
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: "#ECF0F1",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#3498DB",
  },
  infoText: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#BDC3C7",
    marginVertical: 15,
  },
  note: {
    fontSize: 16,
    color: "#7F8C8D",
    lineHeight: 22,
    paddingLeft: 5,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  backButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 2,
  },
  buttonContent: {
    backgroundColor: "#1E90FF",
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotificationDetails;
