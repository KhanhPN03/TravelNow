import React, { useState, useEffect } from 'react';
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "../../constants/Colors";
import axios from "axios";
import { URL_ANDROID } from "@env";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

function OutstandingCard({ item }) {
  const [fav, setFav] = useState(false);
  const [id, setId] = useState("");
  const router = useRouter();

  // Use the pre-calculated average rating from the parent component if available
  const averageRating = item.averageRating || 0;
  const reviewCount = item.reviewCount || 0;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          style={[
            Styles.star,
            { color: i < Math.round(averageRating) ? Colors.yellow : '#D3D3D3' }
          ]}
          name="star"
          size={13}
        />
      );
    }
    return stars;
  };

  const fetchWishlist = async (userId) => {
    try {
      if (userId) {
        const res = await axios.get(`${URL_ANDROID}/favoriteTours/${userId}`);
        if (res.data && res.data.favoriteTourIds) {
          const isFavorite = res.data.favoriteTourIds.some(
            (tour) => tour._id === item._id
          );
          setFav(isFavorite);
        }
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const toggleToWishlist = async () => {
    try {
      if (!id) {
        router.navigate("/logintab");
        return;
      }

      if (fav) {
        await axios.delete(`${URL_ANDROID}/favoriteTours/${id}/${item._id}`);
      } else {
        await axios.put(`${URL_ANDROID}/favoriteTours/${id}/${item._id}`);
      }
      setFav(!fav);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        if (result) {
          const user = JSON.parse(result);
          setId(user._id);
          await fetchWishlist(user._id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    
    getUser();
  }, []);

  // Construct full image URL by combining base URL with the thumbnail path
  const getThumbnailUrl = () => {
    if (!item.thumbnail) return null;
    // Remove the leading slash if it exists in item.thumbnail
    const thumbnailPath = item.thumbnail.startsWith('/') 
      ? item.thumbnail.substring(1) 
      : item.thumbnail;
    return `${URL_ANDROID}/${thumbnailPath}`;
  };

  return (
    <View style={{ paddingBottom: 30 }}>
      <View style={{
        backgroundColor: Colors.white,
        width: 161,
        gap: 8,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: "#cccccc",
        marginRight: 14,
        flexDirection: "column",
        paddingHorizontal: 10,
      }}>
        <View style={{
          width: "100%",
          height: 111,
          overflow: "hidden",
          borderRadius: 20,
          position: "relative",
        }}>
          <Image
            style={{ width: "100%", height: 111 }}
            resizeMode="cover"
            source={{ uri: getThumbnailUrl() }}
          />
          {/* Top-rated badge */}
          <View style={{
            position: "absolute",
            left: 0,
            top: 0,
            backgroundColor: Colors.orange,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderBottomRightRadius: 10,
          }}>
            <Text style={{
              color: Colors.white,
              fontSize: 10,
              fontFamily: "GT Easti Medium",
            }}>TOP RATED</Text>
          </View>
          <Pressable
            style={{ position: "absolute", right: 13, top: 5 }}
            onPress={toggleToWishlist}
          >
            {id ? (
              fav ? (
                <AntDesign name="heart" size={23} color="red" />
              ) : (
                <AntDesign name="heart" size={23} color={Colors.blackColorText} />
              )
            ) : (
              <Pressable onPress={() => router.navigate("/logintab")}>
                <AntDesign name="heart" size={23} color={Colors.blackColorText} />
              </Pressable>
            )}
          </Pressable>
        </View>
        <View style={{ paddingLeft: 7 }}>
          <Text style={Styles.multiText}>multi-day trip</Text>
          <Text style={Styles.titleText} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            gap: 4
          }}>
            <View style={{ flexDirection: "row" }}>
              {renderStars()}
            </View>
            <Text style={{
              fontSize: 13,
              color: Colors.blackColorText,
              fontFamily: "GT Easti Medium",
              lineHeight: 13,
              marginLeft: 4
            }}>
              {averageRating.toFixed(1)}/5 ({reviewCount})
            </Text>
          </View>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "start",
          }}>
            <View style={{ flexDirection: "column", gap: 4, alignItems: "start" }}>
              <Text style={{
                fontSize: 14,
                color: Colors.orange,
                fontFamily: "GT Easti Medium",
              }}>
                From ₫{item.price?.toLocaleString()}
              </Text>
              <Text style={{
                opacity: 0.7,
                fontSize: 14,
                color: Colors.blackColorText,
                fontFamily: "GT Easti Medium",
              }}>
                per person        <Text style={Styles.duration}>{item.duration} days</Text>
              </Text>
            </View>
            {/* <Text style={Styles.duration}>{item.duration} days</Text> */}
          </View>
        </View>
      </View>
    </View>
  );
}

export default OutstandingCard;

const Styles = StyleSheet.create({
  multiText: {
    color: Colors.blackColorText,
    fontFamily: "GT Easti Medium",
    fontSize: 11,
    textTransform: "uppercase",
    opacity: 0.5,
  },
  titleText: {
    color: Colors.blackColorText,
    fontSize: 15,
    fontFamily: "GT Easti Medium",
    textTransform: "capitalize",
    marginTop: 8,
  },
  duration: {
    color: Colors.blackColorText,
    fontFamily: "GT Easti Medium",
    fontSize: 11,
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: 7,
  },
  star: {
    marginBottom: 4,
  },
});