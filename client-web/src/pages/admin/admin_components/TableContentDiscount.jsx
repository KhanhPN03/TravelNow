
import React, { useState } from "react";
import "../admin.css";
import UpdateDiscountModal from "./UpdateDiscountModal";
import DropDownMenuForTable from "./DropDownMenuForTable"; // Assuming this component exists
import ReviewModal from "./ReviewModal"; // Assuming this component exists

function TableContentDiscount({
  columns,
  data,
  backgroundColorButton,
  labelButton,
  hasCheckbox, // Now used for radio buttons
  updateCustomer,
  setSelectedRowsDelete = () => {},
  hasAction,
  onSort,
  hasImageColumn,
  optionBtnBehavior, // Added for dropdown menu support
  hasViewFeedbacks,
  hasViewSubs,
  hasViewDetails,
  hasViewTickets,
  hasViewReviewDetails,
  hasViewCheckInDetails,
  handleViewDetails,
  handleViewFeedbacks,
  handleViewTickets,
  handleViewReviewDetails,
  handleViewCheckInDetails,
}) {
  const [selectedRow, setSelectedRow] = useState(null); // Single row selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [sortConfig, setSortConfig] = useState({});
  const [openDropdownRow, setOpenDropdownRow] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // const handleRadioChange = (rowId) => {
  //   setSelectedRow(rowId); // Select one row at a time
  //   setSelectedRowsDelete([rowId]); // Send array with one ID
  // };
  const handleRadioChange = (rowId) => {
    console.log("Selected row ID:", rowId); // Log để kiểm tra
    setSelectedRow(rowId); // Select one row at a time
    setSelectedRowsDelete([rowId]); // Send array with one ID
  };

  const handleOpenDropdownRow = (rowId) => {
    setOpenDropdownRow((prevRowId) => (prevRowId === rowId ? null : rowId));
  };

  const handleOptionClickInternal = (row) => {
    setSelectedRowData(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRowData(null);
  };

  const handleUpdate = (updatedDiscount) => {
    closeModal();
    updateCustomer(updatedDiscount);
  };

  const handleSort = (field) => {
    let newOrder = "asc";
    if (sortConfig.field === field) {
      newOrder = sortConfig.order === "asc" ? "desc" : "asc";
    }
    setSortConfig({ field, order: newOrder });
    onSort({ field, order: newOrder });
  };

  // Handler to open ReviewModal
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  // Handler to close ReviewModal
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedReview(null);
  };

  // Handler to delete feedback
  const handleDeleteFeedback = (updatedReview) => {
    closeReviewModal();
  };

  const truncateText = (text) => {
    if (typeof text === "string" && text.length > 32) {
      return text.substring(0, 32) + "...";
    }
    return text;
  };

  return (
    <div
      style={{ overflowX: "auto", whiteSpace: "nowrap" }}
      className="tableContentContainerAdmin"
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse" }}
        className="tableContentAdmin"
      >
        <thead>
          <tr>
            {hasCheckbox && <th>Select</th>}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortConfig.field === col.key && sortConfig.order === "asc" && (
                  <span style={{ position: "absolute" }}> ↑</span>
                )}
                {sortConfig.field === col.key &&
                  sortConfig.order === "desc" && (
                    <span style={{ position: "absolute" }}> ↓</span>
                  )}
              </th>
            ))}
            {hasImageColumn && <th>Image</th>}
            {hasAction && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row._id}
              style={{ color: row.isDeleted ? "red" : "inherit" }}
              className="tableContentRow"
            >
              {hasCheckbox && (
                <td style={{ paddingLeft: "25px" }}>
                  <input
                    type="radio"
                    checked={selectedRow === row._id}
                    onChange={() => handleRadioChange(row._id)}
                    disabled={row.isDeleted}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className={col.key}>
                  {truncateText(row[col.key] || "N/A")}
                </td>
              ))}
              {hasImageColumn && (
                <td>
                  <div
                    style={{
                      width: 120,
                      height: 60,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <img src={row.thumbnail} alt="Thumbnail" />
                  </div>
                </td>
              )}
              {hasAction && (
                <td className="tableContentOptionButtonContainer">
                  <button
                    className="bgDarkblue optionsButtonAdmin"
                    style={{ backgroundColor: backgroundColorButton }}
                    onClick={() =>
                      optionBtnBehavior !== "dropdownmenu"
                        ? handleOptionClickInternal(row)
                        : handleOpenDropdownRow(row._id)
                    }
                  >
                    {labelButton}
                  </button>
                  {openDropdownRow === row._id && (
                    <DropDownMenuForTable
                      id={row._id}
                      hasViewDetails={hasViewDetails}
                      handleViewDetails={() => handleViewDetails(row._id)}
                      handleViewFeedbacks={() => handleViewFeedbacks(row._id)}
                      handleViewTickets={() => handleViewTickets(row._id)}
                      handleViewCheckInDetails={() =>
                        handleViewCheckInDetails(row._id)
                      }
                      handleViewReviewDetails={() =>
                        handleViewReviewDetails(row._id)
                      }
                      hasViewSubs={hasViewSubs}
                      hasViewFeedbacks={hasViewFeedbacks}
                      handleViewReview={handleViewReview}
                      rowData={row}
                      hasViewTickets={hasViewTickets}
                      hasViewCheckInDetails={hasViewCheckInDetails}
                      hasViewReviewDetails={hasViewReviewDetails}
                    />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            {selectedRowData && (
              <UpdateDiscountModal
                isOpen={isModalOpen}
                onClose={closeModal}
                discount={selectedRowData}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        </div>
      )}

      {showReviewModal && selectedReview && (
        <ReviewModal
          details={selectedReview}
          onClose={closeReviewModal}
          onDelete={handleDeleteFeedback}
        />
      )}
    </div>
  );
}

export default TableContentDiscount;
