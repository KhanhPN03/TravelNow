import { Link, router } from "expo-router";
import React, { Children, useContext, useEffect, useLayoutEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Context } from "../../context/ContextProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const titleToDisplay = [
  {
    title: "Gifts",
    data: [{ name: "Discounts" }],
  },
  {
    title: "Settings",
    data: [
      { name: "Profile" },
      { name: "Change Password" },
      { name: "Notification" },
    ],
  },
  {
    title: "Support",
    data: [
      { name: "About Travel Now" },
      { name: "Help Center" },
      { name: "Chat with us" },
    ],
  },
  {
    title: "Legal",
    data: [
      { name: "Legal Notice" },
      { name: "Privacy" },
      { name: "Privacy Policy" },  
    ],
  },
];

const Item = ({ name }) => {
  const [user, setUser] = useState();

  const handleRedirect = (name) => {
    if (name === "Profile") {
      router.push(`/profile-detail/${user._id}`);
    }
    if (name === "Change Password" && !user.googleID) {
      router.push(`/password/change`);
    }
    if (name === "Discounts") {
      router.push(`/discount/${user._id}`);
    }
    if (name === "Chat with us") {
      router.push("/chatbot");
    }
    if (name === "About TravelNow") {
      router.push("/aboutsUs");
    }
    if (name === "Notification") {
      router.push("/settings/NotificationSetting");
    }
  };

  useLayoutEffect(() => {
    const getUser = async () => {
      try {
        const result = await AsyncStorage.getItem("user");
        const user = JSON.parse(result);
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("error profile: ", error);
      }
    };
    getUser();
  });
  if(user?.googleID) {
    return (
      <Pressable
        onPress={() => handleRedirect(name)}
        style={[styles.innerContainer, {display: name === "Change Password" ? "none" : "flex"}]}
      >
          <Text style={styles.itemText}>{name}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={() => handleRedirect(name)}
      style={styles.innerContainer}
    >
        <Text style={styles.itemText}>{name}</Text>
    </Pressable>
  );
};

const ListFunctionUser = () => {
  const { logout } = useContext(Context);

  const renderItem = ({ item }) => <Item name={item.name} />;

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.headerStyle}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        scrollEnabled={false}
        sections={titleToDisplay}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
      <TouchableOpacity onPress={logout}>
        <Text style={styles.logout}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
  },

  container: {
    flex: 1,
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
  },
  itemText: {
    color: "#1A2B49",
    fontSize: 16,
    fontFamily: "GT Easti Regular",
  },
  headerStyle: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E9E9E9",
  },
  sectionHeader: {
    color: "#1A2B49",
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
    fontFamily: "GT Easti Regular",
  },
  logout: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    color: "#FF5533",
    fontFamily: "GT Easti Regular",
    fontSize: 16,
  },
});

export default ListFunctionUser;
