import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Colors from "../../constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";

const AboutUsScreen = ({ navigation }) => {
  const teamMembers = [
    {
      id: '1',
      name: 'Nguyen Tran Tuan Minh',
      role: 'Leader',
      image: require('../../assets/images/userProfile.png'),
    },
    {
      id: '2',
      name: 'Pham Hai Dang',
      role: 'Team Member',
      image: require('../../assets/images/userProfile.png'),
    },
    {
      id: '3',
      name: 'Nguyen Van Hoai',
      role: 'Team Member',
      image: require('../../assets/images/userProfile.png'),
    },
    {
      id: '4',
      name: 'Pham Nam Khanh',
      role: 'Team Member',
      image: require('../../assets/images/userProfile.png'),
    },
    {
      id: '5',
      name: 'Nguyen Minh Truong',
      role: 'Team Member',
      image: require('../../assets/images/userProfile.png'),
    },
  ];

  const openWebsite = () => {
    Linking.openURL('https://travelnow.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Company Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo_login_mobile.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Company Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>TravelNow</Text>
          <Text style={styles.sectionText}>
          TravelNow was founded in 2025 with the mission to bring travelers to the most beautiful destinations in Viet Nam. We provide a seamless platform for booking tours with the most convenient user experience possible. In addition, with the support of AI technology, user experience is enhanced.
          </Text>
        </View>
        
        {/* Our Mission */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            We believe travel is the best way to expand horizons and connect people. Our mission is to create complete, safe, and memorable journeys for every customer.
          </Text>
        </View>
        
        {/* Our Team */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.sectionText}>
            The TravelNow team consists of passionate travelers and technology enthusiasts. 
            We are dedicated to providing the best service for our customers around the world.
          </Text>
          
          <View style={styles.teamContainer}>
            {teamMembers.map(member => (
              <View key={member.id} style={styles.teamMember}>
                <Image source={member.image} style={styles.teamMemberImage} />
                <Text style={styles.teamMemberName}>{member.name}</Text>
                <Text style={styles.teamMemberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Contact Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#4A80F0" />
            <Text style={styles.contactText}>123 Nguyen Van Cu Street, Can Tho, Viet Nam</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#4A80F0" />
            <Text style={styles.contactText}>info@travelnow.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#4A80F0" />
            <Text style={styles.contactText}>+84 912-213-212</Text>
          </View>
        </View>
        
        {/* Social Media */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-instagram" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-twitter" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-youtube" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Website Link */}
        <TouchableOpacity style={styles.websiteButton} onPress={openWebsite}>
          <Text style={styles.websiteButtonText}>Visit our website</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 TravelNow. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 80,
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A80F0',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  teamMember: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  teamMemberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  teamMemberRole: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  websiteButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});

export default AboutUsScreen;