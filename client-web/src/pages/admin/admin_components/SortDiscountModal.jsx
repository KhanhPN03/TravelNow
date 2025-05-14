import React, { useState } from "react";

const SortDiscountModal = ({ isOpen, onClose, onSort }) => {
  // Chỉ lưu 1 cấu hình sort duy nhất (field & order)
  const [sortConfig, setSortConfig] = useState({ field: "", order: "" });

  if (!isOpen) return null;

  // Khi chọn sort cho một trường, cập nhật state (ghi đè lựa chọn cũ)
  const handleSelect = (field, order) => {
    setSortConfig({ field, order });
  };

  // Khi nhấn nút Sort, gửi cấu hình sort về component cha
  const handleSortSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const sortResult = sortConfig.field && sortConfig.order ? sortConfig : {};
    if (onSort) onSort(sortResult);
    onClose();
  };

  // Render giao diện lựa chọn cho từng trường
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
        onClick={() => handleSelect(fieldKey, "asc")}
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
        onClick={() => handleSelect(fieldKey, "desc")}
        className={
          sortConfig.field === fieldKey && sortConfig.order === "desc"
            ? "active"
            : ""
        }
      >
        Low
      </button>
    </div>
  );

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDCSort">
        <h2 className="clrDarkBlue ffGTBold">Sort Discount</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          {renderSortOption("Discount Price", "discountPrice")}
          {renderSortOption("Min Total Price", "minTotalPrice")}
          {renderSortOption("Discount Date Start", "discountDateStart")}
          {renderSortOption("Discount Date End", "discountDateEnd")}
          {renderSortOption("Discount Slots", "discountSlots")}
          {renderSortOption("Available Slots", "discountAvailableSlots")}{" "}
          {/* Added */}
          {renderSortOption("Active", "isActive")}{" "}
          {/* Added for sorting by active status */}
        </div>
        <div className="ModalDCActions ffGTMedium fs-16">
          <button
            type="button"
            className="btnDC btnPrimaryDC"
            onClick={handleSortSubmit}
          >
            Sort
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

export default SortDiscountModal;
