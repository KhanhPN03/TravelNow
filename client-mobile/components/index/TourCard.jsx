import React, { useState, useEffect } from 'react';
import { AntDesign, Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import Colors from "../../constants/Colors";
import { URL_ANDROID } from "@env";
import { Context } from "../../context/ContextProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

function TourCard({ item }) {
  const [userId, setUserId] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [fav, setFav] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Combined fetch function to handle all data loading
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get user ID first
      const userString = await AsyncStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      const currentUserId = user ? user._id : "";
      setUserId(currentUserId);

      // Fetch subsidiary tours related to originalTourId
      const subsidiaryToursRes = await axios.get(`${URL_ANDROID}/subsidiaryTours`);
      const relatedSubsidiaryTours = subsidiaryToursRes.data?.subsidiaryTours?.filter(
        (subTour) => subTour.originalTourId._id.toString() === item._id
      ) || [];

      // Fetch wishlist status in parallel if userId exists
      const wishlistPromise = currentUserId 
        ? axios.get(`${URL_ANDROID}/favoriteTours/${currentUserId}`) 
        : Promise.resolve(null);

      let reviews = [];
      if (relatedSubsidiaryTours.length > 0) {
        // Get subTourIds
        const subTourIds = relatedSubsidiaryTours.map(subTour => subTour._id);

        // Fetch reviews based on subTourIds
        const reviewsResponse = await axios.post(`${URL_ANDROID}/review-tour/tour-reviews-by-subtours`, {
          subTourIds
        });
        reviews = reviewsResponse.data.reviews || [];
      }

      // Fetch wishlist response
      const wishlistResponse = await wishlistPromise;

      // Process reviews
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((acc, review) => {
          const reviewAvg = (
            review.rating.transport +
            review.rating.services +
            review.rating.priceQuality
          ) / 3;
          return acc + reviewAvg;
        }, 0);
        setAverageRating(totalRating / reviews.length);
        setReviewCount(reviews.length);
      } else {
        setAverageRating(0);
        setReviewCount(0);
      }

      // Process wishlist
      if (wishlistResponse && wishlistResponse.data && wishlistResponse.data.favoriteTourIds) {
        const isFavorite = wishlistResponse.data.favoriteTourIds.some(
          (tour) => tour._id === item._id
        );
        setFav(isFavorite);
      }
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [item._id]);

  const toggleToWishlist = async () => {
    try {
      if (!userId) {
        router.navigate("/logintab");
        return;
      }

      setFav(!fav); // Optimistic update for immediate feedback

      if (fav) {
        await axios.delete(`${URL_ANDROID}/favoriteTours/${userId}/${item._id}`);
      } else {
        await axios.put(`${URL_ANDROID}/favoriteTours/${userId}/${item._id}`);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      setFav(!fav); // Revert on error
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          style={[
            Styles.star,
            { color: i < averageRating ? Colors.yellow : '#D3D3D3' }
          ]}
          name="star"
          size={13}
        />
      );
    }
    return stars;
  };

  // Get the image source from local or URL
  const getImageSource = (imagePath) => {
    // Check if imagePath is a local path (starts with '/uploads/')
    if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
      return { uri: `${URL_ANDROID}${imagePath}` };
    } else {
      return { uri: imagePath };
    }
  };

  // Render skeleton loading state
  if (isLoading) {
    return (
      <View style={Styles.cardContainer}>
        <View style={[Styles.imageContainer, { backgroundColor: '#E1E9EE' }]}>
          {/* Skeleton for image */}
        </View>
        <View style={Styles.contentContainer}>
          <View style={[Styles.skeletonText, { width: '40%', height: 10 }]} />
          <View style={[Styles.skeletonText, { width: '80%', height: 15, marginVertical: 8 }]} />
          <View style={[Styles.skeletonText, { width: '30%', height: 10 }]} />
          <View style={[Styles.skeletonText, { width: '40%', height: 13, marginVertical: 7 }]} />
          <View style={[Styles.skeletonText, { width: '60%', height: 14, marginTop: 20 }]} />
        </View>
      </View>
    );
  }

  return (
    <Link href={`/tour-detail/${item._id}`} asChild>
      <TouchableOpacity>
        <View style={Styles.cardContainer}>
          <View style={Styles.imageContainer}>
            <Image
              style={Styles.thumbnail}
              resizeMode="cover"
              source={getImageSource(item.thumbnail)}
            />

            <Pressable
              style={Styles.heartContainer}
              onPress={toggleToWishlist}
            >
              {userId ? (
                <AntDesign
                  name="heart"
                  size={23}
                  color={fav ? "red" : Colors.blackColorText}
                />
              ) : (
                <Pressable onPress={() => router.navigate("/logintab")}>
                  <AntDesign name="heart" size={23} color={Colors.blackColorText} />
                </Pressable>
              )}
            </Pressable>
          </View>
          <View style={Styles.contentContainer}>
            <Text style={Styles.multiText}>multi-day trip</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.titleText}>
              {item.title}
            </Text>
            <Text style={Styles.duration}>
              {item.duration} {item.duration === 1 ? "day" : "days"}
            </Text>
            <View style={Styles.ratingContainer}>
              <Ionicons
                name="star"
                size={13}
                color={averageRating > 0 ? Colors.yellow : '#D3D3D3'}
                style={{ marginTop: -3 }}
              />
              <Text style={Styles.ratingText}>
                {averageRating.toFixed(1)}/5 ({reviewCount})
              </Text>
            </View>
            <View style={Styles.priceContainer}>
              <Text style={Styles.priceText}>
                From ₫{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </Text>
              <Text style={Styles.perPersonText}>
                per person
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default TourCard;

const Styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    gap: 25,
    paddingVertical: 10,
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: "#cccccc",
    paddingHorizontal: 22,
  },
  imageContainer: {
    width: 141,
    height: 126,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: 141,
    height: 126
  },
  heartContainer: {
    position: "absolute",
    right: 13,
    top: 5,
    width: 23,
    height: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
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
    marginVertical: 8,
    width: 210,
  },
  duration: {
    color: Colors.blackColorText,
    fontFamily: "GT Easti Medium",
    fontSize: 11,
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: 7,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 4
  },
  ratingText: {
    fontSize: 13,
    color: Colors.blackColorText,
    fontFamily: "GT Easti Medium",
    lineHeight: 13
  },
  priceContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center"
  },
  priceText: {
    fontSize: 14,
    color: Colors.orange,
    fontFamily: "GT Easti Medium",
  },
  perPersonText: {
    fontSize: 14,
    color: Colors.blackColorText,
    fontFamily: "GT Easti Medium",
    opacity: 0.5,
  },
  star: {
    marginBottom: 20,
  },
  skeletonText: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  }
});