import { useState, useEffect, useCallback, useRef } from "react";
import {
  Text,
  View,
  Image,
  RefreshControl,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import axios from "axios";
import { URL_ANDROID } from "@env";
import Colors from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TourCart from "../../components/cart/TourCart";
import { connectWebSocket } from "../../services/websocket";

function Cart() {
  const [id, setId] = useState(null);

  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedItem, setCheckedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const wsRef = useRef(null);
  const [timeLefts, setTimeLefts] = useState({}); // Lưu timeLeft cho từng itemId

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCartData();
    setRefreshing(false);
  }, []);

  const fetchCartData = async (newId) => {  
    try {
      if (newId) {
        setLoading(true);
        const res = await axios.get(`${URL_ANDROID}/cart/${newId}`);
        const newData = res.data.cart?.cartIds || []; // Nếu cartIds là null/undefined, gán mảng rỗng
        setData(newData);
        setCheckedItem(null);  
      }
    } catch (err) {
      console.log("Error fetching cart data:", err.message);            
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("token");
        console.log("Token: ", token);
        
        const user = JSON.parse(result);
        if (user) {
          await fetchCartData(user._id);
          setId(user._id);

          // Khởi tạo WebSocket chung
          const socket = connectWebSocket(
            "/ws/cart",
            (data) => {
              if (data.type === "countdown" && data.itemId) {           
                    setTimeLefts((prev) => ({
                      ...prev,
                      [data.itemId]: data.timeLeft,
                    }));                    
              }
              if (data.type === "expired" && data.itemId) {
                if (user._id) {
                  // Kiểm tra id trước khi fetch
                  fetchCartData(user._id)
                    .then(() => {
                      setTimeLefts((prev) => ({
                        ...prev,
                        [data.itemId]: 0,
                      }));
                      console.log("Countdown expired for item:", data.itemId);
                    })
                    .catch((err) => {
                      console.error("Error fetching cart data on expire:", err);
                      setTimeLefts((prev) => ({
                        ...prev,
                        [data.itemId]: 0,
                      }));
                    });
                } else {
                  console.log("Cannot fetch cart data: userId not available");
                  setTimeLefts((prev) => ({
                    ...prev,
                    [data.itemId]: 0,
                  }));
                }
              }
            },
            () => console.log("Disconnected from websocket")
          );
          wsRef.current = socket;
        } else {
          setId(null);
        }
      } catch (error) {
        console.log("error profile: ", error);
      } finally {
        setIsCheckingLogin(false); // Set checking login to false
      }
    };
    getUser();
  }, []);

  const removeTour = async (item, slotsBooked) => {
    console.log("item: ", item);
    
    try {
      await axios.delete(`${URL_ANDROID}/cart/${id}/${item._id}/${slotsBooked}`);
      fetchCartData(id);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && item.isActive) {                
        wsRef.current.send(
          JSON.stringify({
            type: "removeItem",
            itemId: item._id,
          })
        );
        console.log("Sent removeItem to server for item:", item._id);
      } else {
        console.log("WebSocket not open, cannot send removeItem");
      }
    } catch (err) {
      console.error("error cart", err);
    }
  };

  const alertDeleteCustom = (cartItem, slotsBooked) => {    
    Alert.alert(
      "Remove this tour from your cart?",
      "You can add this tour to cart again.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            removeTour(cartItem, slotsBooked);
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (checkedItem?.isActive) {
      try {
        const response = await axios.post(`${URL_ANDROID}/booking/create`, {
          orderCode: Date.now(),
          userId: id,
          originalTourId: checkedItem.originalTourId._id,
          subTourId: checkedItem.subTourId._id,
          cartItemId: checkedItem._id,
          bookedSlot: checkedItem.slotsBooked,
          totalPrice: checkedItem.slotsBooked * checkedItem.subTourId.price,
          inBooking: true,
        });

        const newBookingId = response.data.booking._id; // Lấy bookingId ngay lập tức

        router.push({
          pathname: `/payment/${checkedItem.originalTourId._id}`,
          params: {
            bookingInfo: JSON.stringify({
              originalTourId: checkedItem.originalTourId._id,
              subTour: checkedItem.subTourId,
              userId: id,
              bookingId: newBookingId,
              slotsBooked: checkedItem.slotsBooked,
              totalPrice: checkedItem.slotsBooked * checkedItem.subTourId.price,
              title: checkedItem.originalTourId.title,
              thumbnail: checkedItem.originalTourId.thumbnail,
              totalReviews: 1,
              averageRating: 5,
              itemFromCart: true,
              cartItemId: checkedItem._id,   
            }),
          },
        });
      } catch (error) {
        console.log(error.response.data.message);
      }
    } else {
      Alert.alert(
        "Warning",
        "We can only hold your spot for 10 minutes. Please add again!",
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ]
      );
    }
  };

  // Chia danh sách thành active và inactive
  const cartActiveItems = data.filter((item) => item.isActive);
  const cartInactiveItems = data.filter((item) => !item.isActive);

  // Kết hợp dữ liệu với header cho inactive items
  const combinedData = [
    ...cartActiveItems,
    ...(cartInactiveItems.length > 0
      ? [{ type: "header", id: "inactive-header" }]
      : []),
    ...cartInactiveItems,
  ];

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      return (
        <View style={{}}>
          <Text
            style={{
              fontSize: 19,  
              paddingHorizontal: 22,     
              marginBottom: 10,
              paddingTop: 18,
              fontFamily: "GT Easti Medium",
              color: Colors.blackColorText,
            }}
          >
            Previously in your cart
          </Text>
        </View>
      );
    }
    return (
      <TourCart
        userId={id}
        alertDeleteCustom={alertDeleteCustom}
        removeTour={removeTour}
        checkedItem={checkedItem}
        setCheckedItem={setCheckedItem}
        item={item}
        ws={wsRef.current}
        timeLeft={timeLefts[item._id] || 0}
        fetchCartData={fetchCartData}        
      />
    );
  };

  return (
    <View style={styles.cartContainer}>
      <View style={{
        borderBottomWidth: 1,
        borderColor: "#d4d4d4",
        paddingHorizontal: 22,
        paddingBottom: 8
      }}>
        <Text
          style={{        
            color: "#1A2B49",
            fontSize: 23,
            fontWeight: "700",
          }}
        >
          Cart
        </Text>
      </View>
      {loading || isCheckingLogin ? (
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={Colors.orange}
        />
      ) : id ? (
        combinedData.length > 0 ? (
          <>
            <FlatList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              data={combinedData}
              renderItem={renderItem}
              keyExtractor={(item) =>
                item.type === "header" ? item.id : item._id
              }
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={({ leadingItem, trailingItem }) => {
                // Không hiển thị separator trước item đầu tiên
                if (combinedData.indexOf(leadingItem) === 0) {
                  return null;
                }
                // Không hiển thị separator sau header
                if (leadingItem.type === "header") {
                  return null;
                }
                return (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderColor: "rgba(133, 137, 149, 0.3)",
                    }}
                  />
                );
              }}
              contentContainerStyle={{ paddingBottom: 50 }} // Đảm bảo đủ chỗ cho footer
              extraData={timeLefts}
            />
            {cartActiveItems.length > 0 && ( // Chỉ hiển thị footer nếu có active items
              <View style={styles.footer}>
                <View>
                  <Text style={styles.totalPriceText}>
                    ₫
                    {checkedItem?.subTourId.price * checkedItem?.slotsBooked ||
                      0}
                  </Text>
                  <Text style={styles.totalPriceSubText}>subtotal</Text>
                </View>
                <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
                  <Text style={styles.checkoutBtnText}>Go to checkout</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Image
              source={require("../../assets/images/cart_background.png")}
              resizeMode="cover"
            />
            <Text style={styles.emptyCartText}>
              Your shopping cart is empty.
            </Text>
            <Link href={"/"} asChild>
              <Pressable style={styles.btn}>
                <Text style={styles.btnText}>Find things to do</Text>
              </Pressable>
            </Link>
          </View>
        )
      ) : (
        <View style={{ alignItems: "center", marginTop: 100 }}>
          <Image
            source={require("../../assets/images/cart_background.png")}
            resizeMode="cover"
          />
          <Text style={styles.emptyCartText}>Your shopping cart is empty.</Text>
          <Pressable
            style={styles.btn}
            onPress={() => router.navigate("/logintab")}
          >
            <Text style={styles.btnText}>Log in</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
  },
  cartContainer: {
    flex: 1,
    paddingTop: 40,
  },
  emptyCartText: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 32,
    marginBottom: 14,
  },
  emptyCartNoti: {
    color: "#1A2B49",
    paddingHorizontal: 40,
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#0071EB",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    // marginTop: 16,
  },
  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  tourCardContainer: {
    paddingHorizontal: 22,
    paddingTop: 12,
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
    flexWrap: "wrap",
    gap: 16,
  },
  tourCardHeaderText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "GT Easti Medium",
    color: Colors.blackColorText,
  },
  tourCardBody: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
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
    fontFamily: "GT Easti Regular",
    color: Colors.blackColorText,
  },
  tourCardFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tourCardFooterAvgScore: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  tourCardFooterAvgScoreText: {
    fontSize: 14,
    fontFamily: "GT Easti Regular",
    color: Colors.blackColorText,
  },
  tourCardFooterPriceText: {
    fontSize: 20,
    fontFamily: "GT Easti Medium",
    color: Colors.blackColorText,
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
  footer: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  totalPriceText: {
    color: Colors.blackColorText,
    fontSize: 18,
    fontFamily: "GT Easti Medium",
  },
  totalPriceSubText: {
    color: Colors.blackColorText,
    fontSize: 14,
    fontFamily: "GT Easti Regular",
  },
  checkoutBtn: {
    backgroundColor: "#0071EB",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
  },
  checkoutBtnText: {
    color: "white",
    fontSize: 14,
    fontFamily: "GT Easti Medium",
  },
});

export default Cart;
