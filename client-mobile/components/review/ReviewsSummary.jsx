import { View, Text, Pressable, StyleSheet } from "react-native";
import FeedbackSummaryCategory from "./ReviewsSummaryCategory";
import Stars from "./Stars";

function ReviewsSummary({ reviewsCount, reviewsCategories }) {
  // Calculate overall average from all categories
  const overallAverage = reviewsCategories.length > 0 
    ? (reviewsCategories.reduce((sum, category) => sum + Number(category.avg), 0) / reviewsCategories.length).toFixed(1)
    : 0;

  return (
    <Pressable style={styles.feedbackPressableArea}>
      <Text style={styles.title}>Customer reviews</Text>
      <View style={styles.avgPointContainer}>
        <Stars starSize={32} avg={overallAverage} />
        <Text style={styles.clrGrey}>
          {reviewsCount} reviews from verified customers
        </Text>
      </View>

      {/* Only show first 3 categories */}
      {reviewsCategories.slice(0, 3).map((category, index) => (
        <FeedbackSummaryCategory
          key={index}
          category={category.name}
          avg={Number(category.avg).toFixed(1)} // Ensure number is rounded to 1 decimal place
        />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clrGrey: {
    color: "#63687A",
  },
  title: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
  },
  feedbackPressableArea: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
  },
  avgPointContainer: {
    alignItems: "center",
    gap: 4,
    marginTop: 32,
    marginBottom: 27,
  },
});

export default ReviewsSummary;