import { Link, useRouter } from "expo-router";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { URL_ANDROID } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Feather } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { Context } from "../../context/ContextProvider";
import * as ImagePicker from 'expo-image-picker';

const ProfileDetailScreen = () => {
  const [id, setId] = useState(null);
  const { setUserAsyncStorage } = useContext(Context);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const router = useRouter();
  const usernameRef = useRef(null); // Tạo ref cho TextInput

  // Fetch user data
  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);    
        if (user) {
          if(user.DOB) {
            user.DOB = user.DOB.split("T")[0];
          }
          setUserData(user);
          setId(user._id);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.log("error ids profile: ", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [id]);

  const handleChange = (name, value) => {
    const removeSpace = (text) => text?.replace(/\s+/g, "");

    if (name === "username") {
      value = removeSpace(value);
    }
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let formErrors = {};
    const nameRegex = /^[a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝĂẮẰẲẴẶÂẦẤẨẪẬĐÊỀẾỂỄỆÌÍỈỊÒÓÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨƯỪỨỬỮỰỲÝỶỸỴàáâãäåæçèéêëìíîïðñòóôõöùúûüýăắằẳẵặâầấẩẫậđêềếểễệìíỉịòóôốồổỗộơớờởỡợùúủũưừứửữựỳýỷỹỵ\s]*$/;
    const phoneRegex = /^0\d{9}$/;
    const DOBRegex = /^(?!0000)([1-9][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    userData.firstname = userData.firstname.trim().replace(/\s+/g, " ");
    userData.lastname = userData.lastname.trim().replace(/\s+/g, " "); 
    userData.phone = userData.phone?.trim() || ""; 
    userData.DOB = userData.DOB?.trim() || ""; 
    
    if (!userData.username) {
      formErrors.username = "Username is required";
    } else if (userData.username.length < 3 || userData.username.length > 20) {
      formErrors.username = "Username must be between 3 and 20 characters";
    }

    if (!userData.firstname || !nameRegex.test(userData.firstname)) {
      formErrors.firstname = "First name must contain only letters";
    } else if (userData.firstname.length < 3 || userData.firstname.length > 20) {
      formErrors.firstname = "First name must be between 3 and 20 characters";
    }

    if (!userData.lastname || !nameRegex.test(userData.lastname)) {
      formErrors.lastname = "Last name must contain only letters";
    } else if (userData.lastname.length < 3 || userData.lastname.length > 20) {
      formErrors.lastname = "Last name must be between 3 and 20 characters";
    }
    if(userData.phone) {
      if (!phoneRegex.test(userData.phone)) {
        formErrors.phone = "Phone number must be 10 digits and start must be 0";
      }
    }
    if (userData.DOB) {
      if (!DOBRegex.test(userData.DOB)) {
        formErrors.DOB = "Wrong date format, must be YYYY-MM-DD.";
      } else {
        const today = new Date();
        const dobDate = new Date(userData.DOB);
        if (dobDate > today) {
          formErrors.dob = "Date of birth cannot be a future date.";
        }
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0; // Return true if there are no errors
  };

  const saveUserData = async () => {   
    if (validateForm()) {
      try {
        await axios.put(`${URL_ANDROID}/account/${id}`, {
          ...userData,
        });
        setUserAsyncStorage(userData);
        Alert.alert("Success", "Profile updated successfully!");
      } catch (error) {
        console.error(error);        
        Alert.alert("Error", "Failed to update profile");
      }
    }
  };

  const handlePickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });    
  
    if (!result.canceled) {
      handleChange("avatar", result.assets[0].uri);
    }
  };

  const handleEditUsername = () => {
    setIsEditingUsername(true);
    setTimeout(() => usernameRef.current?.focus(), 100);
  };

  if (loading) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate("/profile")}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handlePickImage}>
          <Image
            source={{
              uri: userData.avatar || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={{
          flexDirection: "row", 
          alignItems: "center",
          justifyContent: "center",
          columnGap: 4
          }}>
          <TextInput ref={usernameRef} style={styles.username}
            value={userData.username}
            editable={isEditingUsername}
            onChangeText={(text) =>
              handleChange("username", text)      
            }
          />
          <Pressable
            onPress={handleEditUsername}
          >
            <AntDesign name="edit" size={18} color="black" />
          </Pressable>               
        </View>
      </View>

      {/* First Name */}
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={userData.firstname}
        onChangeText={(text) =>
          handleChange("firstname", text)   
        }
        placeholder="First Name"
      />
      {errors.firstname && <Text style={styles.error}>{errors.firstname}</Text>}

      {/* Last Name */}
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={userData.lastname}
        onChangeText={(text) =>
          handleChange("lastname", text)   
        }
        placeholder="Last Name"
      />
      {errors.lastname && <Text style={styles.error}>{errors.lastname}</Text>}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={userData.email}
        placeholder="Email"
        editable={false}
        selectTextOnFocus={false}
      />

      {/* Mobile phone number */}
      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={styles.input}
        value={userData.phone}
        onChangeText={(text) =>
          handleChange("phone", text)   
        }
        placeholder="Not added yet"
      />
      {errors.phone && (
        <Text style={styles.error}>{errors.phone}</Text>
      )}

      {/* Date of birth */}
      <Text style={styles.label}>Date of birth (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={userData.DOB}
        onChangeText={(text) =>
          handleChange("DOB", text)   
        }
        placeholder="YYYY-MM-DD"
      />
      {errors.DOB && <Text style={styles.error}>{errors.DOB}</Text>}

      {/* Save Button */}
      <Pressable style={styles.saveButton} onPress={saveUserData}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  title: {
    fontSize: 20,
    color: "#000",
    fontFamily: "Roboto Regular",
    fontWeight: "700",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
  },
  editUsername: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 5,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",    
    color: Colors.blackColorText,
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 12,
  },
});

export default ProfileDetailScreen;
