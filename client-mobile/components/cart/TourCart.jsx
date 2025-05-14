import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { RadioButton } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Colors from "../../constants/Colors";
import CountdownTimer from "./CountdownTimer";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";
import { URL_ANDROID } from "@env";
import { MaterialIcons } from "@expo/vector-icons";


const calculateAverageRating = (reviews) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return null;

  let totalRatings = { priceQuality: 0, services: 0, transport: 0 };
  let count = 0;

  reviews.forEach((review) => {
    if (review.rating) {
      totalRatings.priceQuality += review.rating.priceQuality || 0;
      totalRatings.services += review.rating.services || 0;
      totalRatings.transport += review.rating.transport || 0;
      count++;
    }
  });

  if (count === 0) return null;
  const priceQualityAverage = (totalRatings.priceQuality / count);
  const servicesAverage = (totalRatings.services / count);
  const transportAverage = (totalRatings.transport / count);
  console.log(priceQualityAverage, servicesAverage, transportAverage);
  const averageRating = ((priceQualityAverage + servicesAverage + transportAverage)/3).toFixed(2);
  return averageRating;
};

function TourCart({
  checkedItem,
  setCheckedItem,
  item,
  alertDeleteCustom,
  userId,
  ws,
  timeLeft,
  fetchCartData,
  removeTour
}) {
  const [localTimeLeft, setLocalTimeLeft] = useState(timeLeft);
  const [reviewData, setReviewData] = useState([]);
  const wsRef = useRef(ws);

  const handleRadioButton = () => {
    if (item.isActive) {
      setCheckedItem(item);
    }
  };

  const handleAddBackToCart = async () => {
    try {
      const response = await axios.put(`${URL_ANDROID}/cart/add-back-to-cart`, {
        subTourId: item.subTourId,
        slotsBooked: item.slotsBooked,
        cartItemId: item._id,
      });
      if (response.data.status === "success") {
        fetchCartData(userId);
      }
    } catch (error) {
      Alert.alert("Notification","Tour is not available");
      if(error.response.status === 400 || error.response.status === 404) {
        removeTour(item, item.slotsBooked);        
      }
      console.log("Error add back to cart: ", error);
    }
  };

  useEffect(() => {
    // Cập nhật wsRef nếu ws từ props thay đổi
    wsRef.current = ws;
    setLocalTimeLeft(timeLeft);
    // Không khởi tạo WebSocket ở đây nữa, sử dụng ws từ Cart.js
  }, [ws, timeLeft]);

  useEffect(() => {
    const getReview = async () => {
      try {
        const response = await axios.get(`${URL_ANDROID}/review-tour/tour-reviews/${item.originalTourId._id}`);
        const {reviews} = response.data;
        setReviewData(reviews);
      } catch (error) {
        console.log("Error cart item: ", error.message);
      }
    }
    getReview();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const sendStartCountdown = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "startCountdown",
              userId: userId,
              itemId: item._id,
              subTourId: item.subTourId,
              slotsBooked: item.slotsBooked,
            })
          );
          console.log("Sent startCountdown to server for item:", item._id);
        } else {
          console.log("WebSocket not open yet, waiting for connection...");
        }
      };

      // Gửi ngay nếu đã mở, hoặc đợi onopen nếu chưa
      sendStartCountdown();

      if (
        wsRef.current &&
        wsRef.current.readyState !== WebSocket.OPEN &&
        item.isActive
      ) {
        wsRef.current.onopen = () => {
          sendStartCountdown();
        };
      }
    }, [userId, item._id]) // Dependency là userId và itemId
  );

  return (
    <View style={styles.tourCardContainer}>
      {item.isActive && (
        <CountdownTimer
          timeLeft={localTimeLeft}
          setTimeLeft={setLocalTimeLeft}
        />
      )}
      <Pressable onPress={handleRadioButton}>
        <View style={styles.tourCard}>
          <View style={{ position: "relative" }}>
            <View style={{ position: "relative" }}>
              <Image
                style={styles.tourCardImg}
                source={{
                  uri: `http://192.168.32.1:5000${item.originalTourId.thumbnail}`,
                }}
                resizeMode="cover"
              />
              {!item.isActive && <View style={styles.overlay} />}
            </View>
            {!item.isActive && (
              <Pressable
                style={{
                  borderWidth: 2,
                  borderColor: Colors.blue,
                  borderRadius: 40,
                  paddingVertical: 6,
                  alignItems: "center",
                  marginTop: 16,
                }}
                onPress={handleAddBackToCart}
              >
                <View>
                  <Text
                    style={{
                      color: Colors.blue,
                      fontFamily: "GT Easti Medium",
                    }}
                  >
                    Add back to cart
                  </Text>
                </View>
              </Pressable>
            )}
            {item.isActive && (
              <View style={styles.radioBtnContainer}>
                <RadioButton
                  value={item._id}
                  status={
                    checkedItem?._id === item._id ? "checked" : "unchecked"
                  }
                  color={Colors.blue}
                  uncheckedColor="#AFAFAF"
                  onPress={handleRadioButton}
                />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.tourCardHeader}>
              <Text
                style={[
                  styles.tourCardHeaderText,
                  {
                    color: item.isActive ? Colors.blackColorText : Colors.grey,
                  },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.originalTourId.title}
              </Text>
              <Pressable
                onPress={() => alertDeleteCustom(item, item.slotsBooked)}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.blue} />
              </Pressable>
            </View>
            <View style={styles.tourCardBody}>
              <View style={styles.tourCardBodyItem}>
                <Feather name="calendar" size={14} color="black" />
                <Text style={styles.tourCardBodyItemText}>
                  {item.subTourId.dateStart.date.split("T")[0]}
                </Text>
              </View>
              <View style={styles.tourCardBodyItem}>
                <Ionicons name="people" size={12} color="black" />
                <Text style={styles.tourCardBodyItemText}>
                  {item.slotsBooked} x Participants
                </Text>
              </View>
              <View style={styles.tourCardBodyItem}>
                <AntDesign name="clockcircle" size={12} color="black" />
                <Text style={styles.tourCardBodyItemText}>
                  {item.originalTourId.duration} Days
                </Text>
              </View>
              <View style={styles.tourCardBodyItem}>
                <MaterialIcons name="language" size={13} color="black" />
                <Text style={styles.tourCardBodyItemText}>                  
                  Language: {item.subTourId.guideLanguage}
                </Text>
              </View>
            </View>
            <View style={styles.tourCardFooter}>
              <Text style={styles.tourCardFooterPriceText}>
                ₫{item.subTourId.price * item.slotsBooked}
              </Text>
              <View style={styles.tourCardFooterAvgScore}>
                <AntDesign name="star" size={12} color="#ffc52b" />
                <Text style={styles.tourCardFooterAvgScoreText}>{calculateAverageRating(reviewData) || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tourCardContainer: {
    paddingHorizontal: 22,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "gray", // Màu xám
    opacity: 0.8,
    borderRadius: 20,
  },
  tourCard: {
    paddingVertical: 12,
    flexDirection: "row",
    gap: 15,
  },
  tourCardImg: {
    width: 141,
    height: 123,
    borderRadius: 20,
  },
  tourCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  tourCardHeaderText: {
    flex: 1,
    fontSize: 17,
    fontFamily: "GT Easti Bold",
  },
  tourCardBody: {
    paddingVertical: 8,
    // flexDirection: "row",
    // flexWrap: "wrap",
    rowGap: 4,
    columnGap: 14,
  },
  tourCardBodyItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 82,
  },
  tourCardBodyItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.blackColorText,
  },
  tourCardFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  tourCardFooterAvgScore: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2
  },
  tourCardFooterAvgScoreText: {
    fontSize: 14,
    color: Colors.blackColorText,
  },
  tourCardFooterPriceText: {
    fontSize: 18,
    color: Colors.blackColorText,
    fontFamily: "GT Easti Regular",
  },
  radioBtnContainer: {
    position: "absolute",
    top: 0,
    left: -4,
    backgroundColor: "#fff",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TourCart;
