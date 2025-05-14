import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import Colors from '../../constants/Colors';
import ModalWrapper from '../ModalWrapperNew';

function ModalDate({ 
  isOpen, 
  setIsOpen, 
  handleShowResult, 
  setStartDate, 
  setEndDate, 
  startDate, // Nhận startDate từ Discover
  endDate    // Nhận endDate từ Discover
}) {
  const minDate = new Date();
  let tempStartDate = startDate; // Biến tạm để lưu trữ startDate khi chọn

  const handleDateChange = (date, type) => {
    if (type === "END_DATE") {
      if (date != null && date !== tempStartDate) {
        setEndDate(date);
      } else {
        setEndDate(null);
      }
    } else {
      setStartDate(date);
      tempStartDate = date; // Cập nhật biến tạm
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    tempStartDate = null; // Đặt lại biến tạm
  };

  return (
    <ModalWrapper
      isModalVisible={isOpen}
      setModalVisible={setIsOpen}
      modalTitle="Calendar"
      renderFooter={
        <View style={styles.footer}>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>Reset all</Text>
          </Pressable>
          <Pressable
            onPress={handleShowResult}
            style={styles.showResultsButton}
          >
            <Text style={styles.showResultsText}>
              Show results
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.calendarContainer}>
        <CalendarPicker
          startFromMonday={true}
          allowRangeSelection={true}
          allowBackwardRangeSelect={true}
          minDate={minDate}
          todayBackgroundColor="transparent"
          todayTextStyle={styles.todayText}
          selectedDayColor="#000000"
          selectedDayTextColor="#FFFFFF"
          onDateChange={handleDateChange}
          selectedStartDate={startDate} // Hiển thị ngày bắt đầu đã chọn
          selectedEndDate={endDate}     // Hiển thị ngày kết thúc đã chọn
        />
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    padding: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#c4c4c4',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 14,
  },
  showResultsButton: {
    backgroundColor: Colors.blue,
    borderRadius: 80,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  showResultsText: {
    color: Colors.white,
    fontFamily: 'GT Easti Medium',
  },
  todayText: {
    color: Colors.orange,
  },
  resetText: {
    color: Colors.blue,
    fontFamily: 'GT Easti Medium',
    fontSize: 14,
    paddingTop: 14,
  },
});

export default ModalDate;