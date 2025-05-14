import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import Modal from "react-native-modal";

import { useRef, useState } from "react";

function ModalWrapper({ children, isModalVisible, setModalVisible, modalTitle, renderFooter }) {

  return (
    <Modal
      animationIn="fadeInUp"
      animationOutTiming={500}
      onBackdropPress={() => setModalVisible(false)}
      onBackButtonPress={() => setModalVisible(false)}
      style={{
        width: "100%",
        justifyContent: "flex-end",
        margin: 0   
      }}
      //   isVisible={props.isModalVisible}
      isVisible={isModalVisible}
    >
      <View
        style={{
          backgroundColor: Colors.white,
          flex: 0.9,
          borderTopStartRadius: 20,
          borderTopEndRadius: 20,
        }}

      >
          {/* header modal */}
        <View style={{ borderBottomWidth: 1, borderColor: "#c4c4c4" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 15,
            }}
          >
            <Feather
              onPress={() => setModalVisible(false)}
              style={{ position: "absolute", left: 22, color: Colors.blue }}
              name="x"
              size={24}
              color="black"
            />
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "400",
                fontFamily: "GT Easti Medium",
              }}
            >
              {modalTitle}
            </Text>
          </View>
        </View>
        {/* header modal end */}

        {/* body*/}
        {children}
        {/* List Item end*/}

        {/* footer modal */}
        {renderFooter}     
        {/* footer modal end */}
      </View>
    </Modal>
  );
}

export default ModalWrapper;
