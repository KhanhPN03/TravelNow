import { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Pressable,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { URL_ANDROID } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../constants/Colors";

function Wishlist() {
  const [id, setId] = useState(null);
  const router = useRouter();
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [tourRatings, setTourRatings] = useState({});

  const fetchData = async (userId) => {
    try {
      if (userId) {
        setLoading(true);
        const res = await axios.get(`${URL_ANDROID}/favoriteTours/${userId}`);
        
        // Filter out any tours without prices (as extra protection)
        const toursWithPrices = res.data.favoriteTourIds.filter(tour => tour.price);
        setData(toursWithPrices);
        
        // Lấy rating cho từng tour
        const updatedRatings = { ...tourRatings };
        for (const tour of toursWithPrices) {
          if (!updatedRatings[tour._id]) {
            await fetchTourRating(tour, updatedRatings); // Truyền toàn bộ tour để lấy subsidiaryTours
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourRating = async (tour, ratingsObj) => {
    try {
      // Lấy danh sách allSubTourIds từ tour
      const subTourIds = tour.allSubTourIds || [];
  
      if (!subTourIds || subTourIds.length === 0) {
        ratingsObj[tour._id] = {
          average: 0,
          count: 0
        };
        return;
      }
  
      // Gọi API để lấy review dựa trên allSubTourIds
      const response = await axios.post(`${URL_ANDROID}/review-tour/tour-reviews-by-subtours`, {
        subTourIds
      });
      const reviews = response.data.reviews || [];
  
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((acc, review) => {
          const reviewAvg = (
            review.rating.transport +
            review.rating.services +
            review.rating.priceQuality
          ) / 3;
          return acc + reviewAvg;
        }, 0);
  
        ratingsObj[tour._id] = {
          average: totalRating / reviews.length,
          count: reviews.length
        };
      } else {
        ratingsObj[tour._id] = {
          average: 0,
          count: 0
        };
      }
    } catch (error) {
      console.error(`Error fetching reviews for tour ${tour._id}:`, error.response?.data || error.message);
      ratingsObj[tour._id] = {
        average: 0,
        count: 0
      };
    }
    
    setTourRatings({ ...ratingsObj });
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        if (result) {
          const user = JSON.parse(result);
          setId(user._id);
          await fetchData(user._id);
        }
      } catch (error) {
        console.log("error profile: ", error);
      } finally {
        setIsCheckingLogin(false);
      }
    };
    getUser();
  }, []);

  const removeTour = async (tourId) => {
    try {
      await axios.delete(`${URL_ANDROID}/favoriteTours/${id}/${tourId}`);
      await fetchData(id);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmRemoval = (tourId) =>
    Alert.alert(
      "Remove from Wishlist",
      "Are you sure you want to remove this tour from your wishlist?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeTour(tourId),
          style: "destructive",
        },
      ]
    );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(id);
    setRefreshing(false);
  }, [id]);

  const handleTourPress = (tour) => {
    if (id) {
      const tourData = {
        ...tour,
        subsidiaryTours: tour.subsidiaryTours || []
      };
      
      router.push({
        pathname: `/tourAvailability/${tour._id}`,
        params: { tour: JSON.stringify(tourData) },
      });
    } else {
      router.navigate("logintab");
    }
  };

  const formatPrice = (price) => {
    return price ? `₫${price.toLocaleString()}` : null;
  };

  const getImageSource = (item) => {
    if (item.thumbnail && typeof item.thumbnail === 'string') {
      if (item.thumbnail.startsWith('http')) {
        return { uri: item.thumbnail };
      } else {
        return { uri: `${URL_ANDROID}${item.thumbnail}` };
      }
    }
    else if (item.thumbnail?.url) {
      return { uri: item.thumbnail.url };
    }
    return require("../../assets/images/wishlist_background.png");
  };

  if (loading || isCheckingLogin) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ActivityIndicator size="large" color={Colors.orange} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Image
            source={require("../../assets/images/wishlist_background.png")}
            style={{ width: 205, height: 205 }}
            resizeMode="cover"
          />
          <Text style={styles.emptyStateText}>
            Log in to view your wishlist
          </Text>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.navigate("logintab")}
          >
            <Text style={styles.actionButtonText}>
              Log in
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>Wishlist</Text>
        <View style={styles.emptyStateContainer}>
          <Image
            source={require("../../assets/images/wishlist_background.png")}
            style={{ width: 205, height: 205 }}
            resizeMode="cover"
          />
          <Text style={styles.emptyStateText}>
            Your wishlist is empty
          </Text>
          <Link href="/" asChild>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                Find things to do
              </Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>
        Wishlist
      </Text>
      <FlatList
        data={data}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          if (!item.price) {
            return null;
          }
          
          return (
            <Link href={`/tour-detail/${item._id}`} asChild>
              <Pressable>
                <View style={styles.tourItem}>
                  <Image
                    source={getImageSource(item)}
                    style={styles.tourImage}
                    resizeMode="cover"
                  />
                  <View style={styles.tourInfoContainer}>
                    <View style={styles.tourTitleRow}>
                      <Text
                        style={styles.tourTitle}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Pressable
                        onPress={() => confirmRemoval(item._id)}
                        hitSlop={8}
                      >
                        <AntDesign name="heart" size={20} color="red" />
                      </Pressable>
                    </View>
                    
                    <View style={styles.bottomContainer}>
                      <Text style={styles.tourPrice}>
                        {formatPrice(item.price)}
                      </Text>
                      <View style={styles.tourActionRow}>
                        <Pressable
                          style={styles.checkButton}
                          onPress={() => handleTourPress(item)}
                        >
                          <Text style={styles.checkButtonText}>
                            Check availability
                          </Text>
                        </Pressable>
                        
                        <View style={styles.ratingContainer}>
                          <Ionicons
                            name="star"
                            size={13}
                            color={tourRatings[item._id]?.average > 0 ? Colors.yellow : '#D3D3D3'}
                            style={styles.starIcon}
                          />
                          <Text style={styles.ratingText}>
                            {tourRatings[item._id]?.average > 0 
                              ? `${tourRatings[item._id].average.toFixed(1)}/5 (${tourRatings[item._id].count})` 
                              : "0.0/5 (0)"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  headerText: {
    paddingHorizontal: 22,
    color: "#1A2B49",
    fontSize: 23,
    fontWeight: "700",
    fontFamily: "GT Easti Medium",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyStateText: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "GT Easti Medium",
    marginTop: 32,
    marginBottom: 14,
  },
  actionButton: {
    backgroundColor: "#0071EB",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
  },
  actionButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "GT Easti Medium",
  },
  tourItem: {
    padding: 16,
    flexDirection: "row",
    gap: 16,
  },
  tourImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  tourInfoContainer: {
    flex: 1,
    height: 120,
    justifyContent: "space-between",
  },
  tourTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A2B49",
    flex: 1,
    fontFamily: "GT Easti Medium",
  },
  bottomContainer: {
    marginTop: "auto",
  },
  tourPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.orange,
    marginBottom: 8,
    fontFamily: "GT Easti Medium",
  },
  tourActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkButton: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
  },
  checkButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "GT Easti Medium",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    marginTop: -2,
  },
  ratingText: {
    fontSize: 13,
    color: "#1A2B49",
    fontFamily: "GT Easti Medium",
    lineHeight: 13,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(133, 137, 149, 0.3)",
    marginHorizontal: 16,
  },
});

export default Wishlist;