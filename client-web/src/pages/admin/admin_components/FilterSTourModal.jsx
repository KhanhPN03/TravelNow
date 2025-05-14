import React, { useState } from "react";

const FilterTourModal = ({ isOpen, onClose, onFilter, dataWithImage }) => {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [totalSlotsMin, setTotalSlotsMin] = useState("");
  const [totalSlotsMax, setTotalSlotsMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [status, setStatus] = useState("");
  const [language, setLanguage] = useState("");

  if (!isOpen) return null;

  const validateFilter = () => {
    if (dateStart && dateEnd && new Date(dateStart) > new Date(dateEnd)) {
      alert("The start date must not be later than the end date.");
      return false;
    }
    if (
      totalSlotsMin !== "" &&
      totalSlotsMax !== "" &&
      Number(totalSlotsMin) > Number(totalSlotsMax)
    ) {
      alert("Total Slots Min value cannot be greater than Max.");
      return false;
    }
    if (
      priceMin !== "" &&
      priceMax !== "" &&
      Number(priceMin) > Number(priceMax)
    ) {
      alert("Price Min value cannot be greater than Max.");
      return false;
    }
    return true;
  };

  const handleFilter = (e) => {
    e.preventDefault();
    if (!validateFilter()) return;

    const filters = {
      dateStart: dateStart || "",
      dateEnd: dateEnd || "",
      totalSlotsMin: totalSlotsMin || "",
      totalSlotsMax: totalSlotsMax || "",
      priceMin: priceMin || "",
      priceMax: priceMax || "",
      status: status || "all",
      language: language || "all",
    };

    if (onFilter) onFilter(filters);
    onClose();
  };

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDC">
        <h2 className="clrDarkBlue ffGTBold">Filter Tours</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Date Start</label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Date End</label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Total Slots Min</label>
              <input
                type="number"
                value={totalSlotsMin}
                onChange={(e) => setTotalSlotsMin(e.target.value)}
                placeholder="Enter minimum slots"
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Total Slots Max</label>
              <input
                type="number"
                value={totalSlotsMax}
                onChange={(e) => setTotalSlotsMax(e.target.value)}
                placeholder="Enter maximum slots"
              />
            </div>
          </div>
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Price Min</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="Enter minimum price"
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Price Max</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="Enter maximum price"
              />
            </div>
          </div>
          <div className="editInputGroupDiscount formGroupDiscount dFlex gap20 ffGTBold">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="fs-14"
            >
              <option value="all">All</option>
              <option value="Before">Upcoming</option>
              <option value="In-progress">In-progress</option>
              <option value="Ended">Completed</option>
            </select>
          </div>
          <div className="editInputGroupDiscount formGroupDiscount dFlex gap20 ffGTBold">
            <label>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="fs-14"
            >
              <option value="all">All</option>
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
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
