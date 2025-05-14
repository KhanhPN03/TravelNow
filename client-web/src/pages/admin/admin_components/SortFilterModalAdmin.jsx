import React, { useState } from "react";

const SortFilterModalAdmin = ({ isOpen, onClose, onSort }) => {
  const [sortConfig, setSortConfig] = useState({ field: "", order: "" });

  if (!isOpen) return null;

  // Handle sort selection
  const handleSortSelect = (field, order) => {
    setSortConfig({ field, order });
  };

  // Handle submit for sort
  const handleSortSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const sortResult = sortConfig.field && sortConfig.order ? sortConfig : {};

    if (onSort) onSort(sortResult);

    onClose();
  };

  // Render sorting options
  const renderSortOption = (label, fieldKey) => (
    <div
      className="sortOptionRow"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px",
      }}
    >
      <span style={{ width: "150px" }}>{label}</span>
      <button
        type="button"
        onClick={() => handleSortSelect(fieldKey, "asc")}
        className={
          sortConfig.field === fieldKey && sortConfig.order === "asc"
            ? "active"
            : ""
        }
      >
        Up
      </button>
      <button
        type="button"
        onClick={() => handleSortSelect(fieldKey, "desc")}
        className={
          sortConfig.field === fieldKey && sortConfig.order === "desc"
            ? "active"
            : ""
        }
      >
        Down
      </button>
    </div>
  );

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDCSort">
        <h2 className="clrDarkBlue ffGTBold">Sort</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          {renderSortOption("Username", "username")}
          {renderSortOption("Email", "email")}
          {renderSortOption("Phone", "phone")}
          {renderSortOption("First Name", "firstname")}
        </div>
        <div className="ModalDCActions ffGTMedium fs-16">
          <button
            type="button"
            className="btnDC btnPrimaryDC"
            onClick={handleSortSubmit}
          >
            Apply
          </button>
          <button
            type="button"
            className="btnDC btnSecondaryDC"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortFilterModalAdmin;
