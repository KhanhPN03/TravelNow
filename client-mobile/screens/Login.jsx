import { Link } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ToastAndroid,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import Colors from "../constants/Colors";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { URL_ANDROID } from "@env";
import { Context } from "../context/ContextProvider";
import { useRouter } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

function Login() {
  const { setUserAsyncStorage, setTokenAsyncStorage } = useContext(Context);
  const router = useRouter();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const [hidePassword, setHidePassword] = useState(true);
  const [iconEye, setIconEye] = useState("eye-with-line");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputValue.email || !emailRegex.test(inputValue.email)) {
      formErrors.email = "A valid email is required";
    }
    if (!inputValue.password) formErrors.password = "Password is required";

    setErrors(formErrors);
    // return một mảng chứa tất cả các key
    return Object.keys(formErrors).length === 0; // return boolean type
  };

  const showToastUserNotExist = () => {
    ToastAndroid.showWithGravityAndOffset(
      "User is not existed",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      0,
      250
    );
  };

  const handleLogin = () => {
    if (validateForm()) {
      axios
        .post(`${URL_ANDROID}/account/login`, {
          email: inputValue.email.toLowerCase(),
          password: inputValue.password,
        })
        .then((response) => {
          if (response.data.user) {
            setUserAsyncStorage(response.data.user);
            setTokenAsyncStorage(response.data.token);
            router.navigate("/");
          }
        })
        .catch((error) => {
          console.log("error in login: ", error);
          showToastUserNotExist();
          setUserAsyncStorage(null);
          setTokenAsyncStorage(null);
        });
    }
  };

  const handleIcon = () => {
    if (iconEye === "eye-with-line") {
      setIconEye("eye");
      setHidePassword(false);
    } else {
      setIconEye("eye-with-line");
      setHidePassword(true);
    }
  };

  const handleLoginGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data) {
        const idToken = userInfo.data.idToken;
        try {
          const response = await axios.post(
            `${URL_ANDROID}/account/login-google`,
            { token: idToken }
          );
          const {token, user} = response.data;
          setUserAsyncStorage(user);
          setTokenAsyncStorage(token);
          router.navigate("/");
        } catch (error) {
          console.log(error.message);
        }
   
      }
    } catch (error) {
      if (error.code) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Sign-in already in progress.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Google Play Services not available or outdated.");
            break;
          default:
            console.log("Other error: ", error.message);
        }
      } else {
        console.error("Unexpected error: ", error);
      }
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 50 }}>
        <View style={styles.textContainer}>
          <Image
            width={117}
            source={require("../assets/images/logo_login_mobile.png")}
          />
          <Text style={styles.subHeader}>Log in or Register</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputText}>Email Address</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              value={inputValue.email}
              onChangeText={(text) =>
                setInputValue({
                  ...inputValue,
                  email: text,
                })
              }
              placeholder="Enter Your Email"
              style={styles.input}
            />
          </View>
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputText}>Password</Text>
          <View style={styles.fieldStyle}>
            <TextInput
              value={inputValue.password}
              onChangeText={(text) =>
                setInputValue({
                  ...inputValue,
                  password: text,
                })
              }
              placeholder="Enter Your Password"
              style={styles.input}
              secureTextEntry={hidePassword}
            />
            <Entypo
              onPress={handleIcon}
              name={iconEye}
              size={26}
              color={Colors.grey}
              style={{ marginRight: 10 }}
            />
          </View>
          {errors.email && <Text style={styles.error}>{errors.password}</Text>}
        </View>
        <View style={styles.footerContainer1}>
          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login Now</Text>
          </TouchableOpacity>
          <Link href="/forgotPassword/email">
            <Text style={styles.infoText}>Forgot Password?</Text>
          </Link>
        </View>
        <View style={styles.containerOr}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.footerContainer2}>
          <TouchableOpacity
            onPress={handleLoginGoogle}
            style={styles.googleButton}
          >
            <Image
              source={require("../assets/images/logo-google.png")}
              style={styles.googleImage}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.infoText2}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => router.navigate("/registertab")}>
            <Text style={styles.infoText1}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,

    paddingTop: 50,
  },
  error: {
    color: "red",
    fontStyle: "italic",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 25,
    textTransform: "uppercase",
    textAlign: "center",
    color: Colors.blackColorText,

    justifyContent: "flex-start",
    fontFamily: "GT Easti Bold",
    fontWeight: "900",
  },
  googleButton: {
    backgroundColor: "#fff",
    height: 50,
    width: 317,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 10,
    marginHorizontal: 10,
    fontFamily: "GT Easti Bold",
    fontWeight: "600",
    color: "#888",
  },
  infoText1: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.blue,
    marginBottom: 20,
    fontFamily: "GT Easti Bold",
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.blue,
    marginBottom: 20,
    fontFamily: "GT Easti Bold",
    fontStyle: "italic",
  },
  infoText2: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.blackColorText,
    marginBottom: 20,
    fontFamily: "GT Easti Bold",
    fontStyle: "italic",
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontFamily: "Roboto Regular",
    fontSize: 15,
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    height: 50,
    width: 125,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "black",
  },
  loginButtonText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "GT Easti Bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 5,
  },
  footerContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginVertical: ,
    gap: 5,
  },
  textContainer: {
    alignItems: "center",
    marginVertical: 20,
    gap: 16,
  },

  infoTextHeader: {
    fontSize: 14,
    // textAlign: "center",
    color: Colors.grey,

    marginBottom: 40,
    fontWeight: "900",
    fontFamily: "GT Easti Bold",
  },

  inputWrapper: {
    marginBottom: 15,
  },
  inputText: {
    fontSize: 15,
    color: Colors.blackColorText,
    fontWeight: "700",

    marginBottom: 10,
    fontFamily: "GT Easti Bold",
  },
  footerContainer2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  googleImage: {
    height: 20,
    width: 20,
  },
  backImage: {
    height: 28,
    width: 28,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  containerOr: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 20,
  },
  fieldStyle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Login;
