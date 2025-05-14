import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ToastAndroid,
  Pressable,
  Alert,
} from "react-native";
import Colors from "../constants/Colors";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useContext, useState } from "react";
import { RadioButton } from "react-native-paper";
import { URL_ANDROID } from "@env";
import axios from "axios";
import { useRouter } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { Context } from "../context/ContextProvider";

function Register() {
  const { setUserAsyncStorage, setTokenAsyncStorage } = useContext(Context);
  const [fields, setFields] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    DOB: "",
    gender: "male",
    password: "",
    phone: "",
    accountCode: "C"
  });
  const [errors, setErrors] = useState({});
  const [radioValue, setRadioValue] = useState(fields.gender);
  const router = useRouter();
  const { alert } = useContext(Context);
  const [hidePassword, setHidePassword] = useState(true);
  const [iconEye, setIconEye] = useState("eye-with-line");

  const handleIcon = () => {
    if (iconEye === "eye-with-line") {
      setIconEye("eye");
      setHidePassword(false);
    } else {
      setIconEye("eye-with-line");
      setHidePassword(true);
    }
  };

  const handleChange = (name, value) => {
    const removeSpace = (text) => text?.replace(/\s+/g, "");

    if (name === "username" || name === "password") {
      value = removeSpace(value);
    }
    setFields({
      ...fields,
      [name]: value,
    });
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {        
        const response = await axios.post(
          `${URL_ANDROID}/account/register`,
          fields
        );
        if (response.data.success) {
          const id = response.data.user._id;
          alert("Notification", "Successfully registered", () => {
            setFields({
              ...fields,
              username: "",
              firstname: "",
              lastname: "",
              email: "",
              DOB: "",
              gender: "male",
              password: "",
              phone: "",
            });
            setRadioValue("male");
            router.push({
              pathname: "/selectadditionalinfo",
              params: { userId: id },
            });
          });
        }
      } catch (error) {
        let message = error.response.data.message;
        alert("Notification", message, () => {
          return;
        });
      }
    }
  };

  const validateForm = () => {
    let formErrors = {};
    const nameRegex =
      /^[a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝĂẮẰẲẴẶÂẦẤẨẪẬĐÊỀẾỂỄỆÌÍỈỊÒÓÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨƯỪỨỬỮỰỲÝỶỸỴàáâãäåæçèéêëìíîïðñòóôõöùúûüýăắằẳẵặâầấẩẫậđêềếểễệìíỉịòóôốồổỗộơớờởỡợùúủũưừứửữựỳýỷỹỵ\s]*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;    
    const DOBRegex =
      /^(?!0000)([1-9][0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    const normalizeText = (text) => text?.trim().replace(/\s+/g, " ");

    fields.firstname = normalizeText(fields.firstname);
    fields.lastname = normalizeText(fields.lastname);
    fields.email = fields.email.trim();
    fields.phone = fields.phone.trim(); 
    fields.DOB = fields.DOB.trim(); 

    if (!fields.username) {
      formErrors.username = "Username is required";
    } else if (fields.username.length < 3 || fields.username.length > 20) {
      formErrors.username = "Username must be between 3 and 20 characters";
    }

    if (!fields.firstname || !nameRegex.test(fields.firstname)) {
      formErrors.firstname = "First name must contain only letters";
    } else if (fields.firstname.length < 3 || fields.firstname.length > 20) {
      formErrors.firstname = "First name must be between 3 and 20 characters";
    }

    if (!fields.lastname || !nameRegex.test(fields.lastname)) {
      formErrors.lastname = "Last name must contain only letters";
    } else if (fields.lastname.length < 3 || fields.lastname.length > 20) {
      formErrors.lastname = "Last name must be between 3 and 20 characters";
    }

    if (!fields.email || !emailRegex.test(fields.email)) {
      formErrors.email = "A valid email is required";
    }

    if (fields.DOB) {
      if (!DOBRegex.test(fields.DOB)) {
        formErrors.DOB = "Wrong format";
      } else {
        const today = new Date();
        const dobDate = new Date(fields.DOB);
        if (dobDate > today) {
          formErrors.dob = "Date of birth cannot be a future date.";
        }
      }
    }
    if (!fields.gender) formErrors.gender = "Gender is required";
    if (!fields.password) {
      formErrors.password = "Password is required";
    } else if (fields.password.length < 6) {
      formErrors.password = "Password must be from 6 characters";
    }
    if(fields.phone) {
      if (!phoneRegex.test(fields.phone)) {
        formErrors.phone = "Phone number must be 10 digits and start must be 0";
      }
    }

    setErrors(formErrors);
    // return một mảng chứa tất cả các key
    return Object.keys(formErrors).length === 0; // return boolean type
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
          const { token, user } = response.data;
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
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={() => {
                router.push("/logintab");
              }}
            >
              <Image
                style={{ width: 30, height: 30 }}
                source={require("../assets/images/arrow-circle-back.png")}
              />
            </Pressable>
            <Text style={styles.subHeader}>Register</Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Username:</Text>
              <TextInput
                onChangeText={(text) => {
                  handleChange("username", text);
                }}
                value={fields.username}
                placeholder="Enter Your Username"
                style={styles.input}
              />
              {errors.username && (
                <Text style={styles.error}>{errors.username}</Text>
              )}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>First Name:</Text>
              <TextInput
                onChangeText={(text) => {
                  handleChange("firstname", text);
                }}
                value={fields.firstname}
                placeholder="Enter Your First Name"
                style={styles.input}
              />
              {errors.firstname && (
                <Text style={styles.error}>{errors.firstname}</Text>
              )}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Last Name:</Text>
              <TextInput
                onChangeText={(text) => {
                  handleChange("lastname", text);
                }}
                value={fields.lastname}
                placeholder="Enter Your Last Name"
                style={styles.input}
              />
              {errors.lastname && (
                <Text style={styles.error}>{errors.lastname}</Text>
              )}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Phone:</Text>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={(text) => {
                  handleChange("phone", text);
                }}
                value={fields.phone}
                placeholder="Enter Your Phone"
                style={styles.input}
              />
              {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Date of birth:</Text>
              <TextInput
                onChangeText={(text) => {
                  handleChange("DOB", text);
                }}
                value={fields.DOB}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
              {errors.DOB && <Text style={styles.error}>{errors.DOB}</Text>}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                onChangeText={(text) => {
                  handleChange("email", text.toLowerCase());
                }}
                value={fields.email}
                placeholder="Enter Your Email"
                style={styles.input}
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Password:</Text>
              <View style={styles.fieldStyle}>
                <TextInput
                  onChangeText={(text) => handleChange("password", text)}
                  value={fields.password}
                  placeholder="Enter Your Password"
                  style={[styles.input, { marginBottom: 0, borderWidth: 0 }]}
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
              {errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}
            </View>
            <View style={styles.fieldWrapper}>
              <RadioButton.Group
                onValueChange={(radioNewValue) => {
                  setRadioValue(radioNewValue);
                  handleChange("gender", radioNewValue);
                }}
                value={radioValue}
              >
                <Text style={styles.inputLabel}>Gender:</Text>
                <View style={{ flexDirection: "row", gap: 30 }}>
                  <View style={styles.radioBtn}>
                    <RadioButton value="male" />
                    <Text style={styles.radioText}>Male</Text>
                  </View>
                  <View style={styles.radioBtn}>
                    <RadioButton value="female" />
                    <Text style={styles.radioText}>Female</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleRegister} style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Register</Text>
        </TouchableOpacity>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  fieldStyle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radioBtn: {
    flexDirection: "column",
    alignItems: "center",
  },
  radioText: {
    fontSize: 15,
    fontFamily: "GT Easti Medium",
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  error: {
    color: "red",
    fontStyle: "italic",
  },
  textContainer: {
    // marginVertical: 15,
  },
  subHeader: {
    fontSize: 25,
    textAlign: "center",
    color: Colors.blackColorText,
    fontWeight: "900",
  },
  inputLabel: {
    fontSize: 18,
    fontFamily: "GT Easti Medium",
    marginBottom: 10,
    color: Colors.grey,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 13,
    borderRadius: 10,
    marginBottom: 5,
    fontSize: 17,
    fontFamily: "GT Easti Regular",
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
  backButtonWrapper: {
    height: 45,
    width: 45,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  containerOr: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
  },
  googleImage: {
    height: 20,
    width: 20,
  },
  backImage: {
    height: 25,
    width: 25,
  },
  footerContainer2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  googleButton: {
    backgroundColor: "#fff",
    height: 50,
    width: 317,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
  },
  inputText: {
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 30,
  },
  containerOr: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  containerOr: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  changeButton: {
    backgroundColor: "#FF5533",
    height: 48,
    width: 125,
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Register;
