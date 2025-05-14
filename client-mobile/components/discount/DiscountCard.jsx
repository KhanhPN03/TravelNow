import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

function DiscountCard({ item, button }) {
  const isInactive = !item.isActive; // Kiểm tra trạng thái

  return (
    <View style={[styles.discountItem, isInactive && styles.inactiveDiscount]}>
      <View style={styles.discountCode}>
        <Image
          style={{
            width: 50,
            height: 50,
            opacity: isInactive ? 0.5 : 1, // Giảm độ sáng nếu không active
          }}
          resizeMode="contain"
          source={require("../../assets/images/logo_login_mobile.png")}
        />
        <Text style={[styles.discountText, isInactive && styles.inactiveText]}>
          {item.discountCode}
        </Text>
      </View>

      <View style={styles.discountInfoContainer}>
        <View style={styles.discountInfo}>
          <Text
            style={[styles.discountPrice, isInactive && styles.inactiveText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Discount ₫{item.discountPrice}
          </Text>
          <Text
            style={[styles.orderMin, isInactive && styles.inactiveText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            For orders from ₫{item.minTotalPrice}
          </Text>
          <Text
            style={[styles.expiryText, isInactive && styles.inactiveText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            <Text
              style={{
                fontWeight: "bold",
                color: isInactive ? Colors.orange : Colors.orangeMedium,
              }}
            >
              {isInactive ? "Expired on:" : "Expires on:"}
            </Text>{" "}
            {item.discountDateEnd}
          </Text>
        </View>

        {/* Sửa đổi: Đảm bảo button không làm tràn layout */}
        <View style={styles.buttonContainer}>
          {!isInactive && button}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  discountCode: {
    alignItems: "center",
    width: 75,
    flexShrink: 0, // Không co lại nếu nội dung quá dài
  },
  discountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    gap: 16,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountInfoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    marginLeft: 12,
    alignItems: "flex-end",
  },
  discountInfo: {
    rowGap: 4,
    flex: 1, // Chiếm không gian còn lại
    flexWrap: "wrap", // Tự động xuống dòng nếu nội dung dài
  },
  discountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.blackColorText,
  },
  discountPrice: {
    fontSize: 18,
    fontFamily: "GT Easti Medium",
    color: Colors.blackColorText,
  },
  orderMin: {
    fontSize: 15,
  },
  expiryText: {
    color: Colors.grey,
  },
  // 🌟 UI cho items không active
  inactiveDiscount: {
    borderColor: "#D1D5DB", // Viền xám hơn
  },
  inactiveText: {
    color: "#9CA3AF", // Chữ xám nhạt
  },
});

export default DiscountCard;
