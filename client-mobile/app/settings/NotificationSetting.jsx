import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PushNotificationService from '../../config/PushNotificationService';

const NotificationSetting = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const navigation = useNavigation(); // Lấy đối tượng navigation
  
  useEffect(() => {
    const loadNotificationSetting = async () => {
      const savedState = await AsyncStorage.getItem('notificationEnabled');
      const initialState = savedState !== null ? JSON.parse(savedState) : true;
      setIsEnabled(initialState);
    };
    loadNotificationSetting();
  }, []);

  // Xử lý khi switch thay đổi
  const toggleSwitch = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    await PushNotificationService.toggleNotifications(newState);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      {/* Notification Item */}
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Turn On Notifications</Text>
          <Text style={styles.description}>Get personalized updates</Text>
        </View>
        <Switch
          trackColor={{ false: '#d3d3d3', true: '#4CAF50' }}
          thumbColor={isEnabled ? '#d3d3d3' : '#fff'}
          ios_backgroundColor="#d3d3d3"
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 18,
    color: '#333',    
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});

export default NotificationSetting;
