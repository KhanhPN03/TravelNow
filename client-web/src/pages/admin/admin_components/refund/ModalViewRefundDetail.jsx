function ModalViewDetailRefundWrapper({
  handleCloseDetailsModal,
  selectedDetails,
}) {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false, // Sử dụng định dạng 24h
    });
  };

  console.log("Selected Details:", selectedDetails);

  return (
    <div className="refundPopupOverlay">
      <div className="refundPopup refundPopupSuccess">
        <div className="refundPopupHeader">
          <h3>Refund Details</h3>
          <button
            className="refundPopupCloseButton"
            onClick={handleCloseDetailsModal}
          >
            ✕
          </button>
        </div>

        <div className="refundPopupContent">
          {selectedDetails.refundBillImage &&
            selectedDetails.refundStatus === "SUCCESS" && (
              <div className="refundPopupField" type="proofImage">
                <span className="refundPopupLabel">Proof of Transfer:</span>
                <img
                  src={`http://localhost:5000${selectedDetails.refundBillImage}`}
                  alt="Proof of Transfer"
                  className="refundProofImageLarge"
                />
              </div>
            )}

          {selectedDetails.refundStatus === "FAILED" && (
            <div className="refundPopupField" type="reasonReject">
              <span className="refundPopupLabel">Failed Reason:</span>
              <span className="refundPopupValue">
                {selectedDetails.refundInformation?.reason?.admin || "N/A"}
              </span>
            </div>
          )}

          <div className="refundPopupField">
            <span className="refundPopupLabel">Refund By:</span>
            <span className="refundPopupValue">
              {selectedDetails.refundBy?.email || "N/A"}
            </span>
          </div>

          {selectedDetails.refundStatus === "SUCCESS" && (
            <div className="refundPopupField">
              <span className="refundPopupLabel">Approved Date:</span>
              <span className="refundPopupValue">
                {formatDate(selectedDetails.updatedAt)}
              </span>
            </div>
          )}
          {selectedDetails.refundStatus === "FAILED" && (
            <div className="refundPopupField">
              <span className="refundPopupLabel">Rejected Date:</span>
              <span className="refundPopupValue">
                {formatDate(selectedDetails.updatedAt)}
              </span>
            </div>
          )}


          <div className="refundPopupField">
            <span className="refundPopupLabel">Bank Name:</span>
            <span className="refundPopupValue">
              {selectedDetails.refundInformation?.bankName || "N/A"}
            </span>
          </div>

          <div className="refundPopupField">
            <span className="refundPopupLabel">Account Number:</span>
            <span className="refundPopupValue">
              {selectedDetails.refundInformation?.accountNumber || "N/A"}
            </span>
          </div>

          <div className="refundPopupField">
            <span className="refundPopupLabel">Account Name:</span>
            <span className="refundPopupValue">
              {selectedDetails.refundInformation?.accountNameBank || "N/A"}
            </span>
          </div>
        </div>
        <div className="refundPopupFooter">
          <button
            className="refundPopupButton"
            onClick={handleCloseDetailsModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalViewDetailRefundWrapper;
