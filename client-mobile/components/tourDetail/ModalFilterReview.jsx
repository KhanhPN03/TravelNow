import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Checkbox } from "react-native-paper";
import ModalWrapper from "../ModalWrapperNew";
import Colors from "../../constants/Colors";

function ModalFilterReview({ isModalVisible, setModalVisible, onApplyFilter }) {
  const [checked, setChecked] = useState({
    all: true,
    five: false,
    four: false,
    three: false,
    two: false,
    one: false
  });

  const handleReset = () => {
    setChecked({
      all: true,
      five: false,
      four: false,
      three: false,
      two: false,
      one: false
    });
    // Không gọi onApplyFilter ở đây để tránh đóng modal 
    // Chỉ cập nhật trạng thái hiển thị của các checkbox
  };

  const handleApplyFilter = () => {
    if (checked.all || !Object.values(checked).some(value => value)) {
      onApplyFilter({});
      setModalVisible(false);
      return;
    }

    const selectedRatings = [];
    if (checked.five) selectedRatings.push(5);
    if (checked.four) selectedRatings.push(4);
    if (checked.three) selectedRatings.push(3);
    if (checked.two) selectedRatings.push(2);
    if (checked.one) selectedRatings.push(1);

    onApplyFilter({
      ratings: selectedRatings
    });
    
    setModalVisible(false);
  };

  const handleCheckboxPress = (rating) => {
    if (rating === 'all') {
      setChecked({
        all: !checked.all,
        five: false,
        four: false,
        three: false,
        two: false,
        one: false
      });
    } else {
      setChecked({
        ...checked,
        all: false,
        [rating]: !checked[rating]
      });
    }
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Image 
          key={i}
          source={i < count ? require('../../assets/images/star-filled.png') : require('../../assets/images/star-empty.png')}
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <ModalWrapper
      isModalVisible={isModalVisible}
      setModalVisible={setModalVisible}
      modalTitle="Filter"
      renderFooter={
        <View style={styles.footer}>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>Reset all</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={handleApplyFilter}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>By star rating</Text>
        
        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={checked.all ? 'checked' : 'unchecked'}
              onPress={() => handleCheckboxPress('all')}
              color={Colors.blue}
            />
            <Text style={styles.checkboxLabel}>All star rating</Text>
          </View>

          {[5, 4, 3, 2, 1].map((num) => (
            <View key={num} style={styles.ratingRow}>
              <Checkbox
                status={checked[`${num === 5 ? 'five' : num === 4 ? 'four' : num === 3 ? 'three' : num === 2 ? 'two' : 'one'}`] ? 'checked' : 'unchecked'}
                onPress={() => handleCheckboxPress(num === 5 ? 'five' : num === 4 ? 'four' : num === 3 ? 'three' : num === 2 ? 'two' : 'one')}
                color={Colors.blue}
              />
              <Text style={styles.ratingText}>{num} star</Text>
              <View style={styles.starsContainer}>
                {renderStars(num)}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    margin: 22,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'GT Easti Medium',
    marginBottom: 15,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: -10,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: 'GT Easti Medium',
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: -10,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'GT Easti Medium',
    marginLeft: 8,
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#c4c4c4",
  },
  resetText: {
    color: Colors.blue,
    fontFamily: 'GT Easti Medium',
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: Colors.blue,
    borderRadius: 80,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  applyButtonText: {
    color: 'white',
    fontFamily: 'GT Easti Medium',
  },
});

export default ModalFilterReview;