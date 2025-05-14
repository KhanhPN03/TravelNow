import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Modal from "react-native-modal";
function ModalParticipants(props) {
  const [empSlot, setEmpSlot] = useState(props.slot);

  useEffect(() => {
    setEmpSlot(props.slot);
  }, [props]);

  return (
    <Modal
      animationIn="fadeInUp"
      animationOutTiming={500}
      onBackdropPress={() => props.setModalVisible(false)}
      onBackButtonPress={() => props.setIsOpen(false)}
      style={{
        width: "100%",
        left: -20,
        bottom: -50,
      }}
      isVisible={props.isModalVisible}
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
              onPress={() => props.setModalVisible(false)}
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
              Participants
            </Text>
          </View>
        </View>
        {/* header modal end */}

        {/* List Item */}
        <View style={{ marginTop: 18, paddingHorizontal: 25 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "GT Easti Medium",
                    marginBottom: 10,
                  }}
                >
                  Adult & Children
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "GT Easti Regular",
                    color: Colors.grey,
                  }}
                >
                  (Any age)
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <Pressable
                  style={[
                    styles.btn,
                    empSlot === 0 && { borderColor: Colors.grey },
                  ]}
                  disabled={empSlot === 0}
                  onPress={() =>
                    setEmpSlot((empSlot) => Math.max(empSlot - 1, 0))
                  }
                >
                  <Text
                    style={[
                      styles.btnText,
                      empSlot === 0 && { color: Colors.grey },
                    ]}
                  >
                    -
                  </Text>
                </Pressable>
                <View
                  style={{
                    minWidth: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 5,
                  }}
                >
                  <Text style={styles.slot}>{empSlot}</Text>
                </View>
                <Pressable
                  style={[
                    styles.btn,
                    empSlot === props.maxSlot && { borderColor: Colors.grey },
                  ]}
                  disabled={empSlot === props.maxSlot}
                  onPress={() =>
                    setEmpSlot((empSlot) =>
                      Math.min(empSlot + 1, props.maxSlot)
                    )
                  }
                >
                  <Text
                    style={[
                      styles.btnText,
                      empSlot === props.maxSlot && { color: Colors.grey },
                    ]}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
        {/* List Item end*/}

        {/* footer modal */}
        <View
          style={{
            zIndex: 1,
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: "#c4c4c4",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 15,
              marginRight: 22,
            }}
          >
            <Pressable
              disabled={empSlot === 0}
              onPress={() => {
                props.setSlot(empSlot);
                props.setModalVisible(false);
              }}
              style={[
                {
                  borderRadius: 80,
                  paddingVertical: 12,
                  paddingHorizontal: 80,
                  backgroundColor: Colors.blue,
                },
                empSlot === 0 && { backgroundColor: Colors.grey },
              ]}
            >
              <Text
                style={{ color: Colors.white, fontFamily: "GT Easti Medium" }}
              >
                Apply
              </Text>
            </Pressable>
          </View>
        </View>
        {/* footer modal end */}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2,
    borderColor: Colors.blue,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: Colors.blue,
    fontFamily: "GT Easti Bold",
    fontSize: 18,
  },
  slot: {
    fontSize: 16,
  },
});

export default ModalParticipants;
