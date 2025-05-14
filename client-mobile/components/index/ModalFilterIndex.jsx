import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Colors from "../../constants/Colors";
import ModalWrapper from "../ModalWrapperNew";

const FILTER_TYPES = {
  PRICE: 'price',
  PLACE: 'place',
  DURATION: 'duration'
};

const ModalFilterIndex = ({
  isVisible,
  onClose,
  type,
  onApply,
  onReset,
  initialValues = {},
  filterData,
  isFullScreen = false
}) => {
  const [filterValues, setFilterValues] = useState({
    price: {
      minPrice: initialValues.price?.minPrice || '',
      maxPrice: initialValues.price?.maxPrice || '',
      equalPrice: initialValues.price?.equalPrice || ''
    },
    place: initialValues.place || [],
    duration: initialValues.duration || []
  });

  // Update local state when initialValues changes (e.g., when filters are reset)
  useEffect(() => {
    setFilterValues({
      price: {
        minPrice: initialValues.price?.minPrice || '',
        maxPrice: initialValues.price?.maxPrice || '',
        equalPrice: initialValues.price?.equalPrice || ''
      },
      place: initialValues.place || [],
      duration: initialValues.duration || []
    });
  }, [initialValues]);

  const handleApply = () => {
    if (type) {
      const value = type === FILTER_TYPES.PRICE ? 
        filterValues.price : 
        filterValues[type];
      onApply(value, type);
    } else {
      onApply(filterValues);
    }
    onClose();
  };

  const handleReset = () => {
    setFilterValues({
      price: { minPrice: '', maxPrice: '', equalPrice: '' },
      place: [],
      duration: []
    });
    onReset();
  };

  const togglePlaceSelection = (placeObj) => {
    setFilterValues(prev => {
      // Check if this place is already selected
      const isSelected = prev.place.some(item => 
        (typeof item === 'object' && item.code === placeObj.code) || item === placeObj.code
      );
      
      if (isSelected) {
        // Remove the place
        return {
          ...prev,
          place: prev.place.filter(item => 
            (typeof item === 'object' ? item.code !== placeObj.code : item !== placeObj.code)
          )
        };
      } else {
        // Add the place
        return {
          ...prev,
          place: [...prev.place, placeObj]
        };
      }
    });
  };

  const toggleDurationSelection = (duration) => {
    setFilterValues(prev => ({
      ...prev,
      duration: prev.duration.includes(duration)
        ? prev.duration.filter(i => i !== duration)
        : [...prev.duration, duration]
    }));
  };

  const renderPriceFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Price</Text>
      
      {/* Min-Max Price Range */}
      <View style={styles.priceInputContainer}>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.labelText}>From</Text>
          <View style={styles.priceInput}>
            <Text style={styles.currencySymbol}>₫</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Min Price"
              value={filterValues.price.minPrice}
              onChangeText={(value) => 
                setFilterValues(prev => ({
                  ...prev,
                  price: { ...prev.price, minPrice: value }
                }))
              }
            />
          </View>
        </View>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.labelText}>To</Text>
          <View style={styles.priceInput}>
            <Text style={styles.currencySymbol}>₫</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Max Price"
              value={filterValues.price.maxPrice}
              onChangeText={(value) =>
                setFilterValues(prev => ({
                  ...prev,
                  price: { ...prev.price, maxPrice: value }
                }))
              }
            />
          </View>
        </View>
      </View>
      <Text style={styles.equalText}>Equal</Text>

      {/* Equal Price Input */}
      <View style={[styles.priceInput, styles.equalInput]}>
        <Text style={styles.currencySymbol}>₫</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Equal Price"
          value={filterValues.price.equalPrice}
          onChangeText={(value) => 
            setFilterValues(prev => ({
              ...prev,
              price: { ...prev.price, equalPrice: value }
            }))
          }
        />
      </View>
    </View>
  );

  const renderPlaceFilter = () => {
    const places = filterData.place || [];
    
    // Check if a place is selected by comparing codes
    const isPlaceSelected = (placeObj) => {
      return filterValues.place.some(selectedPlace => {
        if (typeof selectedPlace === 'object') {
          return selectedPlace.code === placeObj.code;
        }
        return selectedPlace === placeObj.code;
      });
    };
    
    return (
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Place</Text>
        <View style={styles.selectionContainer}>
          {places.map((placeObj, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => togglePlaceSelection(placeObj)}
            >
              <View style={[
                styles.selectionItem,
                isPlaceSelected(placeObj) && styles.selectedItem
              ]}>
                <Text style={[
                  styles.selectionText,
                  isPlaceSelected(placeObj) && styles.selectedText
                ]}>
                  {placeObj.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDurationFilter = () => {
    const durations = filterData.duration || [];
    
    return (
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.selectionContainer}>
          {durations.map((duration, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleDurationSelection(duration)}
            >
              <View style={[
                styles.selectionItem,
                filterValues.duration.includes(duration) && styles.selectedItem
              ]}>
                <Text style={[
                  styles.selectionText,
                  filterValues.duration.includes(duration) && styles.selectedText
                ]}>
                  {duration} Days
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ModalWrapper
      isModalVisible={isVisible}
      setModalVisible={onClose}
      modalTitle={type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Filter'}
      renderFooter={
        <View style={styles.footer}>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>Reset all</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Show results</Text>
          </Pressable>
        </View>
      }
    >
      <ScrollView style={styles.content}>
        {(!type || type === FILTER_TYPES.PRICE) && renderPriceFilter()}
        {(!type || type === FILTER_TYPES.PLACE) && renderPlaceFilter()}
        {(!type || type === FILTER_TYPES.DURATION) && renderDurationFilter()}
        <View style={{ height: 30 }} />
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#c4c4c4',
  },
  closeIcon: {
    position: 'absolute',
    left: 22,
    color: Colors.blue,
  },
  title: {
    fontSize: 20,
    fontFamily: 'GT Easti Medium',
  },
  content: {
    padding: 25,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'GT Easti Medium',
    marginBottom: 20,
    color: Colors.blackColorText,
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priceInputWrapper: {
    flex: 1,
  },
  equalInput: {
    width: '48%',
  },
  labelText: {
    color: Colors.blackColorText,
    marginBottom: 5,
    fontFamily: 'GT Easti Medium',
    fontSize: 16,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    borderColor: '#DCDFE4',
  },
  currencySymbol: {
    fontSize: 16,
    color: Colors.grey,
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Roboto Regular',
  },
  equalText: {
    textAlign: 'Left',
    color: Colors.blackColorText,
    marginVertical: 10,
    fontFamily: 'GT Easti Medium',
    fontSize: 16,
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectionItem: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    borderColor: '#DCDFE4',
  },
  selectedItem: {
    backgroundColor: Colors.blue,
  },
  selectionText: {
    fontSize: 16,
    color: Colors.grey,
  },
  selectedText: {
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#c4c4c4',
    gap: 14,
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
  applyText: {
    color: Colors.white,
    fontFamily: 'GT Easti Medium',
  },
});

export default ModalFilterIndex;