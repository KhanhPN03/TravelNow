import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function ActionTableWrapperTourGuide({
  onSearchChange, // Callback nhận giá trị tìm kiếm từ input
}) {
  return (
    <div className="searchBarContainer">
      <div className="searchBarLeftContainer">
        <div className="searchWrapperTourguide">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
