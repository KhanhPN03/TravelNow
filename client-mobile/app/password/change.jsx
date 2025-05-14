import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Thêm ActivityIndicator
} from "react-native";
import Colors from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL_ANDROID } from "@env";
import axios from "axios";

function ChangePassword() {
  const [iconEye, setIconEye] = useState("eye-with-line");
  const [hidePassword, setHidePassword] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null); // Khởi tạo null để rõ ràng
  const [loading, setLoading] = useState(false); // Thêm state loading

  const handleBack = () => {
    router.push("/profile");
  };

  const handleIcon = () => {
    setIconEye(iconEye === "eye-with-line" ? "eye" : "eye-with-line");
    setHidePassword(!hidePassword);
  };

  const validateForm = () => {
    let newErrors = {};

    // Kiểm tra mật khẩu cũ (sửa lại điều kiện thành 6-10 để khớp thông báo)
    if (oldPassword.length < 6) {
      newErrors.oldPassword = "Old password must be from 6 characters";
    }

    // Kiểm tra mật khẩu mới
    if (newPassword.length < 6) {
      newErrors.newPassword = "New password must be from 6 characters";
    } else if (newPassword === oldPassword) {
      newErrors.newPassword = "New password must be different from old password";
    }

    // Kiểm tra xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user || !user._id) {
      alert("User not loaded or invalid. Please try again.");
      return;
    }

    if (validateForm()) {
      setLoading(true); // Bật loading
      try {
        const response = await axios.put(
          `${URL_ANDROID}/account/change-password/${user._id}`,
          {
            oldPassword,
            newPassword,
          }
        );
        if (response.data.success) {
          alert(response.data.message);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setErrors({}); // Reset lỗi
        }
      } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false); // Tắt loading dù thành công hay lỗi
      }
    } else {
      console.log("Validation failed");
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const parsedUser = result ? JSON.parse(result) : null;
        setUser(parsedUser);
      } catch (error) {
        console.log("Error loading user:", error);
        setUser(null);
      }
    };

    getUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <View style={{ paddingVertical: 20 }}>
        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Old Password:</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              onChangeText={(text) => setOldPassword(text)}
              value={oldPassword}
              placeholder="Enter Your Old Password"
              style={[styles.input, { marginBottom: 0, borderWidth: 0 }]}
              secureTextEntry={hidePassword}
            />
            <Entypo
              onPress={handleIcon}
              name={iconEye}
              size={26}
              color={Colors.grey}
              style={{ marginRight: 10 }}
            />
          </View>
          {errors.oldPassword && (
            <Text style={styles.error}>{errors.oldPassword}</Text>
          )}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>New Password:</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              onChangeText={(text) => setNewPassword(text)}
              value={newPassword}
              placeholder="Enter Your New Password"
              style={[styles.input, { marginBottom: 0, borderWidth: 0 }]}
              secureTextEntry={hidePassword}
            />
            <Entypo
              onPress={handleIcon}
              name={iconEye}
              size={26}
              color={Colors.grey}
              style={{ marginRight: 10 }}
            />
          </View>
          {errors.newPassword && (
            <Text style={styles.error}>{errors.newPassword}</Text>
          )}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>New Password Confirm:</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              onChangeText={(text) => setConfirmPassword(text)}
              value={confirmPassword}
              placeholder="Enter Your New Password Again"
              style={[styles.input, { marginBottom: 0, borderWidth: 0 }]}
              secureTextEntry={hidePassword}
            />
            <Entypo
              onPress={handleIcon}
              name={iconEye}
              size={26}
              color={Colors.grey}
              style={{ marginRight: 10 }}
            />
          </View>
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} // Thay đổi style khi loading
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={loading} // Vô hiệu hóa nút khi loading
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Loading...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  fieldStyle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 13,
    borderRadius: 10,
    marginBottom: 5,
    fontSize: 17,
    fontFamily: "GT Easti Regular",
    flex: 1,
  },
  inputLabel: {
    fontSize: 18,
    fontFamily: "GT Easti Medium",
    marginBottom: 10,
    color: Colors.grey,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: Colors.blue,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.grey, // Màu nhạt hơn khi loading
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "GT Easti Medium",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChangePassword;