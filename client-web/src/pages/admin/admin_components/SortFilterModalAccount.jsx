import React, { useState } from "react";

const SortFilterModal = ({ isOpen, onClose, onSort, onFilter }) => {
  const [sortConfig, setSortConfig] = useState({ field: "", order: "" });
  const [genderFilter, setGenderFilter] = useState(""); // Gender filter state

  const [dobStart, setDobStart] = useState(""); // Start date for DOB filter
  const [dobEnd, setDobEnd] = useState(""); // End date for DOB filter
  const [createdAtStart, setCreatedAtStart] = useState(""); // Start date for createdAt filter
  const [createdAtEnd, setCreatedAtEnd] = useState(""); // End date for createdAt filter
  const [birthMonth, setBirthMonth] = useState(""); // Birth month filter state
  const [isDobLocked, setIsDobLocked] = useState(false); // Flag to lock Date of Birth input
  const [isDobMLocked, setIsDobMLocked] = useState(false);

  if (!isOpen) return null;

  // Handle sort selection
  const handleSortSelect = (field, order) => {
    setSortConfig({ field, order });
  };

  // Handle gender filter selection
  const handleGenderFilter = (gender) => {
    setGenderFilter(gender);
  };


  // Handle DOB filter selection
  const handleDobStartChange = (e) => {
    setDobStart(e.target.value);
    // Lock DOB when Birth Month is selected, and unlock if empty
    if (e.target.value || dobEnd) {
      setIsDobMLocked(true); // Lock Birth Month if any DOB is selected
    } else {
      setIsDobMLocked(false); // Unlock Birth Month if no DOB is selected
    }
  };

  const handleDobEndChange = (e) => {
    setDobEnd(e.target.value);
    // Lock DOB when Birth Month is selected, and unlock if empty
    if (dobStart || e.target.value) {
      setIsDobMLocked(true); // Lock Birth Month if any DOB is selected
    } else {
      setIsDobMLocked(false); // Unlock Birth Month if no DOB is selected
    }
  };

  // Handle createdAt filter selection
  const handleCreatedAtStartChange = (e) => {
    setCreatedAtStart(e.target.value);
  };

  const handleCreatedAtEndChange = (e) => {
    setCreatedAtEnd(e.target.value);
  };

  // Handle birth month filter selection
  const handleBirthMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setBirthMonth(selectedMonth);

    // Lock DOB input if a month is selected (other than "All Months")
    if (selectedMonth !== "") {
      setIsDobLocked(true);
      setIsDobMLocked(false);
      // Lock DOB if Birth Month is selected
    } else {
      // Unlock DOB if "All Months" is selected or if both DOB fields are empty
      if (!dobStart && !dobEnd) {
        setIsDobLocked(false);
      }
    }
  };

  // Handle submit for both sort and filter
  const handleSortFilterSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const sortResult = sortConfig.field && sortConfig.order ? sortConfig : {};

    // Prepare filter result based on DOB, CreatedAt, and Birth Month
    const filterResult = {
      gender: genderFilter,
      dobStart: dobStart ? new Date(dobStart) : null,
      dobEnd: dobEnd ? new Date(dobEnd) : null,
      createdAtStart: createdAtStart ? new Date(createdAtStart) : null,
      createdAtEnd: createdAtEnd ? new Date(createdAtEnd) : null,
      birthMonth: birthMonth ? birthMonth : "", // Add filter for birth month
    };

    // Handle empty filter logic:
    if (!dobStart && !dobEnd) {
      filterResult.dobStart = null;
      filterResult.dobEnd = null;
    } else {
      if (!dobStart) {
        filterResult.dobStart = new Date(dobEnd); // If no start date, set to the end date
      } else if (!dobEnd) {
        filterResult.dobEnd = new Date(); // If no end date, set it to current date
      }
    }

    // If no CreatedAt filters are set, don't apply them
    if (!createdAtStart && !createdAtEnd) {
      filterResult.createdAtStart = null;
      filterResult.createdAtEnd = null;
    } else {
      if (!createdAtStart) {
        filterResult.createdAtStart = new Date(createdAtEnd); // If no start date, set to the end date
      } else if (!createdAtEnd) {
        filterResult.createdAtEnd = new Date(); // If no end date, set it to current date
      }
    }

    // If nothing is selected (no filters), return all data
    if (
      !genderFilter &&
      !dobStart &&
      !dobEnd &&
      !createdAtStart &&
      !createdAtEnd &&
      !birthMonth
    ) {
      filterResult.dobStart = null;
      filterResult.dobEnd = null;
      filterResult.createdAtStart = null;
      filterResult.createdAtEnd = null;
      filterResult.birthMonth = null;
    }


    if (onSort) onSort(sortResult);
    if (onFilter) onFilter(filterResult);

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
        Ascending
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
        Descending
      </button>
    </div>
  );

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDCSort">

        <h2 className="clrDarkBlue ffGTBold"> Filter</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          <div
            className="filterOptionRow fs-14"

            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >

            <span style={{ width: "150px" }}>Gender:</span>

            <button
              type="button"
              onClick={() => handleGenderFilter("male")}
              className={genderFilter === "male" ? "active" : ""}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderFilter("female")}
              className={genderFilter === "female" ? "active" : ""}
            >
              Female
            </button>
            <button
              type="button"
              onClick={() => handleGenderFilter("")}
              className={genderFilter === "" ? "active" : ""}
            >
              All
            </button>
          </div>


          {/* Date of Birth Range Filter */}
          <div
            className="filterOptionRow fs-14"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <span style={{ width: "150px" }}>Date of Birth:</span>
            <input
              type="date"
              value={dobStart}
              onChange={handleDobStartChange}
              placeholder="Start Date"
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              disabled={isDobLocked} // Disable Date of Birth if Birth Month is selected
            />
            <span style={{ width: "fit-content" }}>to</span>
            <input
              type="date"
              value={dobEnd}
              onChange={handleDobEndChange}
              placeholder="End Date"
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              disabled={isDobLocked} // Disable Date of Birth if Birth Month is selected
            />
          </div>

          {/* Created At Range Filter */}
          <div
            className="filterOptionRow  fs-14"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <span style={{ width: "150px" }}>Account Creation Date:</span>
            <input
              type="date"
              value={createdAtStart}
              onChange={handleCreatedAtStartChange}
              placeholder="Start Date"
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <span style={{ width: "fit-content" }}>to</span>
            <input
              type="date"
              value={createdAtEnd}
              onChange={handleCreatedAtEndChange}
              placeholder="End Date"
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>
          {/* Birth Month Filter */}
          <div
            className="filterOptionRow fs-14"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <span style={{ width: "150px" }}>Birth Month:</span>
            <select
              value={birthMonth}
              onChange={handleBirthMonthChange}
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              disabled={isDobMLocked} // Disable Birth Month when DOB is selected
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>


        <div className="ModalDCActions ffGTMedium fs-16">
          <button
            type="button"
            className="btnDC btnPrimaryDC"
            onClick={handleSortFilterSubmit}
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

export default SortFilterModal;
