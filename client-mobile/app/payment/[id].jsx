import { router, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"; // Sử dụng useRouter thay vì navigation pop
import * as React from "react";
import { StyleSheet, View, AppState, Button, Alert } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import PaymentHeader from "../../components/payment/PaymentHeader";
import PaymentSection1 from "../../components/payment/PaymentSection1";
import PaymentSection2 from "../../components/payment/PaymentSection2";
import axios from "axios";
import { URL_ANDROID } from "@env";
import PaymentProvider from "../../context/PaymentProvider";
import {connectWebSocket} from "../../services/websocket";


function PaymentDetail() {
  const { bookingInfo, id } = useLocalSearchParams(); 
  const [progressStep, setProgressStep] = React.useState(0);
  const [paymentStatus, setPaymentStatus] = React.useState(null); // State để render
  const paymentStatusRef = React.useRef(null);
  const [ws, setWs] = React.useState();
  const [wsCart, setWsCart] = React.useState(null); // Thêm WebSocket cho cart
  const [timeLeft, setTimeLeft] = React.useState(10 * 60); // 10 phút
  const parsedBookingInfo = React.useMemo(() => {
    try {
      return JSON.parse(bookingInfo);
    } catch (e) {
      console.error("Error parsing bookingInfo:", e);
      return null;
    }
  }, [bookingInfo]);

  const [order, setOrder] = React.useState({
    orderCode: 0,
    amount: parsedBookingInfo.totalPrice,
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
  });

  const [customer, setCustomer] = React.useState({
    fullname: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = React.useState({});

  const handleChange = (name, value) => {
    validateForm({
      ...customer,
      [name]: value,
    });
    setCustomer({
      ...customer,
      [name]: value,
    });
  };

  const validateForm = (customer) => {
    let formErrors = {};
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;

    if (!customer.fullname || !nameRegex.test(customer.fullname)) {
      formErrors.fullname =
        "First name is required and must contain only letters";
    }
    if (!customer.email || !emailRegex.test(customer.email)) {
      formErrors.email = "A valid email is required";
    }
    if (!customer.phone || !phoneRegex.test(customer.phone)) {
      formErrors.phone = "Phone number must be 10 digits and start with 0";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleNextStep = () => setProgressStep((prev) => prev + 1);

  const handleBackStep = () => {
    if (progressStep > 0) {
      setProgressStep(progressStep - 1);
      // router.back(); // Quay lại màn hình trước bằng expo-router
    }
  };

  const updateSlotAndBookingStatus = async () => {
    try {
      await Promise.all([
        axios.put(
          `${URL_ANDROID}/booking/subtour/update-slot/${parsedBookingInfo.bookingId}`
        ),
        axios.put(
          `${URL_ANDROID}/booking/update/${parsedBookingInfo.bookingId}`,
          {
            bookingStatus: "Failed",
          }
        ),
      ]);
      console.log("Booking session is updated at payment");
    } catch (error) {
      console.error("Error updating slots:", error.response?.data || error);
    }
  };

  const clearPaymentTimeout = async () => {
    try {
      const response = await axios.post(`${URL_ANDROID}/booking/clear-timeout`, {
        bookingId: parsedBookingInfo.bookingId,
      });
      console.log(response.data.message);
    } catch (error) {
      console.error("❌ Lỗi khi clear timeout:", error);
    }
  };

  React.useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        const response = await axios.get(
          `${URL_ANDROID}/booking/${parsedBookingInfo.bookingId}`
        );
   
        setOrder((prev) => ({
          ...prev,
          orderCode: response.data.booking.orderCode,
        }));
      } catch (error) {
        console.log("error payment:", error.response?.data?.message || error);
      }
    };

    const socket = connectWebSocket(
      "/ws/payment",
      (data) => {
        setPaymentStatus(data.status);
        paymentStatusRef.current = data.status;
        console.log("Received payment status:", data.status);
      },
      () => console.log("disconnected from websocket")
    );

    setWs(socket);

    if(parsedBookingInfo.cartItemId) {
      // WebSocket cho cart
      const cartSocket = connectWebSocket(
       "/ws/cart",
       (data) => {
         console.log("...nhan message from cart");
       },
       () => console.log("Disconnected from cart websocket")
     );
 
     setWsCart(cartSocket);
 
      // Gửi startPayment khi mount
      cartSocket.onopen = () => {
       if (parsedBookingInfo?.cartItemId) {
         cartSocket.send(
           JSON.stringify({
             type: "startPayment",
             itemId: parsedBookingInfo.cartItemId,
           })
         );
         console.log("Sent startPayment to cartSocket after connection opened:", parsedBookingInfo.cartItemId);
       } else {
         console.error("No cartItemId available to send startPayment");
       }
     };
    }

    fetchBookingInfo();
    console.log("PaymentDetail mounted");
    return () => {
      console.log("PaymentDetail unmounted");
      console.log("payment status: ", paymentStatusRef.current);   
      if(timeLeft > 0 && paymentStatusRef.current === null && !parsedBookingInfo.itemFromCart) {      
        updateSlotAndBookingStatus();        
      } 
      if(parsedBookingInfo.cartItemId) {
        if (cartSocket && cartSocket.readyState === WebSocket.OPEN) {
          cartSocket.send(
            JSON.stringify({
              type: "outPayment",
              itemId: parsedBookingInfo.cartItemId,
            })
          );
          console.log("Sent outPayment to cartSocket:", { itemId: parsedBookingInfo.cartItemId });
        }
      }


      clearPaymentTimeout(); 
      socket.close();
      if(parsedBookingInfo.cartItemId) {
        cartSocket.close();
      }
    };
  }, []);

  useFocusEffect(React.useCallback(() => {
    if (paymentStatus === true) {
      const timeout = setTimeout(() => {
        Alert.alert("Notification", "Payment successfully completed", [
          {
            text: "OK",
            onPress: () => {
              router.push("/booking"); // Điều hướng sau khi xác nhận
            },
          },
        ]);
      }, 2000);
      return () => clearTimeout(timeout); // Dọn dẹp timeout khi rời focus
    }
  }, [paymentStatus]))

  return (  
        <View style={styles.container}>
          <PaymentProvider timeLeft={timeLeft} setTimeLeft={setTimeLeft}>
            <PaymentHeader
              bookingId={parsedBookingInfo.bookingId}
              progressStep={progressStep}
              onBackPress={handleBackStep}
            />
          </PaymentProvider>    
          {progressStep === 0 ? (
            <PaymentSection1
              totalSlots={parsedBookingInfo.slotsBooked}
              totalMoney={parsedBookingInfo.totalPrice}
              onProgressNext={handleNextStep}
              handleChange={handleChange}
              customer={customer}
              setCustomer={setCustomer}
              setOrder={setOrder}
              order={order}
              bookingId={parsedBookingInfo.bookingId}
              validateForm={validateForm}
              errors={errors}
            />
          ) : (
            <PaymentSection2
              bookingInfo={parsedBookingInfo}
              bookingId={parsedBookingInfo.bookingId}
              order={order}
              paymentStatus={paymentStatus}
            />
          )}
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
});

export default PaymentDetail;
