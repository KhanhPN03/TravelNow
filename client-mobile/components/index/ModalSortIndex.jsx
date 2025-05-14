import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import ModalWrapper from "../ModalWrapperNew";
import Colors from "../../constants/Colors";

const ModalSortIndex = ({ isVisible, onClose, onSort, initialValue = 'default' }) => {
  const [selectedOption, setSelectedOption] = useState(initialValue);

  const options = [
    { label: 'Default', value: 'default' },
    { label: 'Price: Low to High', value: 'low to high' },
    { label: 'Price: High to Low', value: 'high to low' },
  ];

  const handleApply = () => {
    onSort(selectedOption);
    onClose();
  };

  return (
    <ModalWrapper
      isModalVisible={isVisible}
      setModalVisible={onClose}
      modalTitle="Sort By"
      renderFooter={
        <View style={styles.footer}>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.content}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={styles.optionContainer}
            onPress={() => setSelectedOption(option.value)}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioOuter}>
                {selectedOption === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    flex: 1, // Add this to make content take available space
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
    backgroundColor: 'white', // Add background color
    marginTop: 'auto', // Push footer to bottom
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

export default ModalSortIndex;