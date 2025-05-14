import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useContext, useState } from "react";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { URL_ANDROID } from "@env";
import axios from "axios";
import { Context } from "../../context/ContextProvider";
import * as ImagePicker from 'expo-image-picker';

function AvatarSelection({userId}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const { alert } = useContext(Context);

  const handlePickImage = async () => {
    console.log("zo");
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    console.log(result);
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpdateAvatar = async () => {
    try {   
      await axios.put(`${URL_ANDROID}/account/${userId}`, {
        avatar: selectedImage,
      });
      alert("Notification", "Avatar updated successfully", () => {
        router.push("/logintab");
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Avatar</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View style={{ alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons
              name="image-plus"
              size={42}
              color={Colors.grey}
            />
            <Text
              style={{
                fontFamily: "GT Easti Medium",
                fontSize: 16,
                color: Colors.grey,
              }}
            >
              Choose Image
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: selectedImage ? Colors.blue : Colors.grey },
          ]}
          onPress={handleUpdateAvatar}
          disabled={!selectedImage}
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: "absolute",
          width: "100%",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          bottom: 32,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.push("/logintab");
          }}
        >
          <Text style={styles.skipBtn}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  skipBtn: {
    color: Colors.blue,
    fontSize: 18,
    fontFamily: "Roboto Regular",
  },
  imagePicker: {
    width: 150,
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AvatarSelection;
