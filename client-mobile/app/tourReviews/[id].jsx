import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Review from "../../components/review/Review";
import TourDetailFooter from "../../components/tourDetail/TourDetailFooter";
import ModalSortReview from "../../components/tourDetail/ModalSortReview";
import ModalFilterReview from "../../components/tourDetail/ModalFilterReview";
import { useState, useEffect } from "react";
import axios from "axios";
import { URL_ANDROID } from "@env";

const sortBy = {
  title: "Sort",
  data: ["Best rated", "Worst rated", "Newest"],
};

function TourReviews() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tour, setTour] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSort, setCurrentSort] = useState("Newest");

  const handleSort = (type) => {
    setCurrentSort(type);
    let sortedReviews = [...filteredReviews];

    switch (type.toLowerCase()) {
      case "best rated":
        sortedReviews.sort((a, b) => {
          const avgA = (a.rating.transport + a.rating.services + a.rating.priceQuality) / 3;
          const avgB = (b.rating.transport + b.rating.services + b.rating.priceQuality) / 3;
          return avgB - avgA;
        });
        break;
      case "worst rated":
        sortedReviews.sort((a, b) => {
          const avgA = (a.rating.transport + a.rating.services + a.rating.priceQuality) / 3;
          const avgB = (b.rating.transport + b.rating.services + b.rating.priceQuality) / 3;
          return avgA - avgB;
        });
        break;
      case "newest":
        sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        sortedReviews = [...reviews];
        break;
    }

    setFilteredReviews(sortedReviews);
    setModalVisible(false);
  };

  const handleFilter = (filters) => {
    let filteredReviews = [...reviews];

    if (filters.ratings && filters.ratings.length > 0) {
      filteredReviews = filteredReviews.filter((review) => {
        const avgRating = Math.round(
          (review.rating.transport + review.rating.services + review.rating.priceQuality) / 3
        );
        return filters.ratings.includes(avgRating);
      });
    }

    setFilteredReviews(filteredReviews);
    setFilterModalVisible(false);
  };

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          setError("Invalid tour ID format");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${URL_ANDROID}/originalTours/${id}`);
        setTour(response.data);
      } catch (error) {
        console.error("Error fetching tour data:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch tour details.");
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          setError("Invalid tour ID format");
          setLoading(false);
          return;
        }

        // Lấy danh sách subsidiary tours liên quan đến originalTourId
        const subsidiaryToursRes = await axios.get(`${URL_ANDROID}/subsidiaryTours`);
        const relatedSubsidiaryTours = subsidiaryToursRes.data?.subsidiaryTours?.filter(
          (subTour) => subTour.originalTourId._id.toString() === id
        ) || [];

        if (relatedSubsidiaryTours.length === 0) {
          setReviews([]);
          setFilteredReviews([]);
          setLoading(false);
          return;
        }

        // Lấy danh sách subTourIds
        const subTourIds = relatedSubsidiaryTours.map((subTour) => subTour._id);

        // Gọi API để lấy review dựa trên subTourIds
        const reviewsRes = await axios.post(`${URL_ANDROID}/review-tour/tour-reviews-by-subtours`, {
          subTourIds,
        });

        if (reviewsRes.data.success && reviewsRes.data.reviews) {
          const sortedReviews = [...reviewsRes.data.reviews].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setReviews(sortedReviews);
          setFilteredReviews(sortedReviews);
        } else {
          setReviews([]);
          setFilteredReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error.response || error);
        setError(error.response?.data?.message || "Failed to load reviews");
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
    fetchReviews();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0071EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={20} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={styles.btn}
          onPress={() => {
            setModalType("sort");
            setModalVisible(true);
          }}
        >
          <Text style={styles.btnText}>Sort</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.btnText}>Filter</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews available for this tour.</Text>
        ) : filteredReviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews match your filter criteria.</Text>
        ) : (
          <FlatList
            data={filteredReviews}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <Review
                review={item}
                userName={item.userInfo?.name}
                userAvatar={item.userInfo?.avatar}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {modalType === "sort" && (
        <ModalSortReview
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          nameType={sortBy}
          handleSort={handleSort}
          currentSelection={currentSort}
        />
      )}

      <ModalFilterReview
        isModalVisible={isFilterModalVisible}
        setModalVisible={setFilterModalVisible}
        onApplyFilter={handleFilter}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    paddingTop: 22,
    paddingBottom: 12,
    paddingHorizontal: 22,
  },
  backButton: {
    zIndex: 100,
    backgroundColor: "white",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    alignSelf: "center",
    top: 22,
    color: "#1A2B49",
    fontSize: 14,
    fontWeight: "700",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 22,
    gap: 20,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#0071EB",
    borderRadius: 26,
    paddingVertical: 10,
  },
  btnText: {
    textAlign: "center",
    color: "#0071EB",
    fontWeight: "700",
  },
  separator: {
    borderTopWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  noReviewsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default TourReviews;