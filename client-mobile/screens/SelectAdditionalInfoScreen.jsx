import AvatarSelection from "../components/selectadditionalinfo/AvatarSelection";
import { useLocalSearchParams } from "expo-router";

function SelectAvatarScreen() { 
  const { userId } = useLocalSearchParams();
  return (
    <AvatarSelection userId={userId} />
  );
}


export default SelectAvatarScreen;
