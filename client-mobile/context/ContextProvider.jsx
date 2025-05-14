import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import PushNotificationService from "../config/PushNotificationService";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({});
  const router = useRouter();

  const setUserAsyncStorage = async (newUser) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.log("set user failed", error);
    }
  };

  const setTokenAsyncStorage = async (token) => {
    try {
      await AsyncStorage.setItem("token", JSON.stringify(token));
    } catch (error) {
      console.log("set token failed", error);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut(); // Đảm bảo đăng xuất hoàn tất
      await AsyncStorage.clear();
      router.navigate("/");
      console.log("log out successfully");
    } catch (error) {
      console.log("log out failed: ", error);
      alert("Log out failed");
    }
  };

  const alert = (title, message, callback) => {
    Alert.alert(title, message, [
      {
        text: "OK",
        onPress: callback,
      },
    ]);
  };
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
      webClientId:
        "623094712105-ni9jjgqr55mjqt7rurt66h06p67crglh.apps.googleusercontent.com", // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
    });
    
    PushNotificationService.configure();

    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          "GT Easti Bold": require("../assets/fonts/GT-Eesti-Display-Bold-Trial.otf"),
          "GT Easti Medium": require("../assets/fonts/GT-Eesti-Display-Medium-Trial.otf"),
          "GT Easti Regular": require("../assets/fonts/GT-Eesti-Display-Regular-Trial.otf"),
          "Roboto Regular": require("../assets/fonts/Roboto-Regular.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log("Error loading fonts:", error);
      }
    };

    loadFonts(); // Call the async function
    return () => {
      console.log("ContextProvider unmounting, cleaning up PushNotificationService");
      PushNotificationService.cleanup();
    };
    // getUserAsyncStorage();
  }, []);

  return (
    <Context.Provider
      value={{
        fontsLoaded,
        setUserAsyncStorage,
        setTokenAsyncStorage,
        logout,
        alert,
        bookingInfo,
        setBookingInfo,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
