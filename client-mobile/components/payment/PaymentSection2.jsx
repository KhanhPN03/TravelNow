import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  Pressable,
  Linking,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import ModalWrapper from "../../components/ModalWrapperNew";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import { URL_ANDROID } from "@env";
import Colors from "../../constants/Colors";
import axios from "axios";
import DiscountCard from "../discount/DiscountCard";

export default function PaymentSection2({ bookingInfo, order, bookingId, paymentStatus }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [discountCodeSelected, setDiscountCodeSelected] = React.useState();
  const [discounts, setDiscounts] = React.useState([]);
  const [finalPrice, setFinalPrice] = React.useState(order.amount);
  const [isModalVisible, setModalVisible] = React.useState(false);


  const handlePayment = async () => {
    setIsLoading(true); // Bắt đầu loading
    const orderData = {
      orderCode: order.orderCode,
      bookingId,
      amount: finalPrice,
      description: "Thanh toán đơn hàng",
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      buyerPhone: order.buyerPhone,
      cancelUrl: `travelnow://payment/payment-cancel`,
      returnUrl: `travelnow://booking?bookingId=${bookingId}`,
    };
    try {
      if(!paymentStatus) {
        const paymentLink = await axios.post(
          `${URL_ANDROID}/payment/payos/create-order`,
          orderData
        );
        const checkoutUrl = paymentLink.data.checkoutUrl;
        Linking.openURL(checkoutUrl);
      } else {
        Alert.alert("Notification", "Payment suscessfully completed", [
          {
            text: "OK",
            onPress: () => {
              // router.push("/booking");
            }
          }
        ])
      }
    } catch (error) {
      console.log(error);      
      Alert.alert("Notification", "Order created. Please finish it!");
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };


  const handleDiscountSelected = (item) => {

    if (item.discountAvailableSlots <= 0) {
      alert("This discount code has no available slots left.");
      return;
    }

    if(item.minTotalPrice <= order.amount) {
      setDiscountCodeSelected({
        discountId: item._id,
        discountCode: item.discountCode,
        discountPrice: item.discountPrice
      })
      setFinalPrice(Math.max(order.amount - item.discountPrice, 0))
    } else {
      alert("You are not enough condition to get this discount");
    }
  }

  React.useEffect(() => {
    const fetchDiscount = async () => {
      try {    
        const response = await axios.get(`${URL_ANDROID}/discount`); 
        if(response.data.success) {
          const {activeDiscounts} = response.data;
          const sortedActive = activeDiscounts.sort((a, b) => b.discountPrice - a.discountPrice);

          setDiscounts(sortedActive);    
        }      
      } catch (error) {
        console.log("Error fetching discounts:", error.response?.data || error);
        Alert.alert("Error", "Something went wrong while fetching discounts.");
      }
    };
    fetchDiscount();
  }, []);

  React.useEffect(() => { 
    const updateBooking = async () => {
      if (!bookingId || finalPrice === undefined || !discountCodeSelected) return; 

      try {
        const response = await axios.put(
          `${URL_ANDROID}/booking/update/${bookingId}`,
          { finalPrice,
            discountId: discountCodeSelected.discountId
           }  
        );      
      } catch (error) {
        console.error("Error updating booking:", error.response?.data || error.message);
      }
    }
    updateBooking();
  }, [finalPrice, discountCodeSelected]);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{marginBottom: 20}}>
        <KeyboardAvoidingView
          style={{}}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* tour information */}
          <View style={{}}>
            <Text style={styles.headerText}>Order sumary</Text>
            <View style={styles.itemHeader}>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Image
                  style={{ marginHorizontal: "auto" }}
                  width={60}
                  height={60}
                  borderRadius={4}
                  source={{ uri: `http://192.168.32.1:5000${bookingInfo.thumbnail}` }}
                />
              </View>
              <View style={{ flex: 3, marginLeft: 4 }}>
                <Text style={styles.itemSlotLeft}>
                  {bookingInfo.subTour.availableSlots} spot left
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.blackColorText,
                    fontWeight: "bold",
                  }}
                  numberOfLines={2}
                  ellipsizeMode={"tail"}
                >
                  {bookingInfo.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    height: "auto",
                    alignItems: "center",
                    columnGap: 5,
                    paddingVertical: 6,
                  }}
                >
                  <AntDesign
                    style={styles.starIconColor}
                    name="star"
                    size={16}
                  />
                  <Text style={styles.ratingText}>
                    {bookingInfo.averageRating}/5{" "}
                    <Text>({bookingInfo.totalReviews})</Text>
                  </Text>
                </View>

                <View style={styles.tourInclude}>
                  <FontAwesomeIcon
                    style={styles.tourIcon}
                    name="ticket"
                    size={16}
                  />
                  <Text>{bookingInfo.title} • Language: English</Text>
                </View>
                <View style={styles.tourInclude}>
                  <AntDesign
                    style={styles.tourIcon}
                    name="clockcircleo"
                    size={16}
                  />
                  <Text style={{ marginVertical: "auto" }}>
                    {bookingInfo.subTour.dateStart.date.split("T")[0]}
                  </Text>
                </View>
                <View style={styles.tourInclude}>
                  <FontAwesomeIcon
                    style={styles.tourIcon}
                    name="group"
                    size={16}
                  />
                  <Text style={{ marginVertical: "auto" }}>
                    {bookingInfo.slotsBooked} Adult (Age 0 - 99)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#DCDFE4",
              marginTop: 8,
            }}
          ></View>

          {/* Enter promo */}
          {discountCodeSelected ? (
            <Pressable onPress={() => setModalVisible(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14 }}
            >
              <Text style={{fontSize: 16, fontFamily: "GT Easti Bold", color: Colors.grey}}>Discount Code Aplied: 
                <Text style={{color: Colors.blackColorText}}>&nbsp;{discountCodeSelected.discountCode}</Text></Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setModalVisible(true)}>
              <Text style={styles.discountText}>Enter Discount Code</Text>
            </Pressable>
          )}

          <View style={[styles.totalPrice]}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: Colors.blackColorText,
              }}
            >
              Total:
            </Text>
            <View style={{ flexDirection: "column", display: "flex", gap: 4, justifyContent: "end" }}>
              <Text
                style={{ textAlign: "right", fontSize: 18, fontWeight: "700" }}
              >
                ₫{bookingInfo.totalPrice}
              </Text>
              {discountCodeSelected && (
                <>
                  <Text style={{textAlign: "right", color: Colors.red}}>- ₫{discountCodeSelected.discountPrice}</Text>
                  <Text style={{textAlign: "right", color: Colors.blackColorText, fontSize: 16, fontWeight: "bold"}}>₫{finalPrice}</Text>
                </>
              )}
              <Text style={styles.t_14_g}>All taxes and fees included</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderColor: "#000",
              borderWidth: 1,
              borderRadius: 10,
              width: "fit-content",
              marginTop: 12,
            }}
          >
            <AntDesign
              style={{ marginVertical: "auto", marginHorizontal: 16 }}
              color={"green"}
              name="checkcircleo"
              size={18}
            />
            <View style={{ paddingVertical: 4 }}>
              <Text style={{ fontWeight: "bold" }}>Free cancellation</Text>
              <Text>Until xx PM on September 21</Text>
            </View>
          </View>
          {/* Text policy */}
          <Text style={{ marginVertical: 16 }}>
            By continuing, you agree to{" "}
            <Text style={styles.textLink}>
              GetYourGuide's general terms and conditions
            </Text>{" "}
            and your{" "}
            <Text style={styles.textLink}>
              activity provider's terms and conditions. Read more on the
            </Text>{" "}
            right of withdrawal 
            <Text style={styles.textLink}>
              and information on the applicable
            </Text>
             travel law.
          </Text>
        </KeyboardAvoidingView>
        {/* footer */}
        <View style={{}}>
          <Pressable
            onPress={handlePayment}
            style={{
              width: "100%",
              backgroundColor: Colors.black,
              paddingVertical: 10,
              justifyContent: "center",
              borderRadius: 20,
              marginTop: 10,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.orange} /> // 🔹 Hiển thị loading
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                QR Payment
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
    <ModalWrapper
      modalTitle="Coupons"
      isModalVisible={isModalVisible}
      setModalVisible={setModalVisible}
    >    
      <FlatList
        data={discounts}
        renderItem={({item}) => <DiscountCard button={
          <TouchableOpacity
          disabled={item.discountCode === discountCodeSelected?.discountCode}
          onPress={() => handleDiscountSelected(item)}>
            <View style={{
              backgroundColor: item.discountCode === discountCodeSelected?.discountCode ? Colors.grey : Colors.blue,
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderRadius: 8
            }} >
              {
                item.discountCode === discountCodeSelected?.discountCode? (
                  <Text style={{color: "white", textAlign: "center", fontFamily: "GT Easti Medium"}}>Applied</Text>
                )
                : (
                  <Text style={{color: "white", textAlign: "center", fontFamily: "GT Easti Medium"}}>Apply</Text>
                )
              }
            </View>
          </TouchableOpacity>
        } item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No coupons available</Text>
        }
      />
    </ModalWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    // Sửa đổi: Đổi màu emptyText
    color: "#6B7280", // Xám trung tính
    textAlign: "center",
    marginTop: 50,
  },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16
  },
  discountText: {
    color: Colors.blue,
    fontSize: 15,
    marginVertical: 10,
    fontWeight: "bold"
  },
  mtb8: {
    marginVertical: 8,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  d_flex: {
    display: "flex",
    flexDirection: "row",
  },
  t_14_g: {
    color: "green",
    fontSize: 14,
    paddingLeft: 8,
  },
  optionLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "85%",
    marginLeft: 16,
  },
  appleLableIcon: {
    paddingHorizontal: 6,
    alignItems: "center",
    borderRadius: 4,
    width: "auto",
  },
  lableIcon: {
    width: "auto",
    paddingHorizontal: 6,
    alignItems: "left",
    justifyContent: "left",
    borderRadius: 4,
  },
  tourInclude: {
    flexDirection: "row",
    marginVertical: 4,
  },
  tourIcon: {
    paddingRight: 8,
    marginVertical: "auto",
  },
  itemHeader: {
    marginTop: 8,
    width: "100%",
    flexDirection: "row",
  },
  itemSlotLeft: {
    // paddingHorizontal: 10,
    paddingVertical: 2,
    textAlign: "center",
    backgroundColor: "#F77C7C",
    borderRadius: 8,
    width: "40%",
    color: "#FFFFFF",
  },
  starIconColor: {
    color: "#FDCC0D",
  },
  totalPrice: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 12,
  },
  ratingText: {},
  textLink: {
    color: "#0071EBE5",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    height: "40%",
    marginTop: "auto",
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    justifyContent: "flex-end",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  CreditPayBtn: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  inputLeftCol: {
    width: "60%",
    marginRight: 20,
  },
  inputLine: {
    flexDirection: "row",
  },
  inputRightCol: {
    width: "30%",
  },
});
