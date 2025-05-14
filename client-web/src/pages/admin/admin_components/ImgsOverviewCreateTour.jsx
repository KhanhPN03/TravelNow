import React, { useState } from "react";

export default function ImgsOverviewCreateTour({
  imgs,
  setPopUp,
  setPopUpType,
  disabled,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleEditClick = (index) => {
    if (!disabled) {
      setPopUpType("imgs");
      setPopUp(true);
    }
  };

  return (
    <div className="imgsOverviewCreateTour">
      {imgs.map((img, index) => (
        <div
          key={index}
          className="imgsOverviewImgCreateTour"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <img
            src={img.tmpUrl ? img.tmpUrl : `http://localhost:5000${img}`}
            alt=""
          />

          {hoveredIndex === index && (
            <div
              className="editImageBtn"
              onClick={() => handleEditClick(index)}
            >
              <img src="/images/pen.svg" alt="" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
