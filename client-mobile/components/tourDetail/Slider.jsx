import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router/stack";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { URL_ANDROID } from "@env";

import axios from "axios";

import { SliderBox } from "react-native-image-slider-box";

import { AntDesign } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { IconButton } from "react-native-paper";

const { width } = Dimensions.get("window");
const height = 300;

function Slider({ imgs, tourId }) {
  const [id, setId] = React.useState("");
  const router = useRouter();
  const [fav, setFav] = React.useState(false);
  const [wishlist, setWishlist] = React.useState([]);
  
  // This function ensures all image paths are properly formatted
  const processImages = (images) => {
    if (!images || images.length === 0) {
      return [];
    }
    
    // Make sure all images have proper URLs
    return images.map(imgPath => {
      // If already a full URL, return as is
      if (typeof imgPath === 'string' && (imgPath.startsWith('http') || imgPath.startsWith('file'))) {
        return imgPath;
      }
      
      // Otherwise, prepend the base URL
      return `${URL_ANDROID}${imgPath}`;
    });
  };

  const fetchWishlist = async (newId) => {
    try {
      if (newId) {
        const res = await axios.get(`${URL_ANDROID}/favoriteTours/${newId}`);
        setWishlist(res.data.favoriteTourIds);
        // Chỉ cần có ít nhất 1 phần tử thỏa mãn điều kiện sẽ dừng chạy và return true
        const isFavorite = res.data.favoriteTourIds.some(
          (tour) => tour._id === tourId
        );

        setFav(isFavorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        if(result) {
          const user = JSON.parse(result);
          fetchWishlist(user._id);          
          setId(user._id);
        }
      } catch (error) {
        console.log("tour card error: ",error);
      }
    }
    getUser();
  }, [id]);

  const toggleToWishlist = async () => {
    try {
      if (id) {
        if (fav) {
          await axios.delete(`${URL_ANDROID}/favoriteTours/${id}/${tourId}`);
        } else {
          await axios.put(`${URL_ANDROID}/favoriteTours/${id}/${tourId}`);
        }
        setFav(!fav);
      } else {
        router.navigate("/logintab");
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  // Process the incoming image paths
  const processedImages = processImages(imgs);

  return (
    <>
      <View style={{ position: "relative" }}>
        <Pressable
          style={{
            position: "absolute",
            left: 22,
            top: 22,
            zIndex: 100,
            backgroundColor: "white",
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            router.navigate("/");
          }}
        >
          <Ionicons name="chevron-back-outline" size={20} color="black" />
        </Pressable>

        <Pressable
          style={{
            position: "absolute",
            right: 22,
            top: 22,
            zIndex: 100,
            backgroundColor: "white",
            width: 28,
            height: 28,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={toggleToWishlist}
        >
          {id ? (
            fav ? (
              <AntDesign name="heart" size={20} color="red" />
            ) : (
              <AntDesign name="hearto" size={20} color="black" />
            )
          ) : (
            <AntDesign name="hearto" size={20} color="black" />
          )}
        </Pressable>

        <SliderBox 
          sliderBoxHeight={height} 
          images={processedImages}
          // Add fallback options if images fail to load
          ImageComponentStyle={{ width: '100%', height: height }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 0,
            padding: 0,
            margin: 0,
            backgroundColor: "rgba(128, 128, 128, 0.92)"
          }}
          // Handle image loading errors
          onCurrentImagePressed={index => console.log(`Image ${index} pressed`)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  img: {
    width: width,
    height: height,
  },
});

export default Slider;