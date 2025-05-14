import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import axios from "axios";
import { URL_ANDROID } from "@env";
import { useRouter, Link, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../constants/Colors";
import FeedbackModal from "../../components/booking/FeedbackModal";
import { AntDesign } from "@expo/vector-icons";
import TabMenu from "../../components/booking/TabMenu";
import EmptyRefundedList from "../../components/booking/EmptyRefundedList";
import BankList from "../../static-data/BankList";
import DropDownPicker from "react-native-dropdown-picker";
import reasons from "../../static-data/reasons";

const calculateAverageStars = (transport, services, priceQuality) => {
  return ((transport + services + priceQuality) / 3).toFixed(1);
};

const formatDateString = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Hàm kiểm tra xem đã qua 24 giờ kể từ khi đặt vé chưa
const canShowRefundButton = (createdAt) => {
  const bookingDate = new Date(createdAt);
  const refundDeadline = new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000); // +24 giờ
  const currentDate = new Date();
  return currentDate <= refundDeadline;
};

const TicketScreen = () => {
  const [upcomingTickets, setUpcomingTickets] = useState([]);
  const [completedTickets, setCompletedTickets] = useState([]);
  const [refundedTickets, setRefundedTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [displayData, setDisplayData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [refundInfo, setRefundInfo] = useState({
    accountNumber: "",
    bankName: "",
    accountNameBank: "",
  }); // State cho thông tin ngân hàng

  // Modal states
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketInfoModalVisible, setIsTicketInfoModalVisible] =
    useState(false);
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  const [openBankName, setOpenBankName] = useState(false);
  const [valueBankName, setValueBankName] = useState("MB Bank");

  const [step, setStep] = useState(1); // Quản lý bước: 1 = thông tin ngân hàng, 2 = lý do hoàn tiền
  const [selectedReason, setSelectedReason] = useState(null); // Lý do được chọn
  const [customReason, setCustomReason] = useState(""); // Lý do tùy chỉnh khi chọn "Other"

  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

  // Fetch user reviews
  const fetchReviews = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `${URL_ANDROID}/review-tour/get-review/${userId}`
      );
      setReviews(response.data.reviews);
    } catch (error) {
      console.error(
        "Error fetching reviews:",
        error.response?.data?.message || error
      );
    }
  }, []);

  // Fetch user tickets
  const fetchTickets = useCallback(async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${URL_ANDROID}/ticket/get-all-tickets?userId=${userId}`
      );
      const { completedTickets, upcomingTickets, refundedTickets } =
        response.data;
      setUpcomingTickets(upcomingTickets);
      setCompletedTickets(completedTickets);
      setRefundedTickets(refundedTickets);
    } catch (error) {
      console.error(
        "Error fetching tickets:",
        error.response?.data?.message || error
      );
    } finally {
      // Shorter timeout for better UX
      setTimeout(() => setLoading(false), 300);
    }
  }, []);

  // Update ticket data when tab changes
  useEffect(() => {
    if (activeTab === "Upcoming") {
      setDisplayData(upcomingTickets);
    } else if (activeTab === "Completed") {
      setDisplayData(completedTickets);
    } else if (activeTab === "Refunded") {
      setDisplayData(refundedTickets);
    }
  }, [activeTab, upcomingTickets, completedTickets, refundedTickets]);

  // Check user login status
  useEffect(() => {
    const getUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const user = JSON.parse(userJson);

        if (user) {
          setUserId(user._id);
          fetchTickets(user._id);
          fetchReviews(user._id);
        }
      } catch (error) {
        console.log("Error loading user profile:", error);
      } finally {
        setIsCheckingLogin(false);
      }
    };

    getUser();
  }, [fetchTickets, fetchReviews]);

  // Handle booking confirmation
  useEffect(() => {
    if (!bookingId) return;

    const updateBooking = async () => {
      try {
        await Promise.all([
          axios.put(`${URL_ANDROID}/booking/subtour/update-slot/${bookingId}`, {
            paymentSuccess: true,
          }),
          axios.put(`${URL_ANDROID}/booking/update/${bookingId}`, {
            bookingStatus: "Confirmed",
          }),
        ]);
        console.log("Booking session updated successfully");
        // Refresh tickets after update
        if (userId) fetchTickets(userId);
      } catch (error) {
        console.error("Error updating booking:", error.response?.data || error);
      }
    };

    updateBooking();
  }, [bookingId, userId, fetchTickets]);

  // Handle ticket selection
  const handleTicketPress = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketInfoModalVisible(true);
  };

  // Handle review press
  const handleReviewPress = (ticket) => {
    setSelectedTicket(ticket);
    setIsFeedbackModalVisible(true);
  };

  const handleRefundPress = (ticket) => {
    setSelectedTicket(ticket); // Lưu ticket được chọn
    setRefundInfo({ accountNumber: "", bankName: "", accountNameBank: "" }); // Reset thông tin ngân hàng
    setIsRefundModalVisible(true); // Mở modal
  };

  const handleNext = () => {
    // Kiểm tra thông tin ngân hàng trước khi chuyển bước
    const trimmedRefundInfo = {
      accountNumber: refundInfo.accountNumber.trim(),
      bankName: valueBankName,
      accountNameBank: refundInfo.accountNameBank.replace(/\s+/g, " ").trim(),
    };

    if (
      !trimmedRefundInfo.accountNumber ||
      !trimmedRefundInfo.bankName ||
      !trimmedRefundInfo.accountNameBank
    ) {
      Alert.alert("Error", "Please fill in all bank information fields.");
      return;
    }

    if (!/^\d+$/.test(trimmedRefundInfo.accountNumber)) {
      Alert.alert("Error", "Account Number must contain only digits.");
      return;
    }

    setStep(2); // Chuyển sang bước chọn lý do
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for the refund.");
      return;
    }

    const finalReason =
      selectedReason === "other" ? customReason : selectedReason;
    if (
      selectedReason === "other" &&
      !customReason.replace(/\s+/g, " ").trim()
    ) {
      Alert.alert("Error", "Please enter a custom reason.");
      return;
    }

    submitRefundRequest(finalReason); // Gọi hàm submit với lý do hoàn tiền
  };

  // Hàm submit thông tin hoàn tiền
  const submitRefundRequest = async (reason) => {
    try {
      const trimmedRefundInfo = {
        accountNumber: refundInfo.accountNumber.trim(),
        bankName: valueBankName,
        accountNameBank: refundInfo.accountNameBank.replace(/\s+/g, " ").trim(),
      };

      const finalReason =
        selectedReason === "other"
          ? reason.replace(/\s+/g, " ").trim()
          : reason;

      // Kiểm tra dữ liệu đầu vào
      if (
        !trimmedRefundInfo.accountNumber ||
        !trimmedRefundInfo.bankName ||
        !trimmedRefundInfo.accountNameBank
      ) {
        Alert.alert("Error", "Please fill in all bank information fields.");
        return;
      }

      if (!/^\d+$/.test(trimmedRefundInfo.accountNumber)) {
        Alert.alert("Error", "Account Number must contain only digits.");
        return;
      }

      setLoading(true);
      const response = await axios.post(`${URL_ANDROID}/refund/ticket/create`, {
        userId,
        ticketId: selectedTicket._id,
        refundInformation: { ...trimmedRefundInfo, reason: finalReason },
      });

      if (response.data.status === "success") {
        Alert.alert(
          "Refund Request",
          "Your refund request has been submitted and is pending approval."
        );
        setIsRefundModalVisible(false); // Đóng modal
        setStep(1); // Reset về bước 1
        setSelectedReason(null); // Reset lý do
        setCustomReason(""); // Reset input tùy chỉnh
        if (userId) await fetchTickets(userId); // Cập nhật danh sách ticket
      } else {
        throw new Error("Failed to submit refund request");
      }
    } catch (error) {
      console.log("Error submitting refund request:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to submit refund request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookAgain = async (item) => {
    try {
      const response = await axios.put(
        `${URL_ANDROID}/ticket/check-availability/${item.bookingId.subTourId._id}`,
        {
          bookedSlot: item.bookingId.bookedSlot,
          ticketId: item._id,
        }
      );
      const { status } = response.data;
      if (status === "success") {
        const [bookingRes, reviewsRes] = await Promise.all([
          axios.post(`${URL_ANDROID}/booking/create`, {
            orderCode: Date.now(),
            userId: userId,
            originalTourId: item.bookingId.originalTourId._id,
            subTourId: item.bookingId.subTourId._id,
            bookedSlot: item.bookingId.bookedSlot,
            totalPrice: item.bookingId.totalPrice,
          }),
          axios.get(
            `${URL_ANDROID}/review-tour/tour-reviews/${item.bookingId.originalTourId._id}`
          ),
        ]);

        console.log("booking res: ", bookingRes.data);
        console.log("review res: ", reviewsRes.data);
        const newBookingId = bookingRes.data.booking._id; // Lấy bookingId ngay lập tức
        // const averageRating = (parseFloat(reviewsRes?.data.rating.transport) +
        // parseFloat(reviewsRes?.data.rating.services) +
        // parseFloat(reviewsRes?.data.rating.priceQuality)) / 3;

        router.push({
          pathname: `/payment/${item.bookingId.originalTourId}`,
          params: {
            bookingInfo: JSON.stringify({
              originalTourId: item.bookingId.originalTourId._id,
              subTour: item.bookingId.subTourId,
              userId: userId,
              bookingId: newBookingId,
              slotsBooked: item.bookingId.bookedSlot,
              totalPrice: item.bookingId.totalPrice,
              title: item.bookingId.originalTourId.title,
              thumbnail: item.bookingId.originalTourId.thumbnail,
              totalReviews: reviewsRes?.data.reviews.length,
              averageRating: 5,
            }),
          },
        });
      }
    } catch (error) {
      console.log("book again error: ", error);
      fetchTickets(userId);
      Alert.alert("Notification", error.response.data.message);
    }
  };

  // Render ticket item
  const renderTicketItem = ({ item }) => {
    let starRating = 0;

    if (activeTab === "Completed" && reviews.length > 0) {
      const review = reviews.find(
        (review) => item.bookingId.originalTourId._id === review.originalTourId
      );

      if (review) {
        starRating = calculateAverageStars(
          review.rating.transport,
          review.rating.services,
          review.rating.priceQuality
        );
      }
    }

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleTicketPress(item)}
      >
        <Image
          source={{
            uri: `http://192.168.32.1:5000${item.bookingId.originalTourId.thumbnail}`,
          }}
          style={styles.image}
        />
        <View style={styles.detailsContainer}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.tourName}
          >{`Tour name: ${item.bookingId.originalTourId.title}`}</Text>

          <Text style={styles.bookedDate}>{`Booked: ${formatDateString(
            item.createdAt
          )}`}</Text>

          <Text
            style={styles.slot}
          >{`Slot: ${item.bookingId.bookedSlot}`}</Text>

          {activeTab === "Upcoming" && canShowRefundButton(item.createdAt) ? (
            <Pressable
              style={styles.refundButton}
              onPress={() => handleRefundPress(item, fetchTickets)}
            >
              <Text style={styles.refundButtonText}>Refund</Text>
            </Pressable>
          ) : null}

          {activeTab === "Completed" &&
            (starRating > 0 ? (
              <Pressable
                style={styles.ratingContainer}
                onPress={() => handleReviewPress(item)}
              >
                <AntDesign name="star" size={10} color={Colors.yellow} />
                <Text style={styles.ratingText}>{starRating}/5</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.reviewButton}
                onPress={() => handleReviewPress(item)}
              >
                <Text style={styles.reviewButtonText}>Review</Text>
              </Pressable>
            ))}

          {activeTab === "Refunded" && (
            <>
              {item.refundStatus === "PENDING" ? (
                <View style={styles.pendingContainer}>
                  <AntDesign
                    name="clockcircleo"
                    size={14}
                    color={Colors.grey}
                  />
                  <Text style={styles.pendingText}>Refund: Pending</Text>
                </View>
              ) : item.refundStatus === "SUCCESS" ? (
                <View style={styles.successContainer}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <AntDesign name="checkcircleo" size={14} color={"green"} />
                    <Text style={styles.successText}>Refund: Success</Text>
                  </View>
                  {!item.isCancel && (
                    <Pressable
                      style={styles.bookAgainButton}
                      onPress={() => handleBookAgain(item)}
                    >
                      <Text
                        style={{
                          color: Colors.white,
                          fontFamily: "GT Easti Bold",
                          paddingVertical: 2,
                        }}
                      >
                        Book Again
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : item.refundStatus === "FAILED" ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AntDesign name="closecircleo" size={14} color={"red"} />
                  <Text style={styles.successText}>Refund: Failed</Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ticket</Text>

      {userId && (
        <View style={{ marginVertical: 14 }}>
          <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      )}

      {loading || isCheckingLogin ? (
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={Colors.orange}
        />
      ) : userId ? (
        displayData.length > 0 ? (
          <FlatList
            data={displayData}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
          />
        ) : activeTab === "Refunded" ? (
          <EmptyRefundedList />
        ) : (
          // Display if no data
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Image
              source={require("../../assets/images/booking_background.png")}
              resizeMode="cover"
            />
            <Text style={styles.emptyCartText}>
              What's your next experience?
            </Text>
            <Text
              style={{ width: "60%", textAlign: "center", marginBottom: 16 }}
            >
              Here's where you'll look back for all the activities you have
              booked
            </Text>
            <Link href={"/(tabs)"} asChild>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Find things to do</Text>
              </Pressable>
            </Link>
          </View>
        )
      ) : (
        // Display if user is not logged in
        <View style={{ alignItems: "center", marginTop: 100 }}>
          <Image
            source={require("../../assets/images/booking_background.png")}
            resizeMode="cover"
          />
          <Text style={styles.emptyCartText}>What's your next experience?</Text>
          <Text style={{ width: "60%", textAlign: "center", marginBottom: 16 }}>
            Here's where you'll look back for all the activities you have booked
          </Text>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.navigate("/logintab")}
          >
            <Text style={styles.actionButtonText}>Log in</Text>
          </Pressable>
        </View>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalVisible && (
        <FeedbackModal
          isModalVisible={isFeedbackModalVisible}
          setModalVisible={setIsFeedbackModalVisible}
          item={selectedTicket}
          fetchReviews={() => fetchReviews(userId)}
        />
      )}

      {/* Ticket Info Modal */}
      {selectedTicket && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isTicketInfoModalVisible}
          onRequestClose={() => {
            setIsTicketInfoModalVisible(false);
            setSelectedTicket(null);
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền mờ nhẹ hơn
            }}
          >
            <View
              style={{
                width: "90%",
                maxWidth: 400,
                backgroundColor: "#fff",
                borderRadius: 15,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 5,
                position: "relative", // Thêm để đặt icon X ở góc
              }}
            >
              {/* Header */}
              <View
                style={{
                  backgroundColor: "#f05a28", // Màu cam đậm
                  paddingVertical: 20,
                  paddingHorizontal: 20,
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#fff",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  More Detail
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#fff",
                    textTransform: "uppercase",
                    textAlign: "center",
                    lineHeight: 24,
                  }}
                >
                  {selectedTicket?.bookingId?.originalTourId?.title || "N/A"}
                </Text>
              </View>

              {/* Icon X (Close) */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  backgroundColor: "rgba(255, 255, 255, 0.3)", // Nền mờ nhẹ, hòa hợp với màu cam
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setIsTicketInfoModalVisible(false);
                  setSelectedTicket(null);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>

              {/* Nội dung */}
              <View
                style={{
                  padding: 20,
                }}
              >
                {/* Mỗi mục thông tin */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Booked at
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTicket?.bookingId?.createdAt
                      ? formatDateString(selectedTicket.bookingId.createdAt)
                      : "N/A"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Name
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTicket?.bookingId?.buyerName || "N/A"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Start date
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTicket?.bookingId?.subTourId?.dateStart
                      ? formatDateString(
                          selectedTicket.bookingId.subTourId.dateStart.date
                        )
                      : "N/A"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Total price
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTicket?.bookingId?.finalPrice || "N/A"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    End date
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    {/* Giả sử có trường end date, nếu không bạn có thể bỏ hoặc thay thế */}
                    {selectedTicket?.bookingId?.subTourId?.dateEnd
                      ? formatDateString(
                          selectedTicket.bookingId.subTourId.dateEnd
                        )
                      : "N/A"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Slot
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTicket?.bookingId?.bookedSlot ?? "N/A"}
                  </Text>
                </View>

                {/* Booking Reference (Ticket Ref) */}
                <View
                  style={{
                    marginTop: 10,
                    marginBottom: 20,
                    padding: 15,
                    borderWidth: 2,
                    borderColor: "#f05a28", // Viền cam
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                      marginBottom: 5,
                    }}
                  >
                    Ticket reference
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#f05a28", // Chữ cam
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedTicket?.ticketRef || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Refund Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isRefundModalVisible}
        onRequestClose={() => {
          setIsRefundModalVisible(false);
          setStep(1); // Reset về bước 1 khi đóng modal
          setSelectedReason(null); // Reset lý do
          setCustomReason(""); // Reset input tùy chỉnh
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "GT Easti Bold",
                marginBottom: 20,
                textAlign: "center",
                color: Colors.blackColorText,
              }}
            >
              {step === 1 ? "Refund Information" : "Reason for Refund"}
            </Text>

            {step === 1 ? (
              // Bước 1: Nhập thông tin ngân hàng
              <View style={{ gap: 15 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "GT Easti Regular",
                      color: Colors.blackColorText,
                      marginBottom: 5,
                    }}
                  >
                    Bank Name
                  </Text>
                  <DropDownPicker
                    open={openBankName}
                    value={valueBankName}
                    items={BankList}
                    setOpen={setOpenBankName}
                    setValue={setValueBankName}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.grey,
                      borderRadius: 5,
                      padding: 12,
                      height: 50,
                    }}
                    dropDownContainerStyle={{
                      borderWidth: 1,
                      borderColor: Colors.grey,
                      borderRadius: 5,
                    }}
                    textStyle={{
                      fontFamily: "GT Easti Regular",
                      fontSize: 16,
                      color: Colors.blackColorText,
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "GT Easti Regular",
                      color: Colors.blackColorText,
                      marginBottom: 5,
                    }}
                  >
                    Account Number
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.grey,
                      borderRadius: 5,
                      padding: 12,
                      fontFamily: "GT Easti Regular",
                      fontSize: 16,
                      color: Colors.blackColorText,
                    }}
                    placeholder="Enter account number"
                    value={refundInfo.accountNumber}
                    onChangeText={(text) =>
                      setRefundInfo({
                        ...refundInfo,
                        accountNumber: text.trim(),
                      })
                    }
                    keyboardType="number-pad"
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "GT Easti Regular",
                      color: Colors.blackColorText,
                      marginBottom: 5,
                    }}
                  >
                    Account Name
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.grey,
                      borderRadius: 5,
                      padding: 12,
                      fontFamily: "GT Easti Regular",
                      fontSize: 16,
                      color: Colors.blackColorText,
                      textTransform: "uppercase",
                    }}
                    placeholder="Enter account name"
                    value={refundInfo.accountNameBank}
                    onChangeText={(text) =>
                      setRefundInfo({
                        ...refundInfo,
                        accountNameBank: text.toUpperCase(),
                      })
                    }
                  />
                </View>
              </View>
            ) : (
              // Bước 2: Chọn lý do hoàn tiền
              <View style={{ gap: 15 }}>
                {reasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.value}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                    }}
                    onPress={() => setSelectedReason(reason.value)}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: Colors.grey,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      {selectedReason === reason.value && (
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: "#1E90FF",
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "GT Easti Regular",
                        color: Colors.blackColorText,
                      }}
                    >
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                {selectedReason === "other" && (
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.grey,
                      borderRadius: 5,
                      padding: 12,
                      fontFamily: "GT Easti Regular",                    
                      fontSize: 16,
                      color: Colors.blackColorText,
                      maxHeight: 120, // Giới hạn độ cao tối đa
                      textAlignVertical: "top", // Đưa con trỏ và văn bản lên phía trên
                    }}
                    placeholder="Enter your reason"
                    value={customReason}
                    onChangeText={setCustomReason}
                    multiline={true} // Cho phép nhập nhiều dòng
                    scrollEnabled={true} // Bật cuộn khi vượt quá độ cao tối đa
                    numberOfLines={4} // Số dòng ban đầu hiển thị
                  />
                )}
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor:
                    step === 1 ? "#FF6347" : Colors.blackColorText,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  flex: 1,
                }}
                onPress={() => {
                  if (step === 1) {
                    setIsRefundModalVisible(false); // Đóng modal ở bước 1
                  } else {
                    setStep(1); // Quay lại bước 1 ở bước 2
                  }
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontFamily: "GT Easti Bold",
                    fontSize: 16,
                  }}
                >
                  {step === 1 ? "Cancel" : "Back"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#1E90FF",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  flex: 1,
                }}
                onPress={step === 1 ? handleNext : handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontFamily: "GT Easti Bold",
                    fontSize: 16,
                  }}
                >
                  {loading ? "Submitting..." : step === 1 ? "Next" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 44,
    paddingHorizontal: 22,
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonRefundModal: {
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 5,
    padding: 10,
    fontFamily: "GT Easti Regular",
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
    justifyContent: "flex-end",
  },
  successContainer: {
    // Style cho trạng thái Refund: Success
    alignItems: "center",
    paddingVertical: 4,
    gap: 6,
    alignSelf: "flex-start",
  },
  successText: {
    fontSize: 13,
    color: Colors.blackColorText, // Màu xanh đậm
    fontWeight: "bold",
    marginLeft: 4,
  },
  bookAgainButton: {
    // Style cho nút Book Again
    backgroundColor: Colors.orange,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  bookAgainButtonText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: "bold",
  },
  pendingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Màu nền nhạt (cam nhạt)
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  pendingText: {
    fontSize: 13,
    color: Colors.grey, // Màu chữ cam
    fontWeight: "bold",
    marginLeft: 4, // Khoảng cách giữa icon và chữ
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "100%",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
    gap: 5,
    justifyContent: "start",
  },
  tourName: {
    color: "#1A2B49",
    fontFamily: "GT Easti Bold",
    fontSize: 17,
  },
  bookedDate: {
    color: "#858995",
    marginTop: 4,
    fontFamily: "GT Easti Regular",
  },
  slot: {
    color: "#1A2B49",
    marginTop: 4,
    fontFamily: "GT Easti Regular",
  },
  refundButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors.orange,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginTop: 5,
  },
  refundButtonText: {
    alignSelf: "center",
    fontFamily: "GT Easti Medium",
    fontSize: 14,
    color: Colors.white,
  },
  ratingContainer: {
    alignSelf: "flex-start",
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ratingText: {
    fontFamily: "GT Easti Medium",
    fontSize: 14,
    color: "#F07B43",
  },
  reviewButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FF5533",
    borderRadius: 31,
    paddingHorizontal: 30,
    paddingVertical: 5,
    marginTop: 5,
  },
  reviewButtonText: {
    alignSelf: "center",
    fontFamily: "GT Easti Medium",
    fontSize: 14,
    color: "#F07B43",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "GT Easti Bold",
    marginBottom: 10,
    textAlign: "center",
    color: Colors.blackColorText,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "GT Easti Regular",
  },
  modalTextTicketRef: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "GT Easti Bold",
    color: "#FF5533",
    borderWidth: 2,
    borderColor: "#FF5533",
    width: "100%",
    textAlign: "center",
    padding: 5,
    paddingTop: 10,
    borderRadius: 100,
  },
  modalLabel: {
    fontSize: 17,
    fontFamily: "GT Easti Bold",
    color: Colors.blackColorText,
  },
  modalButton: {
    paddingVertical: 8,
    borderWidth: 1.5,
    width: "50%",
    borderColor: "#0071EB",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0071EB",
    marginTop: 10,
    alignSelf: "center",
  },
  textActive: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "GT Easti Bold",
  },
  emptyCartText: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
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
  },
  btn: {
    backgroundColor: "#0071EB",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
  },
  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default TicketScreen;
