import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/ContextProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

function TourDetailFooter({ tour }) {
  const [id, setId] = useState(null);  

  const router = useRouter();
  const handlePress = () => {
    if (id) {
      router.push({
        pathname: `/tourAvailability/${tour._id}`,
        params: { tour: JSON.stringify(tour) },
      });
    } else {
      router.navigate("logintab");
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);
        if(user) {
          setId(user._id);
        } else {
          setId(null);
        } 
      } catch (error) {
        console.log("error profile footer: ", error);
      }
    }
    getUser();
  }, [id]);

  return (
    <View style={styles.container}>
      <View>
        <Text style={{ fontSize: 12 }}>From</Text>
        <View style={{flexWrap: "wrap", flexDirection: "row", alignItems: "baseline", gap: 4 }}>
          <Text style={{ fontSize: 23, fontWeight: "700" }}>₫{tour.price}</Text>
          <Text style={{ fontSize: 12, fontWeight: "500" }}>per person</Text>
        </View>
      </View>

      <Pressable style={styles.btn} onPress={handlePress}>
        <Text style={styles.btnText}>Check availability</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "rgba(133, 137, 149, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  btn: {
    backgroundColor: "#0071EB",
    padding: 9,    
    // paddingHorizontal: 16,
    // paddingVertical: 9,
    alignSelf: "center",
    borderRadius: 22,
  },
  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default TourDetailFooter;
