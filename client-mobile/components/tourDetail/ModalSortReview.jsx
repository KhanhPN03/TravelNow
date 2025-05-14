import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import ModalWrapper from "../ModalWrapperNew";
import Colors from "../../constants/Colors";

function ModalSortReview({ isModalVisible, setModalVisible, nameType, handleSort, currentSelection }) {
  // Sử dụng state nội bộ để theo dõi lựa chọn hiện tại trong modal
  const [localSelection, setLocalSelection] = useState(currentSelection);
  
  // Cập nhật localSelection khi currentSelection thay đổi hoặc modal mở lại
  useEffect(() => {
    if (isModalVisible) {
      setLocalSelection(currentSelection);
    }
  }, [currentSelection, isModalVisible]);

  // Chỉ cập nhật lựa chọn nội bộ, không gọi handleSort ngay lập tức
  const handleSelect = (selectedOption) => {
    setLocalSelection(selectedOption);
  };

  // Chỉ áp dụng sắp xếp và đóng modal khi nhấn nút Apply
  const handleApply = () => {
    handleSort(localSelection);
    setModalVisible(false);
  };

  return (
    <ModalWrapper
      isModalVisible={isModalVisible}
      setModalVisible={setModalVisible}
      modalTitle={nameType.title}
      renderFooter={
        <View style={styles.footer}>
          <Pressable 
            style={styles.applyButton} 
            onPress={handleApply}
          >
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.content}>
        {nameType.data.map((option, index) => (
          <Pressable
            key={index}
            style={styles.optionContainer}
            onPress={() => handleSelect(option)}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioOuter}>
                {localSelection === option && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionLabel}>{option}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    flex: 1,
  },
  optionContainer: {
    paddingVertical: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.blue,
  },
  optionLabel: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'GT Easti Medium',
    color: Colors.blackColorText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#c4c4c4',
    backgroundColor: 'white',
    marginTop: 'auto',
  },
  applyButton: {
    backgroundColor: Colors.blue,
    borderRadius: 80,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  applyText: {
    color: Colors.white,
    fontFamily: 'GT Easti Medium',
  },
});

export default ModalSortReview;