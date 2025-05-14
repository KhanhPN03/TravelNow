import React, { useState } from "react";

const FilterTourModal = ({ isOpen, onClose, onFilter }) => {
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");
  const [category, setCategory] = useState("");

  if (!isOpen) return null;

  // Hàm kiểm tra lỗi cho các trường số và ngày
  const validateFilter = () => {
    if (durationMin !== "" && durationMax !== "") {
      if (Number(durationMin) > Number(durationMax)) {
        alert("Duration: Giá trị Min không được lớn hơn giá trị Max.");
        return false;
      }
    }
    if (createdAtStart !== "" && createdAtEnd !== "") {
      if (new Date(createdAtStart) > new Date(createdAtEnd)) {
        alert("Created At: Ngày bắt đầu không được muộn hơn ngày kết thúc.");
        return false;
      }
    }
    return true;
  };

  // Khi người dùng click Filter, chỉ lấy các trường có giá trị và gửi qua callback onFilter
  const handleFilter = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateFilter()) return;

    const filters = {};
    if (durationMin.trim() !== "") {
      filters.durationMin = durationMin;
    }
    if (durationMax.trim() !== "") {
      filters.durationMax = durationMax;
    }
    if (createdAtStart.trim() !== "") {
      filters.createdAtStart = createdAtStart;
    }
    if (createdAtEnd.trim() !== "") {
      filters.createdAtEnd = createdAtEnd;
    }
    if (category.trim() !== "") {
      filters.category = category; // "LONG-TRIP" or "ADVENTURE"
    }

    if (onFilter) onFilter(filters);
    onClose();
  };

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDC">
        <h2 className="clrDarkBlue ffGTBold">Filter Tours</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          {/* Duration */}
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Duration (Min)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="Enter minimum duration"
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Duration (Max)</label>
              <input
                type="number"
                value={durationMax}
                onChange={(e) => setDurationMax(e.target.value)}
                placeholder="Enter maximum duration"
              />
            </div>
          </div>
          {/* Created At */}
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Created At Start</label>
              <input
                type="date"
                value={createdAtStart}
                onChange={(e) => setCreatedAtStart(e.target.value)}
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Created At End</label>
              <input
                type="date"
                value={createdAtEnd}
                onChange={(e) => setCreatedAtEnd(e.target.value)}
              />
            </div>
          </div>
          {/* Category */}
          <div
            className="editInputGroupDiscount formGroupDiscount dFlex gap20 ffGTBold "
            style={{
              flexDirection: "row-reverse",
            }}
          >
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              className="fs-14"
            >
              <option value="">All</option>
              <option value="LONG-TRIP">LONG-TRIP</option>
              <option value="ADVENTURE">ADVENTURE</option>
            </select>
          </div>
        </div>
        <div className="ModalDCActions ffGTMedium fs-16">
          <button
            type="button"
            className="btnDC btnPrimaryDC"
            onClick={handleFilter}
          >
            Filter
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

export default FilterTourModal;
