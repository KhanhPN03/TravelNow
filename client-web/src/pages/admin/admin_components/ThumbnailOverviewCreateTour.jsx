import React, { useState } from "react";

export default function ThumbnailOverviewCreateTour({
  thumbnail,
  setPopUp,
  setPopUpType,
  disabled,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const handleEditClick = () => {
    if (!disabled) {
      setPopUpType("thumbnail");
      setPopUp(true);
    }
  };

  return (
    <div
      className="thumbnailOverviewCreateTour"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={
          thumbnail[0].tmpUrl
            ? thumbnail[0].tmpUrl
            : `http://localhost:5000${thumbnail}`
        }
        alt=""
      />

      {isHovered && (
        <div className="editImageBtn" onClick={handleEditClick}>
          <img src="/images/pen.svg" alt="" />
        </div>
      )}
    </div>
  );
}
