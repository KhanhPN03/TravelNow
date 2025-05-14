import React, { useState } from "react";
import TableDetailCustomer from "./TableDetailCustomer";
import "../admin.css";
import DropDownMenuForTable from "./DropDownMenuForTable";
import ReviewModal from "./ReviewModal";
import TicketCheckinDetails from "./TicketCheckinDetails";

function TableContent({
  columns,
  data,
  onOptionClick,
  hasImageColumn,
  backgroundColorButton,
  labelButton,
  hasCheckbox,
  updateAccount,
  setSelectedRowsDelete,
  optionBtnBehavior,
  onSort,
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
  hasOptionsButton,
}) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [sortConfig, setSortConfig] = useState({});
  const [openDropdownRow, setOpenDropdownRow] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCheckInDetailsModal, setShowCheckInDetailsModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInRowId, setCheckInRowId] = useState(null);

  const handleOpenDropdownRow = (rowId) => {
    setOpenDropdownRow((prevRowId) => (prevRowId === rowId ? null : rowId));
  };

  const handleRadioChange = (rowId) => {
    setSelectedRow(rowId);
    setSelectedRowsDelete([rowId]);
  };

  const handleOptionClick = (row) => {
    setSelectedRowData(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRowData(null);
  };

  const handleSort = (field) => {
    let newOrder = "asc";
    if (sortConfig.field === field) {
      newOrder = sortConfig.order === "asc" ? "desc" : "asc";
    }
    setSortConfig({ field, order: newOrder });
    onSort({ field, order: newOrder });
  };

  const handleViewReview = (reviewData) => {
    console.log("Opening ReviewModal with reviewData:", reviewData);
    setSelectedReview(reviewData);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    console.log("Closing ReviewModal");
    setShowReviewModal(false);
    setSelectedReview(null);
  };

  const handleViewCheckIn = (rowId) => {
    console.log("Opening TicketCheckinDetails with rowId:", rowId);
    setCheckInRowId(rowId);
    setShowCheckInModal(true);
  };

  const closeCheckInModal = () => {
    setShowCheckInModal(false);
    setCheckInRowId(null);
  };

  const handleDeleteFeedback = async (updatedReview) => {
    console.log(
      "handleDeleteFeedback called with updatedReview:",
      updatedReview
    );
    if (selectedReview?.refreshReviews) {
      console.log(
        "Calling refreshReviews for ticket:",
        selectedReview.ticketId
      );
      await selectedReview.refreshReviews();
    } else {
      console.warn("refreshReviews not found in selectedReview");
    }
    closeReviewModal();
  };

  return (
    <div className="tableContentContainerAdmin">
      <table
        style={{ width: "100%", borderCollapse: "collapse" }}
        className="tableContentAdmin"
      >
        <thead>
          <tr>
            {hasCheckbox && <th>Select</th>}
            {columns.map((col, index) => (
              <th
                style={{ position: "relative", cursor: "pointer" }}
                key={index}
                onClick={() => handleSort(col)}
              >
                {col}
                {sortConfig.field === col && sortConfig.order === "asc" && (
                  <span style={{ position: "absolute" }}> ↑</span>
                )}
                {sortConfig.field === col && sortConfig.order === "desc" && (
                  <span style={{ position: "absolute" }}> ↓</span>
                )}
              </th>
            ))}
            {hasImageColumn && <th>Image</th>}
            {hasOptionsButton && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr className="tableContentRow" key={row._id}>
              {hasCheckbox && (
                <td style={{ paddingLeft: "25px" }}>
                  <input
                    type="radio"
                    checked={selectedRow === row._id}
                    onChange={() => handleRadioChange(row._id)}
                  />
                </td>
              )}
              {columns.map((col, index) => (
                <td className={col} key={index}>
                  {row[col]}
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
                    <img src={row.thumbnail} alt="RowImage" />
                  </div>
                </td>
              )}
              {hasOptionsButton && (
                <td className="tableContentOptionButtonContainer">
                  <button
                    className="bgDarkblue optionsButtonAdmin"
                    onClick={() =>
                      optionBtnBehavior !== "dropdownmenu"
                        ? handleOptionClick(row)
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
        <div className="tableDetailModalOverlay">
          <div className="modalContent">
            {selectedRowData && (
              <TableDetailCustomer
                accountData={selectedRowData}
                onClose={closeModal}
                updateAccount={updateAccount}
                handleViewReview={handleViewReview}
                handleViewCheckIn={handleViewCheckIn}
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
          onRefreshReviews={selectedReview.refreshReviews}
        />
      )}

      {showCheckInModal && (
        <TicketCheckinDetails
          onClose={closeCheckInModal}
          rowId={checkInRowId}
        />
      )}
    </div>
  );
}

export default TableContent;
