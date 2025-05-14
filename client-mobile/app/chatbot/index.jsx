import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import { URL_ANDROID } from "@env";
import faqQuestions from "../../static-data/FaqQuestions";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showFaq, setShowFaq] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = async (message) => {
    if (!message.trim()) return;

    const newMessages = [...messages, { text: message, sender: "user" }];
    setMessages([
      ...newMessages,
      { text: "Đang phản hồi...", sender: "bot", loading: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${URL_ANDROID}/chat`, {
        message,
      });

      setMessages([
        ...newMessages,
        { text: response.data.reply, sender: "bot", isFaqTag: true },
      ]);
      setShowFaq(false); 
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, showFaq]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View style={{ marginTop: 30, backgroundColor: Colors.black }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            gap: 5,
          }}
        >
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, color: "#ffffff", fontWeight: "bold" }}>
            Chatbot
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollViewRef} style={{ flex: 1, padding: 20 }}>
        <View style={{ marginBottom: 20 }}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                padding: 10,
                backgroundColor: msg.sender === "user" ? "#007bff" : "#ddd",
                borderRadius: 10,
                marginVertical: 12,
              }}
            >
              {msg.loading ? (
                <View>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              ) : (
                <Text
                  style={{
                    color: msg.sender === "user" ? "#fff" : "#000",
                    flexWrap: "wrap",
                    fontSize: 15,
                  }}
                >
                  {msg.text}
                </Text>
              )}
              {msg.isFaqTag && (
                <TouchableOpacity onPress={() => setShowFaq(true)}>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.grey,
                      borderRadius: 8,
                      paddingVertical: 5,
                      paddingHorizontal: 5,
                      marginTop: 8,
                      backgroundColor: Colors.black,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="comment-search"
                      size={24}
                      color="green"
                    />
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontFamily: "GT Easti Medium",
                      }}
                    >
                      FAQ Questions
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Gợi ý câu hỏi thường gặp */}
          {showFaq && (
            <View
              style={{
                marginTop: 10,
                paddingHorizontal: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 15,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Frequently Asked Questions
                </Text>

                {faqQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f9f9f9",
                      padding: 12,
                      borderRadius: 8,
                      marginVertical: 5,
                      borderWidth: 1,
                      borderColor: "#ddd",
                    }}
                    onPress={() => {
                      setShowFaq(false);
                      handleSend(question);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="comment-question-outline"
                      size={24}
                      color="#007bff"
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#333",
                        fontWeight: "500",
                        // flexWrap: "wrap",
                        flexShrink: 1,
                        maxWidth: "100%",
                      }}
                    >
                      {question}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input & Send Button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          backgroundColor: "#fff",    
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 25,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: "#333",
            }}
            value={input}
            multiline={true}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={{
            marginLeft: 10,
            backgroundColor: "#007bff",
            padding: 12,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#007bff",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 5,
          }}
          onPress={() => handleSend(input)}
        >
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
