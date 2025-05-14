import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  SectionList,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
  Linking,
} from "react-native";
import axios from "axios";
import { URL_ANDROID } from "@env";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";

import Slider from "../../components/tourDetail/Slider";
import ActivityExperience from "../../components/tourDetail/ActivityExperience";
import ActivityExperienceHeader from "../../components/tourDetail/ActivityExperienceHeader";
import Stars from "../../components/review/Stars";
import ReviewsSummary from "../../components/review/ReviewsSummary";
import TourDetailFooter from "../../components/tourDetail/TourDetailFooter";
import Review from "../../components/review/Review";
import Colors from "../../constants/Colors";

// Tách Wishlist Button thành component riêng
const WishlistButton = ({ tourId }) => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch user from AsyncStorage
  useEffect(() => {
    const getUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user._id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUser();
  }, []);

  // Check if tour is in wishlist
  const checkWishlistStatus = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`${URL_ANDROID}/favoriteTours/${userId}`);
      if (res.data && res.data.favoriteTourIds) {
        const favorite = res.data.favoriteTourIds.some(
          (tour) => tour._id === tourId
        );
        setIsFavorite(favorite);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  }, [tourId]);

  // Toggle wishlist status
  const toggleWishlist = async () => {
    if (!userId) {
      router.navigate("/logintab");
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${URL_ANDROID}/favoriteTours/${userId}/${tourId}`);
      } else {
        await axios.put(`${URL_ANDROID}/favoriteTours/${userId}/${tourId}`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  // Check wishlist status when userId changes
  useEffect(() => {
    if (userId) {
      checkWishlistStatus(userId);
    }
  }, [userId, checkWishlistStatus]);

  return (
    <Pressable
      style={styles.heartIconContainer}
      onPress={toggleWishlist}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <AntDesign 
        name="heart" 
        size={24} 
        color={isFavorite ? "red" : "white"} 
      />
    </Pressable>
  );
};

const sectionsToDisplay = [
  {
    title: "Itinerary",
    data: [{ name: "See itinerary" }],
  },
  {
    title: "Details",
    data: [
      { name: "Full description" },
    ],
  },
];

const activityKey = [
  {
    name: "Free cancellation",
    description: "Cancel up to 24 hours in advance for a full refund",
    icon: require("../../assets/images/freeCancellation.png"),
  },
  {
    name: "Book now, pay later",
    description:
      "Stay flexible with your travel plans: reserve your place without paying anything today",
    icon: require("../../assets/images/wallet.png"),
  },
  {
    name: ({ duration }) => `Duration ${duration} ${duration === 1 ? 'day' : 'days'}`,
    description: "Check availability to see start times",
    icon: require("../../assets/images/clock.png"),
  },
  {
    name: "Guide",
    description: "English",
    icon: require("../../assets/images/bag.png"),
  },
];

function TourDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [originalTour, setOriginalTour] = useState({});
  const [subsidiaryTours, setSubsidiaryTours] = useState([]);
  const [cheapestSubTour, setCheapestSubTour] = useState();
  const [minPrice, setMinPrice] = useState(0);
  const [reviewStats, setReviewStats] = useState({
    transport: 0,
    services: 0,
    priceQuality: 0,
    count: 0
  });
  
  // Add a new state for processed image paths
  const [processedImages, setProcessedImages] = useState([]);

  

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [originalTourRes, subsidiaryToursRes] = await Promise.all([
        axios.get(`${URL_ANDROID}/originalTours/${id}`),
        axios.get(`${URL_ANDROID}/subsidiaryTours`),
      ]);
  
      setOriginalTour(originalTourRes.data);
  
      // Process the image paths from originalTour data
      if (originalTourRes.data.images && originalTourRes.data.images.length > 0) {
        const imageUrls = originalTourRes.data.images.map(
          imagePath => `${URL_ANDROID}${imagePath}`
        );
        setProcessedImages(imageUrls);
      } else if (originalTourRes.data.image && originalTourRes.data.image.length > 0) {
        const imageUrls = originalTourRes.data.image.map(
          imagePath => typeof imagePath === 'string' && !imagePath.startsWith('http') 
            ? `${URL_ANDROID}${imagePath}` 
            : imagePath
        );
        setProcessedImages(imageUrls);
      }
  
      const relatedSubsidiaryTours = subsidiaryToursRes.data?.subsidiaryTours?.filter(
        (subTour) => subTour.originalTourId._id.toString() === id
      ) || [];
      setSubsidiaryTours(relatedSubsidiaryTours);
  
      if (relatedSubsidiaryTours.length > 0) {
        const { minPrice, cheapestSubTour } = relatedSubsidiaryTours.reduce(
          (acc, subTour) => {      
            if (subTour.price < acc.minPrice) {
              acc.minPrice = subTour.price;
              acc.cheapestSubTour = subTour;
            }
            return acc;
          }, { minPrice: Infinity, cheapestSubTour: null }
        );
        setCheapestSubTour(cheapestSubTour);
        setMinPrice(minPrice);
  
        // Lấy tất cả subTourId từ relatedSubsidiaryTours
        const subTourIds = relatedSubsidiaryTours.map(subTour => subTour._id);
  
        // Gọi API để lấy review dựa trên subTourIds
        const reviewsRes = await axios.post(`${URL_ANDROID}/review-tour/tour-reviews-by-subtours`, {
          subTourIds
        });
  
        const reviews = reviewsRes.data?.reviews || [];
        if (reviews.length > 0) {
          // Sort reviews by date descending (newest first)
          const sortedReviews = [...reviews].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          setOriginalTour(prev => ({
            ...prev,
            reviews: sortedReviews
          }));
  
          const totals = reviews.reduce((acc, review) => ({
            transport: acc.transport + review.rating.transport,
            services: acc.services + review.rating.services,
            priceQuality: acc.priceQuality + review.rating.priceQuality,
            count: acc.count + 1
          }), { transport: 0, services: 0, priceQuality: 0, count: 0 });
  
          setReviewStats({
            transport: (totals.transport / totals.count).toFixed(1),
            services: (totals.services / totals.count).toFixed(1),
            priceQuality: (totals.priceQuality / totals.count).toFixed(1),
            count: totals.count
          });
        }
      }
    } catch (error) {
      console.error("Error fetching tour data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const averageRating = useMemo(() => (
    (parseFloat(reviewStats.transport) + 
    parseFloat(reviewStats.services) + 
    parseFloat(reviewStats.priceQuality)) / 3
  ).toFixed(1), [reviewStats]);

  const reviewCategories = useMemo(() => [
    {
      name: "Transport",
      avg: reviewStats.transport
    },
    {
      name: "Service",
      avg: reviewStats.services
    },
    {
      name: "Price quality",
      avg: reviewStats.priceQuality
    },
  ], [reviewStats]);

  // Get the latest 3 reviews
  const latestReviews = useMemo(() => {
    return originalTour.reviews ? originalTour.reviews.slice(0, 3) : [];
  }, [originalTour.reviews]);

  const renderSectionItem = ({ item, section }) => {
    if (section.title === "Itinerary") {
      // Create a combined tour object with all necessary data
      const tourData = {
        ...originalTour,
        subsidiaryTours: subsidiaryTours,
        cheapestSubTour: cheapestSubTour,
        minPrice: minPrice,
        reviewStats: reviewStats
      };
  
      return (
        <ActivityExperience
          name={item.name}
          url={`/tourItinerary/${originalTour._id}`}
          params={JSON.stringify(tourData)}
        />
      );
    }
  
    return (
      <ActivityExperience
        name={item.name}
        url={`/tourDetailMore/${originalTour._id}`}
        params={JSON.stringify(originalTour)}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.orange} />
      </View>
    );
  }
 
  return (
    <>
      <View style={{ paddingTop: 23 }}>
        <SectionList
          sections={sectionsToDisplay}
          renderItem={renderSectionItem}
          renderSectionHeader={({ section: { title } }) => (
            <ActivityExperienceHeader name={title} />
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{
                borderTopWidth: 1,
                borderColor: "rgba(133, 137, 149, 0.3)",
              }}
            />
          )}
          ListHeaderComponent={() => (
            <>
              <View style={styles.sliderContainer}>
                <Slider
                  imgs={processedImages}
                  tourId={originalTour._id}
                />
                {/* Sử dụng WishlistButton component tách riêng */}
                <WishlistButton tourId={id} />
              </View>
              <View style={styles.container}>
                <View style={styles.titleContainer}>
                  <Text style={styles.tourCategory}>GUIDE TOUR</Text>
                  <Text style={styles.tourName}>{originalTour.title}</Text>
                </View>
                <View>
                  <Stars 
                    rating={parseFloat(averageRating)} 
                    starSize={24}
                  />
                  <Text style={styles.reviewsCount}>{reviewStats.count} reviews</Text>
                </View>

                <FlatList
                  data={activityKey}
                  renderItem={({ item }) => (
                    <View style={styles.activityKey}>
                      <View style={styles.activityKeyImgContainer}>
                        <Image
                          source={item.icon}
                          style={{ resizeMode: "contain" }}
                        />
                      </View>
                      <View>
                        <Text style={styles.activityKeyTitle}>
                          {typeof item.name === 'function' 
                            ? item.name({ duration: originalTour.duration })
                            : item.name}
                        </Text>
                        <Text style={styles.activityKeyDesciption}>
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  )}
                  ListHeaderComponent={() => (
                    <Text style={styles.activityTitle}>
                      About this activity
                    </Text>
                  )}
                />
              </View>
            </>
          )}
          ListFooterComponent={() => (
            <View style={{ paddingBottom: 100 }}>
              <FlatList
                data={latestReviews}
                renderItem={({ item }) => (
                  <Review 
                    review={item}
                    userName={item.userInfo?.name}
                    userAvatar={item.userInfo?.avatar}
                  />
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderColor: "rgba(133, 137, 149, 0.3)",
                    }}
                  />
                )}
                ListHeaderComponent={
                  <ReviewsSummary
                    reviewsCount={reviewStats.count}
                    reviewsCategories={reviewCategories}
                  />
                }
                ListFooterComponent={
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: "rgba(133, 137, 149, 0.3)",
                    }}
                  >
                    <ActivityExperience
                      name={"See all reviews"}
                      url={`/tourReviews/${originalTour._id}`}
                      params={JSON.stringify({reviews: originalTour.reviews})}
                    />
                  </View>
                }
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <TourDetailFooter tour={{ ...originalTour, averageRating, originalTourId: originalTour._id, price: minPrice, cheapestSubTour, subsidiaryTours, totalReviews: originalTour.reviews?.length || 0}} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 22,
  },
  titleContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  tourCategory: {
    color: "#63687A",
    fontSize: 12,
    fontWeight: "600",
  },
  tourName: {
    color: "#1A2B49",
    fontSize: 18,
    fontWeight: "700",
  },
  reviewsCount: {
    color: "#0046C2",
    marginBottom: 20,
  },
  descriptionContainer: {
    marginTop: 20,
    marginBottom: 22,
  },
  activityKey: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  activityKeyImgContainer: {
    marginTop: 4,
  },
  activityKeyTitle: {
    color: "#1A2B49",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 0,
  },
  activityKeyDesciption: {
    color: "#63687A",
    fontSize: 14,
    fontWeight: "500",
  },
  activityTitle: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 21,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Styles for heart icon
  sliderContainer: {
    position: 'relative',
  },
  heartIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 100,
  },
});

export default TourDetail;