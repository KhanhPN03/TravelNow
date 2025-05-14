import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import TourDetailFooter from "../../components/tourDetail/TourDetailFooter";
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Warning: TRenderEngineProvider: Support for defaultProps will be removed',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed',
  'Warning: TNodeChildrenRenderer: Support for defaultProps will be removed',
  'Warning: bound renderChildren: Support for defaultProps will be removed',
]);

function MoreDetail() {
  const { id, tour } = useLocalSearchParams();
  const parsedTour = JSON.parse(tour);
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Define HTML tag styles
  const tagsStyles = {
    // Basic text styles
    p: { color: '#1A2B49', fontSize: 14, fontWeight: '500', marginVertical: 8 },
    span: { color: '#1A2B49', fontSize: 14 },
    
    // Headings
    h1: { color: '#1A2B49', fontSize: 20, fontWeight: '700', marginVertical: 10 },
    h2: { color: '#1A2B49', fontSize: 18, fontWeight: '700', marginVertical: 8 },
    h3: { color: '#1A2B49', fontSize: 16, fontWeight: '600', marginVertical: 6 },
    h4: { color: '#1A2B49', fontSize: 15, fontWeight: '600', marginVertical: 4 },
    h5: { color: '#1A2B49', fontSize: 14, fontWeight: '600', marginVertical: 4 },
    h6: { color: '#1A2B49', fontSize: 13, fontWeight: '600', marginVertical: 4 },
    
    // Text formatting
    em: { fontStyle: 'italic' },
    i: { fontStyle: 'italic' },
    strong: { fontWeight: 'bold' },
    b: { fontWeight: 'bold' },
    u: { textDecorationLine: 'underline' },
    
    // Lists
    ul: { marginLeft: 20, marginVertical: 8 },
    ol: { marginLeft: 20, marginVertical: 8 },
    li: { color: '#1A2B49', fontSize: 14, marginBottom: 4 },
    
    // Tables
    table: { borderWidth: 1, borderColor: '#ddd', marginVertical: 10 },
    th: { backgroundColor: '#f2f2f2', padding: 8, fontWeight: 'bold' },
    td: { padding: 8, borderWidth: 1, borderColor: '#ddd' },
    
    // Links
    a: { color: '#0046C2', textDecorationLine: 'underline' },
    
    // Images
    img: { marginVertical: 8 },
    
    // Formatting tags
    blockquote: { borderLeftWidth: 3, borderLeftColor: '#ddd', paddingLeft: 10, marginVertical: 8, fontStyle: 'italic' },
    code: { fontFamily: 'monospace', backgroundColor: '#f1f1f1', padding: 2 },
    pre: { fontFamily: 'monospace', backgroundColor: '#f1f1f1', padding: 10, marginVertical: 8 },
    
    // Dividers
    hr: { backgroundColor: '#ddd', height: 1, marginVertical: 12 },
    
    // Container tags
    div: { marginVertical: 4 },
    section: { marginVertical: 8 },
    article: { marginVertical: 8 },
  };

  return (
    <>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back-outline" size={20} color="black" />
        </Pressable>

        <Text style={styles.headerTitle}>
          More details
        </Text>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* <Text style={styles.sectionTitle}>Full description</Text> */}
          
          <View style={styles.descriptionContainer}>
            <RenderHtml
              contentWidth={width - 44}
              source={{ html: parsedTour.description || '<p>No description available</p>' }}
              tagsStyles={tagsStyles}
              defaultTextProps={{
                selectable: true
              }}
              renderersProps={{
                a: {
                  onPress: (_, href) => {
                    Linking.openURL(href).catch(err => 
                      console.error("Couldn't open link", err)
                    );
                  }
                }
              }}
              systemFonts={[...defaultSystemFonts]}
              baseStyle={{ color: '#1A2B49', fontSize: 14 }}
              ignoredDomTags={['iframe', 'script']}
            />
          </View>
        </View>
      </ScrollView>
      
      
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    paddingTop: 22,
    paddingBottom: 12,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(133, 137, 149, 0.3)",
  },
  backButton: {
    zIndex: 100,
    backgroundColor: "white",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    alignSelf: "center",
    top: 22,
    color: "#1A2B49",
    fontSize: 14,
    fontWeight: "700",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 22,
  },
  sectionTitle: {
    color: "#1A2B49",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
});

export default MoreDetail;