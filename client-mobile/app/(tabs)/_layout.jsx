import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";


function Page() {
  return (

      <Tabs
      screenOptions={{
        headerShown: false
      }}
      tabBar={(props) => <TabBar {...props} />}>

        <Tabs.Screen
          name="index"
          options={{
            title: "Discover",
            headerTransparent: true,

            headerTitle: "",       

            unmountOnBlur: true,
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            headerTransparent: true,

            headerTitle: "",    

            unmountOnBlur: true,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            headerTransparent: true,

            headerTitle: "",    

            unmountOnBlur: true,
          }}
        />
        <Tabs.Screen
          name="booking"
          options={{
            title: "Booking",
            headerTransparent: true,

            headerTitle: "",    

            unmountOnBlur: true,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTransparent: true,

            headerTitle: "", 
            unmountOnBlur: true,  
          }}
        />
        <Tabs.Screen
          name="logintab"
          options={{
            title: "",
            headerTransparent: true,
            headerTitle: "", 
          }}
        />
        <Tabs.Screen
          name="registertab"
          options={{
            title: "",
            headerTransparent: true,
            headerTitle: "",    
          }}
        />
        <Tabs.Screen
          name="selectadditionalinfo"
          options={{
            title: "",
            headerTransparent: true,
            headerTitle: "",    
          }}
        />
      </Tabs>

  );
}

export default Page;
