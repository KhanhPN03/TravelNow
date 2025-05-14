import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator, // Thêm ActivityIndicator để hiển thị loading
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { URL_ANDROID } from "@env";
import axios from "axios";
import DiscountCard from "../../components/discount/DiscountCard";

function DiscountList() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false); // Thêm: State để quản lý trạng thái loading
  const router = useRouter();

  const handleBack = () => {
    router.push("/profile");
  };

  // Sửa đổi: Thêm hiệu ứng loading khi lấy dữ liệu từ API
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        setLoading(true); // Bật trạng thái loading
        const response = await axios.get(`${URL_ANDROID}/discount`);    
        if(response.data.success) {
          const {activeDiscounts, inactiveDiscounts} = response.data;

            // Sắp xếp Active: Giá giảm dần
          const sortedActive = activeDiscounts.sort((a, b) => b.discountPrice - a.discountPrice);

          // Sắp xếp Inactive: Ngày gần nhất trước
          const sortedInactive = inactiveDiscounts.sort((a, b) => new Date(a.discountDateEnd) - new Date(b.discountDateEnd));

          // Gộp danh sách theo thứ tự mong muốn
          setDiscounts([...sortedActive, ...sortedInactive]);

        }
      } catch (error) {
        console.error("Error fetching discounts:", error.response?.data || error);
        Alert.alert("Error", "Không thể tải danh sách mã khuyến mãi.");
      } finally {
        setLoading(false); // Tắt trạng thái loading sau khi hoàn tất
      }
    };
    fetchDiscount();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Discounts</Text>
      </View>

      {/* Sửa đổi: Hiển thị loading spinner khi đang tải dữ liệu */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F61" />        
        </View>
      ) : (
        <FlatList
          data={discounts}
          renderItem={({item}) => <DiscountCard item={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No coupons available</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Sửa đổi: Đổi màu nền container sang trắng sáng
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Trắng sáng
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    // Sửa đổi: Đổi màu viền dưới header
    borderBottomColor: "#E5E7EB", // Xám nhạt hơn
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    // Sửa đổi: Đổi màu tiêu đề header
    color: "#1F2937", // Xám đậm thanh lịch
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  listContainer: {
    paddingVertical: 20,
  },
  // Sửa đổi: Cập nhật style discountItem với viền và màu nền mới
  discountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB", // Nền xám trắng nhạt
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    // Sửa đổi: Đổi màu viền
    borderColor: "#E5E7EB", // Xám nhạt
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  // Sửa đổi: Đổi màu discountCode sang đỏ hồng
  discountCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F87171", // Đỏ hồng
    marginBottom: 4,
  },
  // Sửa đổi: Đổi màu discountValue sang xanh dương
  discountValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6", // Xanh dương tươi
    marginBottom: 4,
  },
  // Sửa đổi: Đổi màu discountMessage sang xám đậm
  discountMessage: {
    fontSize: 14,
    color: "#4B5563", // Xám đậm
    marginBottom: 4,
  },
  // Sửa đổi: Đổi màu expiryDate sang cam
  expiryDate: {
    fontSize: 14,
    color: "#FB923C", // Cam
    fontWeight: "500",
  },
  // Sửa đổi: Đổi màu copyButton sang xanh lam
  copyButton: {
    backgroundColor: "#60A5FA", // Xanh lam nhẹ
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 12,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  // Thêm: Style cho container của loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Thêm: Style cho text loading
  loadingText: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    // Sửa đổi: Đổi màu emptyText
    color: "#6B7280", // Xám trung tính
    textAlign: "center",
    marginTop: 50,
  },
});

export default DiscountList;