import { View, Text, Image } from "react-native";
import Stars from "./Stars";

function Review({ review, userName, userAvatar }) {
  if (!review) return null;
  
  // Calculate average rating from review ratings
  const avgRating = (
    (parseFloat(review.rating.transport) + 
    parseFloat(review.rating.services) + 
    parseFloat(review.rating.priceQuality)) / 3
  ).toFixed(1);
  
  // Format date
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <View
      style={{
        paddingHorizontal: 22,
        paddingVertical: 20,
      }}
    >
      <Stars rating={Number(avgRating)} starSize={18} />
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <Image
          source={userAvatar ? { uri: userAvatar } : require("../../assets/images/userProfile.png")}
          resizeMode="contain"
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View>
          <Text>{userName || 'Anonymous'} - Vietnam</Text>
          <Text>{formattedDate}</Text>
        </View>
      </View>
      <Text>{review.feedback}</Text>
    </View>
  );
}

export default Review;