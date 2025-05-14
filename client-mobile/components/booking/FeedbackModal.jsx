import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import ModalWrapper from "../ModalWrapperNew";
import { AntDesign, Ionicons } from "@expo/vector-icons"; 
import { URL_ANDROID } from "@env";
import Colors from "../../constants/Colors";
import axios from "axios";

function FeedbackModal({ isModalVisible, setModalVisible, item, fetchReviews }) {
  const [ratings, setRatings] = useState({
    transport: 0,
    services: 0,
    priceQuality: 0,
  });
  const [feedbackContent, setFeedbackContent] = useState("");

  const handleRating = (item, starIndex) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [item]: starIndex + 1, // Lưu lại rating cho mỗi mục
    }));
  };

  const hasUserReviewed = () => {
    return Object.values(ratings).some(value => value > 0);
  };

  const handleSubmit = async () => {

    if (!hasUserReviewed()) {
      alert("Please rate at least one category before submitting!");
      return;
    }

    try {
        await axios.post(`${URL_ANDROID}/review-tour/create`, {      
            ticketId: item._id,
            originalTourId: item.bookingId.originalTourId._id,
            userId: item.bookingId.userId,
            rating: {...ratings},
            feedback: feedbackContent
        })
        fetchReviews(item.bookingId.userId);
        setModalVisible(false);  
        alert("Thanks for your feedback!");      
    } catch (error) {
        console.log(error.message);
    }
  }

  useEffect(() => {
    const userId = item.bookingId.userId;
    const originalTourId = item.bookingId.originalTourId._id;
   
    const fetchReviews = async () => {      
      try {
        const response = await axios.get(`${URL_ANDROID}/review-tour/get-review/${userId}/${originalTourId}`);

        const review = response.data.review;        
        setRatings(review.rating);
        setFeedbackContent(review.feedback);    
      } catch (error) {     
        if(error.response.status === 404) {
          console.log("not found review");
        }
        // console.error("Error fetching reviews:", error.response.data.message);
      }
    };
  
    if (userId) {
      fetchReviews();
    }
  }, [item._id])


  return (
    <View>
      {/* Feedback Modal */}
      <ModalWrapper
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        modalTitle="Review"
        renderFooter={
          <View style={{}}>
            <TouchableOpacity
            style={styles.comleptedsubmitButton}
            onPress={handleSubmit}
          >
            <Text
              style={{ color: Colors.white, fontSize: 16, fontWeight: "bold" }}
            >
              Submit
            </Text>
          </TouchableOpacity>
          </View>
        }
        children={
          <ScrollView style={[styles.comleptedcontent]}>
            <View style={{}}>
              <Text style={styles.comleptedlabel}>Rate your experience</Text>
              {/* Rating Section */}
              {["transport", "services", "priceQuality"].map((item, index) => {
                let title = "";
                switch (item) {
                    case "transport":
                        title = "Transport"
                        break;
                    case "services":
                        title = "Service"
                        break;
                    case "priceQuality":
                        title = "Price Quality"
                        break;
                    default:
                        break;
                }
                return (
                    <View key={index} style={styles.comleptedratingRow}>
                      <Text style={styles.comleptedratingLabel}>{title}</Text>
                      <View style={styles.comleptedstarsContainer}>
                        {[...Array(5)].map((_, starIndex) => (
                          <TouchableOpacity
                            key={starIndex}
                            onPress={() => handleRating(item, starIndex)} // Thêm sự kiện nhấn
                          >
                            <Ionicons
                              name="star"
                              color={
                                starIndex < ratings[item]
                                  ? "#FDCC0D"
                                  : "rgba(99, 104, 122, 1)"
                              }
                              style={styles.comleptedstar}
                            />              
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )
              })}
            </View>

            {/* Feedback Input */}
            <View style={{marginVertical: 20}}>
              <Text style={styles.comleptedlabelinput}>Leave a feedback</Text>
              <TextInput
                style={styles.comleptedfeedbackInput}
                placeholder="Write your feedback here"  
                multiline={true}    
                onChangeText={setFeedbackContent}
                value={feedbackContent}            
              />
            </View>
          </ScrollView>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  comleptedcontent: {
    paddingHorizontal: 37,
    paddingTop: 17,
    paddingBottom: 18,
    // borderWidth: 1,
    // borderColor: "red",
    justifySeft: "center",
  },
  test: {
    borderWidth: 1, 
    borderColor: "black"
  },
  comleptedlabel: {
    fontSize: 20,
    // fontWeight: "bold",
    marginBottom: 17,
    color: Colors.darkclue,
    fontFamily: "GT Easti Bold",
    // padding: 10

    borderWidth: 1,
    borderColor: "transparent",
    // height:22
  },
  comleptedlabelinput: {
    fontSize: 20,

    marginBottom: 17,
    color: Colors.darkclue,
    fontFamily: "GT Easti Bold",
  },
  comleptedratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  comleptedratingLabel: {
    flex: 1,
    fontSize: 18,
    color: Colors.darkclue,
    fontFamily: "GT Easti Regular",
    borderWidth: 1,
    borderColor: "transparent",
  },
  comleptedstarsContainer: {
    flexDirection: "row",
    paddingLeft: 20,
    position: "absolute",
    left: 95,
    top: -5,
  },
  comleptedstar: {
    // Half of 9px for both sides
    fontSize: 20,
    marginHorizontal: 5,
  },

  comleptedfeedbackInput: {
    // height: "100%",
    height: 250,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
    fontSize: 16
  },
  comleptedsubmitButton: {
    backgroundColor: Colors.orange,
    alignItems: "center",
    borderRadius: 5,
    width: 165.64,
    height: 38,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    marginVertical: 20,  
  },
});

export default FeedbackModal;
