import { Text, View, StyleSheet } from "react-native";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons"; // Sử dụng nhiều icon để minh họa
import { router } from "expo-router";

export default function PaymentInfoSection() {
  // Hàm render từng mục với icon và text
  const renderInfoItem = (iconName, iconLibrary, text, links = []) => (
    <View style={styles.infoItem}>
      <View style={styles.iconTextContainer}>
        {iconLibrary === "AntDesign" && (
          <AntDesign name={iconName} size={18} color="#7F8C8D" style={styles.icon} />
        )}
        {iconLibrary === "FontAwesome" && (
          <FontAwesome name={iconName} size={18} color="#7F8C8D" style={styles.icon} />
        )}
        {iconLibrary === "MaterialIcons" && (
          <MaterialIcons name={iconName} size={18} color="#7F8C8D" style={styles.icon} />
        )}
        <Text style={styles.descriptionText}>
          {text}
          {links.length > 0 ? (
            <>
              <Text style={styles.textLink} onPress={() => {router.push("/chatbot")}}>
                {links[0]}
              </Text>
              {links.length > 1 && " or our "}
              {links.length > 1 && (
                <Text style={styles.textLink} onPress={() => {}}>
                  {links[1]}
                </Text>
              )}
              {links.length > 0 && "."}
            </>
          ) : null}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Thông tin bảo mật thanh toán */}
      {/* {renderInfoItem(
        "lock",
        "AntDesign",
        "Your payment information is securely encrypted and protected."
      )} */}

      <View style={styles.divider} />

      {/* Chính sách hoàn tiền */}
      {renderInfoItem(
        "calendar",
        "AntDesign",
        "You can request a refund within 24 hours from the time of booking."
      )}

      <View style={styles.divider} />

      {/* Mã khuyến mãi */}
      {renderInfoItem(
        "tags",
        "FontAwesome",
        "Apply promotional codes at checkout to enjoy exclusive discounts."
      )}

      <View style={styles.divider} />

      {/* Liên hệ hỗ trợ */}
      {renderInfoItem(
        "support-agent",
        "MaterialIcons",
        "For any payment-related inquiries, feel free to reach out via ",
        ["Chat with Us", "Help Center"]
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {   
    backgroundColor: "#F9FAFC",
    borderRadius: 15,  
    gap: 4,
    marginTop: 10
  },
  infoItem: {

  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 10,
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 24,
    fontWeight: "400",
    textAlign: "left",
    flexShrink: 1,
  },
  textLink: {
    color: "#0071EB",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});