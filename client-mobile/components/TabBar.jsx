import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import Colors from "../constants/Colors";
import { AntDesign, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

function TabBar({ state, descriptors, navigation }) {
  const [isLoginScreen, setIsLoginScreen] = useState(false);
  const icons = {
    index: (props) => <Ionicons name="search" size={20} {...props} />,
    wishlist: (props) => <AntDesign name="hearto" size={20} {...props} />,
    cart: (props) => <Feather name="shopping-cart" size={20} {...props} />,
    booking: (props) => (
      <Ionicons name="bookmarks-outline" size={20} {...props} />
    ),
    profile: (props) => <FontAwesome5 name="user" size={20} {...props} />,
    logintab: (props) => <></>,
    registertab: (props) => <></>,
    selectadditionalinfo: (props) => <></>,

  };

  // Kiểm tra xem tab hiện tại có phải là 'search' không
  const isCurrentTabSearch = state.routes[state.index].name === "search";
  useEffect(() => {
    const handleDisplayTabs = () => {
      state.routes[state.index].name === "logintab" 
      || state.routes[state.index].name === "registertab"
      || state.routes[state.index].name === "selectadditionalinfo"
      ? setIsLoginScreen(true) : setIsLoginScreen(false);
    };
    handleDisplayTabs();
  }, [state.routes[state.index].name])
  return (
    <View style={[styles.tabBar, { display: isLoginScreen ? 'none' : 'block'}]}>
      {state.routes.map((route, index) => {     
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;     
        // Áp dụng style cho tab index khi tab hiện tại là search    
        const tabStyle = isCurrentTabSearch && route.name === "index" 
        ? styles.active 
        : {};

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };
         

        return (
          <TouchableOpacity
            key={route.name}
            style={[
              styles.tabBarItem,
              isFocused ? styles.active : {},

              route.name === "logintab" 
              || route.name === "registertab"
              || route.name === "selectadditionalinfo" ? { display: "none" } : {},

              tabStyle
            ]}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {icons[route.name]()}
            <Text
              style={{ color: "#000000", fontSize: 14, fontWeight: "regular" }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default TabBar;

const styles = StyleSheet.create({
  tabBar: {  
    flexDirection: "row",
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
    marginHorizontal: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  active: {
    borderTopColor: Colors.orange,
    borderTopWidth: 3,
  },
});
