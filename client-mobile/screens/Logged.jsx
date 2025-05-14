import * as React from "react";
import { ScrollView } from "react-native";

import ListFunctionLogin from "../components/profile/ListFunctionLogin";
import ProfileLoginScreen from "../components/profile/ProfileLogin";

export default function ProfileLogin() {
  return (
    <>
      <ScrollView>
        <ProfileLoginScreen />
        <ListFunctionLogin />
      </ScrollView>
    </>
  );
}
