import { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import city from "../../public/city.json";
import axios from "axios";

import Colors from "../../constants/Colors";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import ModalWrapper from "../../components/ModalWrapperNew";
import { toggleAnimation } from "../../animations/toggleAnimation";
import ModalParticipants from "../../components/tourAvailability/ModalParticipantsAvailability";
import { URL_ANDROID } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WrapperItem = ({
  content,
  setDate,
  date,
  price,
  setPrice,
  subTour,
  setSubTour,
  maxSlot,
  setMaxSlot,
}) => { 
  console.log("content: ", content);
  console.log("date: ", date);
  
  return (
    <Pressable
      style={{
        borderWidth: 2,
        alignItems: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        padding: 8,
        borderColor: "#DCDFE4",
        backgroundColor: date === content ? Colors.blue : Colors.white,
        borderColor: date === content ? Colors.blue : "#DCDFE4",
      }}
      onPress={() => {
        setDate(content);
        setPrice(price);
        setSubTour(subTour);
        setMaxSlot(maxSlot);
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Roboto Regular",
            color: date === content ? Colors.white : Colors.black,
          }}
        >
          {content}
        </Text>
      </View>
    </Pressable>
  );
};
function TourAvailability() {
  const router = useRouter();
  const [id, setId] = useState(null);
  // Nhận data tour được truyền qua params
  const { tour } = useLocalSearchParams();
  const parsedTour = JSON.parse(tour);
  const {
    originalTourId,
    title,
    duration,
    place,
    price,
    cheapestSubTour,
    subsidiaryTours,
    thumbnail,
    totalReviews,
    averageRating,
  } = parsedTour;
  const convertPlace = city.filter((item) => place.includes(item.code))
    .map((item) => item.name)
    .join(", ");                          
  
  // -------------------------------------
  // Set up Animation cho card body
  const [showContent, setShowContent] = useState(false);
  const animationController = useRef(new Animated.Value(0)).current;
  // -------------------------------------

  // Modal lựa chọn số slot
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalDate, setModalDate] = useState(false);
  const [slot, setSlot] = useState(1);
  const [date, setDate] = useState(cheapestSubTour.dateStart.date);
  const [priceAvailability, setPriceAvailability] = useState(price);
  const [subTour, setSubTour] = useState(cheapestSubTour);
  const [maxSlot, setMaxSlot] = useState(cheapestSubTour.availableSlots);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  // -------------------------------------

  // Function toggle animation cho card
  const toggleItem = () => {
    const config = {
      duration: 100,
      toValue: showContent ? 0 : 1,
      useNativeDriver: false,
    };
    LayoutAnimation.configureNext(toggleAnimation);
    Animated.timing(animationController, config).start();
    setShowContent(!showContent);
  };

  // CSS set up cho arrow icon
  const arrowAnimation = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // CSS set up cho card body
  const borderAnimation = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(133, 137, 149, 0.3)", "#0071EB"],
  });

  const addToCart = async () => {
    try {
      const response = await axios.post(`${URL_ANDROID}/cart/add`, {
        originalTourId: parsedTour.originalTourId, // ID của tour
        userId: id, // ID của user (bạn cần lấy từ phiên người dùng hoặc props)
        subTourId: subTour?._id,
        slotsBooked: slot, // Số lượng slot người dùng chọn
      });

      // Nếu thành công, hiển thị thông báo hoặc xử lý giao diện
      if (response.status === 200) {
        router.navigate("./cart");
      }
    } catch (error) {
      console.log("Error adding to cart:", error.message);
      Alert.alert("Error", "There was an issue adding the tour to your cart.");
    }
  };
  const handleBooknow = async () => {
    try {
      const response = await axios.post(`${URL_ANDROID}/booking/create`, {
        orderCode: Date.now(),
        userId: id,
        originalTourId,
        subTourId: subTour._id,
        bookedSlot: slot,
        totalPrice: priceAvailability * slot,
      });

      const newBookingId = response.data.booking._id; // Lấy bookingId ngay lập tức

      router.push({
        pathname: `/payment/${parsedTour?._id}`,
        params: {
          bookingInfo: JSON.stringify({
            originalTourId,
            subTour: subTour,
            userId: id,
            bookingId: newBookingId,
            slotsBooked: slot,
            totalPrice: slot * price,
            title,
            thumbnail,
            totalReviews,
            averageRating,
          }),
        },
      });
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);
        if (user) {
          setId(user._id);
        } else {
          setId(null);
        }
      } catch (error) {
        console.log("error profile: ", error);
      }
    };

    getUser();
  });

  return (
    <>
      <View
        style={{
          position: "relative",
          paddingTop: 22,
          paddingBottom: 12,
          paddingHorizontal: 22,
        }}
      >
        <Pressable
          style={{
            zIndex: 100,
            backgroundColor: "white",
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back-outline" size={20} color="black" />
        </Pressable>

        <Text
          style={{
            position: "absolute",
            alignSelf: "center",
            top: 22,
            color: "#1A2B49",
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          Availability
        </Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.selectSectionContainer}>
          <Text style={[styles.fwBd, styles.selectSectionTitle]}>Select</Text>
          <View style={styles.selectSection}>
            <Pressable
              onPress={() => setModalDate(!isModalDate)}
              style={styles.selectSectionItemContainer}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Feather name="calendar" size={16} color="black" />
                <Text style={{ fontSize: 14, fontFamily: "GT Easti Regular" }}>
                  Date
                </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
                <Text style={[styles.fwRg, styles.selectSectionItemText]}>
                  {subTour.dateStart.date.split("T")[0]}
                </Text>
                <Entypo name="chevron-right" size={15} color="#1A2B49" />
              </View>
            </Pressable>
            <Pressable
              style={[
                styles.selectSectionItemContainer,
                styles.selectSection2ndItemContainer,
              ]}
              onPress={() => toggleModal()}
            >
              <Ionicons name="people" size={15} color="black" />

              <View style={styles.selectSectionItemTextContainer}>
                <Text style={[styles.fwRg, styles.selectSectionItemText]}>
                  Participants
                </Text>
                <View style={styles.participant}>
                  <Text style={[styles.fwRg, styles.selectSectionItemText]}>
                    Adult x {slot}
                  </Text>
                  <Entypo name="chevron-right" size={15} color="#1A2B49" />
                </View>
              </View>
            </Pressable>
            <View style={styles.selectSectionItemContainer}>
              <Entypo name="language" size={15} color="black" />
              <View style={styles.selectSectionItemTextContainer}>
                <Text style={[styles.fwRg, styles.selectSectionItemText]}>
                  Language
                </Text>
                <Text style={[styles.fwRg, styles.selectSectionItemText]}>
                  English
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View>
          <Text style={[styles.fwBd, styles.selectSectionTitle]}>
            Available option
          </Text>
          <Animated.View
            style={{
              borderColor: borderAnimation,
              borderWidth: 1.5,
              borderRadius: 12,
            }}
          >
            <View style={styles.optionSection}>
              <Pressable onPress={() => toggleItem()}>
                <View style={styles.optionCardContainer}>
                  <View style={styles.optionCardHeaderTitleContainer}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.fwMe, styles.optionCardHeaderTitle]}
                    >
                      {title}
                    </Text>
                    <Animated.View
                      style={{ transform: [{ rotateZ: arrowAnimation }] }}
                    >
                      <Entypo name="chevron-down" size={15} color="#0071EB" />
                    </Animated.View>
                  </View>
                  <View style={styles.optionCardHeaderInfoContainer}>
                    <View style={styles.optionCardHeaderInfo}>
                      <AntDesign name="clockcircle" size={13} color="black" />
                      <Text style={[styles.fwRg]}>{duration} Days</Text>
                    </View>
                    <View style={styles.optionCardHeaderInfo}>
                      <Entypo name="language" size={15} color="black" />
                      <Text
                        style={[styles.fwRg, styles.optionCardHeaderInfoText]}
                      >
                        {/* {parsedTour.guideLanguage} */}
                        English
                      </Text>
                    </View>
                    <View style={[styles.optionCardHeaderInfo]}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="#0071EB"
                      />
                      <Text
                        style={[
                          styles.fwRg,
                          styles.optionCardHeaderInfoText,
                          { color: "#0071EB", fontSize: 14 },
                        ]}
                      >
                        {convertPlace}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>

              {showContent && (
                <View style={styles.supportInfoSection}>
                  <View style={styles.supportInfoPriceContainer}>
                    <Text style={[styles.fwRg, styles.supportInfoPrice]}>
                      {slot} Participant(s) x {priceAvailability}
                    </Text>
                  </View>
                  <View style={styles.supportInfoContainer}>
                    <View style={styles.supportInfo}>
                      <Feather name="calendar" size={14} color="black" />
                      <Text style={[styles.fwRg, styles.supportInfoText]}>
                        Free cancellation
                      </Text>
                    </View>
                    <View style={styles.supportInfo}>
                      <Entypo name="wallet" size={14} color="black" />
                      <Text style={[styles.fwRg, styles.supportInfoText]}>
                        Book now, pay later
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.optionCardFooter}>
                <View>
                  <Text style={[styles.fwRg, styles.optionCardFooterText]}>
                    Total price
                  </Text>
                  <Text style={[styles.fwMe, styles.optionCardFooterPrice]}>
                    ₫{priceAvailability * slot}
                  </Text>
                  <Text style={[styles.fwRg, styles.optionCardFooterText]}>
                    All taxes and fees included
                  </Text>
                </View>
                {showContent && (
                  <View style={styles.btnsContainer}>
                    <Pressable onPress={handleBooknow}>
                      <View style={[styles.btn, styles.bookNowBtn]}>
                        <Text style={[styles.fwMe, styles.bookNowBtnText]}>
                          Book now
                        </Text>
                      </View>
                    </Pressable>

                    <Link
                      href={{
                        pathname: `/cart`,
                      }}
                      asChild
                      style={[styles.btn, styles.addToCartBtn]}
                    >
                      <Pressable onPress={() => addToCart()}>
                        <Text style={[styles.fwMe, styles.addToCartBtnText]}>
                          Add to cart
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      <ModalWrapper
        modalTitle="Date Availability"
        isModalVisible={isModalDate}
        setModalVisible={setModalDate}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              marginTop: 32,
              flexDirection: "row",
              paddingHorizontal: 24,
              flexWrap: "wrap",
              gap: 16,
              alignItems: "start",
              justifyContent: "start",
              paddingBottom: 100,
            }}
          >
            {subsidiaryTours.map((subTour, index) => {
              return (
                <WrapperItem
                  key={index}
                  content={subTour.dateStart.date.split("T")[0]}
                  setDate={setDate}
                  date={date}
                  price={subTour.price}
                  setPrice={setPriceAvailability}
                  subTour={subTour}
                  setSubTour={setSubTour}
                  maxSlot={subTour.totalSlots}
                  setMaxSlot={setMaxSlot}
                />
              );
            })}
          </View>
        </ScrollView>
      </ModalWrapper>
      <ModalParticipants
        title="modal"
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        slot={slot}
        setSlot={setSlot}
        maxSlot={maxSlot}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fwRg: {
    fontFamily: "GT Easti Regular",
  },
  fwMe: {
    fontFamily: "GT Easti Medium",
  },
  fwBd: {
    fontFamily: "GT Easti Bold",
  },

  container: {
    paddingHorizontal: 22,
  },
  selectSectionContainer: {
    paddingVertical: 12,
  },
  selectSectionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    justifyContent: "space-between",
  },
  selectSectionItemTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectSection: {
    borderWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
    borderRadius: 12,
    overflow: "hidden",
  },
  selectSectionTitle: {
    color: Colors.blackColorText,
    fontSize: 16,
    marginBottom: 12,
  },
  selectSectionItemText: {
    fontSize: 15,
  },
  participant: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectSection2ndItemContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
  },
  optionSection: {
    borderWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
    borderRadius: 12,
    paddingTop: 12,
    overflow: "hidden",
  },
  optionCardHeaderTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  optionCardHeaderTitle: {
    color: Colors.blackColorText,
    fontSize: 17,
    width: 300,
  },
  optionCardHeaderInfoContainer: {
    flexDirection: "column",
    gap: 8,
  },
  optionCardHeaderInfo: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  optionCardHeaderInfoText: {
    color: Colors.blackColorText,
  },
  optionCardContainer: {
    marginBottom: 9,
    paddingHorizontal: 10,
  },
  optionCardFooter: {
    backgroundColor: "rgba(133, 137, 149, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 12,
    //
    zIndex: 100,
    overflow: "hidden",
  },
  optionCardFooterText: {
    fontSize: 12,
    color: "#858995",
  },
  optionCardFooterPrice: {
    fontSize: 18,
    color: Colors.blackColorText,
    marginVertical: 6,
  },
  btn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  bookNowBtn: {
    borderWidth: 2,
    borderColor: "#0071EB",
    borderRadius: 26,
    marginBottom: 4,
  },
  bookNowBtnText: {
    fontSize: 15,
    color: "#0071EB",
  },
  addToCartBtn: {
    backgroundColor: "#0071EB",
    borderRadius: 26,
  },
  addToCartBtnText: {
    fontSize: 15,
    color: "#fff",
  },
  btnsContainer: {
    marginTop: 12,
    rowGap: 4,
  },
  supportInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  supportInfoText: {
    fontSize: 14,
    color: Colors.blackColorText,
  },
  supportInfoSection: {
    paddingHorizontal: 10,
  },
  supportInfoPriceContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
  },
  supportInfoPrice: {
    fontSize: 14,
    color: "rgb(133, 137, 149)",
  },
  supportInfoContainer: {
    paddingVertical: 10,
    flexDirection: "column",
    gap: 6,
  },
});

export default TourAvailability;
