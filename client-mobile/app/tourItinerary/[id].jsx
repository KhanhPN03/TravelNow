import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import WebView from 'react-native-webview';
import Ionicons from "@expo/vector-icons/Ionicons";
import TourDetailFooter from "../../components/tourDetail/TourDetailFooter";

function TourItinerary() {
  const { tour } = useLocalSearchParams();
  const parsedTour = JSON.parse(tour);
  const router = useRouter();
  const webViewRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [webViewHeight, setWebViewHeight] = useState(400);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  // Get subsidiary tour data (assuming it's passed in the params or available through context)
  const subsidiaryTour = {
    start: parsedTour.cheapestSubTour?.experienceStart || parsedTour.subsidiaryTours?.[0]?.experienceStart,
    end: parsedTour.cheapestSubTour?.experienceEnd || parsedTour.subsidiaryTours?.[0]?.experienceEnd
  };

  // Get attractions from original tour
  const attractions = parsedTour.experienceJourney || [];

  // Define tour locations using actual data
  const tourLocations = {
    start: {
      name: subsidiaryTour.start?.name,
      coordinate: {
        latitude: subsidiaryTour.start?.lat,
        longitude: subsidiaryTour.start?.lon,
      },
      type: "start",
      locationActivities: subsidiaryTour.start?.locationActivities
    },
    end: {
      name: subsidiaryTour.end?.name,
      coordinate: {
        latitude: subsidiaryTour.end?.lat,
        longitude: subsidiaryTour.end?.lon,
      },
      type: "end",
      locationActivities: subsidiaryTour.end?.locationActivities
    },
    attractions: attractions.map(attraction => ({
      name: attraction.name,
      coordinate: {
        latitude: attraction.lat,
        longitude: attraction.lon,
      },
      type: "attraction",
      locationActivities: attraction.locationActivities
    }))
  };

  const initialRegion = {
    latitude: tourLocations.start.coordinate.latitude,
    longitude: tourLocations.start.coordinate.longitude,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case 'start':
      case 'end':
        return '#CA8223';
      case 'attraction':
        return '#377AAE';
      default:
        return '#000000';
    }
  };

  const allMarkers = [
    {
      ...tourLocations.start,
      lat: tourLocations.start.coordinate.latitude,
      lon: tourLocations.start.coordinate.longitude,
      description: tourLocations.start.locationActivities
    },
    ...tourLocations.attractions.map(attraction => ({
      ...attraction,
      lat: attraction.coordinate.latitude,
      lon: attraction.coordinate.longitude,
      description: attraction.locationActivities
    })),
    {
      ...tourLocations.end,
      lat: tourLocations.end.coordinate.latitude,
      lon: tourLocations.end.coordinate.longitude,
      description: tourLocations.end.locationActivities
    }
  ];

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript(`
      map.setView([${initialRegion.latitude}, ${initialRegion.longitude}], 14);
      true;
    `);
  };

  const handleFocusOnLocation = (latitude, longitude) => {
    webViewRef.current?.injectJavaScript(`
      map.setView([${latitude}, ${longitude}], 15);
      markers.forEach(marker => {
        if(Math.abs(marker.getLatLng().lat - ${latitude}) < 0.0001 && 
           Math.abs(marker.getLatLng().lng - ${longitude}) < 0.0001) {
          marker.openPopup();
        }
      });
      true;
    `);
  };

  const handleMapInteractionStart = () => {
    setScrollEnabled(false);
    setIsMapInteracting(true);
  };

  const handleMapInteractionEnd = () => {
    setTimeout(() => {
      if (isMapInteracting) {
        setScrollEnabled(true);
        setIsMapInteracting(false);
      }
    }, 200);
  };

  const mapHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; overscroll-behavior: none; touch-action: none; overflow: hidden; }
      #map { width: 100%; height: 100vh; touch-action: none; }
      .leaflet-container { touch-action: none; }
      .leaflet-popup-content-wrapper {
        padding: 2px; /* Reduced padding for the wrapper */
      }
      .leaflet-popup-content {
        text-align: center;
        min-width: 120px; /* Reduced min-width from 150px */
        margin: 4px 6px; /* Adjusted margin instead of padding, less spacious */
      }
      .popup-title {
        font-weight: bold;
        font-size: 14px;
        color: #1A2B49;
        margin-bottom: 2px; /* Added small margin instead of relying on padding */
      }
      .popup-description {
        font-size: 12px;
        color: #63687A;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const map = L.map('map', {
        dragging: true,
        tap: true,
        scrollWheelZoom: true,
        touchZoom: true
      }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      window.markers = [];

      function createColoredIcon(color) {
        return L.icon({
          iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + color + '.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      }

      const blueIcon = createColoredIcon('blue');
      const orangeIcon = createColoredIcon('orange');
      
      const markerData = ${JSON.stringify(allMarkers)};
      
      markerData.forEach(markerInfo => {
        const iconToUse = (markerInfo.type === 'start' || markerInfo.type === 'end') ? orangeIcon : blueIcon;
        
        const markerObj = L.marker([markerInfo.lat, markerInfo.lon], {
          icon: iconToUse,
          title: markerInfo.name
        }).addTo(map);
        
        markerObj.bindPopup(\`
          <div>
            <div class="popup-title">\${markerInfo.name}</div>
            <div class="popup-description">\${markerInfo.description || ''}</div>
          </div>
        \`);
        
        window.markers.push(markerObj);

        markerObj.on('click', function() {
          map.setView([markerInfo.lat, markerInfo.lon], 15);
        });
      });

      function sendTouchEvent(type) {
        window.ReactNativeWebView.postMessage(JSON.stringify({type}));
      }

      map.on('dragstart', () => sendTouchEvent('touchstart'));
      map.on('zoomstart', () => sendTouchEvent('touchstart'));
      map.on('touchstart', () => sendTouchEvent('touchstart'));
      map.on('mousedown', () => sendTouchEvent('touchstart'));
      map.on('dragend', () => sendTouchEvent('touchend'));
      map.on('zoomend', () => sendTouchEvent('touchend'));
      map.on('touchend', () => sendTouchEvent('touchend'));
      map.on('mouseup', () => sendTouchEvent('touchend'));

      document.getElementById('map').addEventListener('wheel', (e) => {
        e.stopPropagation();
      });
    </script>
  </body>
  </html>
`;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'touchstart') {
        handleMapInteractionStart();
      } else if (data.type === 'touchend') {
        handleMapInteractionEnd();
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={20} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Itinerary</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        nestedScrollEnabled={true}
        scrollEnabled={scrollEnabled}
      >
        <View style={[styles.mapWrapper, { height: webViewHeight }]}>
          <View style={styles.recenterButtonContainer}>
            <Pressable style={styles.recenterButton} onPress={handleRecenter}>
              <Text style={styles.recenterButtonText}>Re-center</Text>
            </Pressable>
          </View>
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: mapHTML }}
              style={styles.map}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              bounces={false}
              onMessage={handleWebViewMessage}
              containerStyle={{ flex: 1 }}
              androidLayerType="hardware"
            />
          </View>
        </View>

        <View style={styles.locationList}>
          <Pressable 
            style={styles.locationItem}
            onPress={() => handleFocusOnLocation(
              tourLocations.start.coordinate.latitude, 
              tourLocations.start.coordinate.longitude
            )}
          >
            <View style={[styles.locationDot, { backgroundColor: getMarkerColor('start') }]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Start: {tourLocations.start.name}</Text>
              <Text style={styles.locationDuration}>{tourLocations.start.locationActivities}</Text>
            </View>
          </Pressable>

          {tourLocations.attractions.map((location, index) => (
            <Pressable 
              key={index} 
              style={styles.locationItem}
              onPress={() => handleFocusOnLocation(
                location.coordinate.latitude, 
                location.coordinate.longitude
              )}
            >
              <View style={[styles.locationDot, { backgroundColor: getMarkerColor(location.type) }]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>{location.name}</Text>
                <Text style={styles.locationDuration}>{location.locationActivities}</Text>
              </View>
            </Pressable>
          ))}

          <Pressable 
            style={styles.locationItem}
            onPress={() => handleFocusOnLocation(
              tourLocations.end.coordinate.latitude, 
              tourLocations.end.coordinate.longitude
            )}
          >
            <View style={[styles.locationDot, { backgroundColor: getMarkerColor('end') }]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>End: {tourLocations.end.name}</Text>
              <Text style={styles.locationDuration}>{tourLocations.end.locationActivities}</Text>
            </View>
          </Pressable>
        </View>
        {/* <View style={{ height: 80 }} /> */}
      </ScrollView>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: "relative",
    paddingTop: 22,
    paddingBottom: 12,
    paddingHorizontal: 22,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  backButton: {
    zIndex: 100,
    backgroundColor: "white",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    position: "absolute",
    alignSelf: "center",
    top: 22,
    color: "#1A2B49",
    fontSize: 14,
    fontWeight: "700",
  },
  mapWrapper: {
    height: 400,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  recenterButtonContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  recenterButton: {
    backgroundColor: "#0071EB",
    padding: 9,
    paddingHorizontal: 24,
    borderRadius: 22,
  },
  recenterButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationDot: {
    width: 24,
    height: 24,
    borderRadius: 50,
    marginRight: 12,
    marginTop: 4,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B49',
  },
  locationDuration: {
    fontSize: 14,
    color: '#63687A',
    marginTop: 4,
  },
});

export default TourItinerary;