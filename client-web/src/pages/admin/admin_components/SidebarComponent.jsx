import React, { useState } from "react";

const SidebarComponent = ({ setActivePage, userRole }) => {
  const [activeButton, setActiveButton] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleButtonClick = (page) => {
    setActivePage(page);
    setActiveButton(page);
  };

  // Determine the label for Page2 based on userRole
  const page2Label = userRole === "guide" ? "Guided Tours" : "Booking History";
  console.log(userRole);

  return (
    <div
      className={`sidebar ${isExpanded ? "expanded" : ""}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <button
        className={`sidebarButtonDetail ${
          activeButton === "Page1" ? "active" : ""
        }`}
        onClick={() => handleButtonClick("Page1")}
      >
        <div className="sidebarButtonDetailimg">
          <img src="../../../../images/profileicon.svg" alt="User Profile" />
        </div>
        <span className="buttonLabelDetail ffGTBold">User Profile</span>
      </button>
      {userRole !== "admin" ? (
        <button
          className={`sidebarButtonDetail ${
            activeButton === "Page2" ? "active" : ""
          }`}
          onClick={() => handleButtonClick("Page2")}
        >
          <div className="sidebarButtonDetailimg">
            <img
              src="../../../../images/feedbackicon.svg"
              alt={page2Label} // Update alt text for accessibility
            />
          </div>
          <span className="buttonLabelDetail ffGTBold">{page2Label}</span>
        </button>
      ) : null}

      <button
        className={`sidebarButtonDetail ${
          activeButton === "ChangePassword" ? "active" : ""
        }`}
        onClick={() => handleButtonClick("ChangePassword")}
      >
        <div className="sidebarButtonDetailimgpass">
          <img src="../../../../images/pasword.svg" alt="Change Password" />
        </div>
        <span className="buttonLabelDetail ffGTBold">Change Password</span>
      </button>
    </div>
  );
};

export default SidebarComponent;
