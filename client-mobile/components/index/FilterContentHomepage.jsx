import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Colors from '../../constants/Colors';

const FilterContentHomepage = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  placeOptions,
  onPlaceChange,
  durationOptions,
  onDurationChange,
  type,
}) => {
  return (
    <View style={styles.container}>
      {/* Price Filter */}
      {(type === 'price' || type === 'combined') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.priceInputContainer}>
            <PriceInput
              title="Min. Price"
              value={minPrice}
              onChange={onMinPriceChange}
            />
            <PriceInput
              title="Max. Price"
              value={maxPrice}
              onChange={onMaxPriceChange}
            />
          </View>
        </View>
      )}

      {/* Place Filter */}
      {(type === 'place' || type === 'combined') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destination</Text>
          <CheckboxList
            options={placeOptions}
            onCheckboxChange={onPlaceChange}
          />
        </View>
      )}

      {/* Duration Filter */}
      {(type === 'duration' || type === 'combined') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <CheckboxList
            options={durationOptions}
            onCheckboxChange={onDurationChange}
          />
        </View>
      )}
    </View>
  );
};

// Price Input Component
const PriceInput = ({ title, value, onChange }) => (
  <View style={styles.priceInputWrapper}>
    <Text style={styles.priceLabel}>{title}</Text>
    <View style={styles.priceInput}>
      <Text style={styles.currencySymbol}>₫</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="0"
        value={value}
        onChangeText={onChange}
      />
    </View>
  </View>
);

// Checkbox List Component
const CheckboxList = ({ options, onCheckboxChange }) => (
  <View style={styles.checkboxList}>
    {options.map((option) => (
      <TouchableOpacity
        key={option.id}
        style={styles.checkboxItem}
        onPress={() => onCheckboxChange(option.id)}
      >
        <View style={[styles.checkbox, option.checked && styles.checkedBox]}>
          {option.checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{option.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'GT Easti Medium',
    color: Colors.darkBlue,
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'GT Easti Regular',
    color: Colors.darkBlue,
    marginBottom: 8,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 8,
    padding: 8,
  },
  currencySymbol: {
    fontSize: 16,
    color: Colors.grey,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GT Easti Regular',
  },
  checkboxList: {
    marginBottom: 20,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkedBox: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: 'GT Easti Regular',
    color: Colors.darkBlue,
  },
});

export default FilterContentHomepage;