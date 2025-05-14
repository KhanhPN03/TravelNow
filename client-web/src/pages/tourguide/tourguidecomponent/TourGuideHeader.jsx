import React, { useContext } from "react";
import { Context } from "../../../context/ContextProvider";

const TourGuideHeader = () => {
  const { user } = useContext(Context);

  return (
    <nav className="adminHeader">
      <div className="adminIcon">
        <div className="adminAvatarWrapper">
          <img 
            src={user?.user?.avatar || "../../../../images/avatar.jpg"} 
            alt="Avatar" 
            className="adminAvatar" 
          />
        </div>
      </div>
    </nav>
  );
};

export default TourGuideHeader;