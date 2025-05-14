function ModalApprove({
  handleSubmitApprove,
  handleCloseApproveModal,
  proofImage,
  selectedRequest,
  fileInputRef,
  handleUploadProofInModal,
}) {
  return (
    <div className="refundPopupOverlay">
      <div className="refundPopup">
        <div className="refundPopupHeader">
          <h3>Approve Refund Request</h3>
          <button
            className="refundPopupCloseButton"
            onClick={handleCloseApproveModal}
          >
            ✕
          </button>
        </div>
        <div className="refundPopupContent">
          <div className="refundPopupField">
            <span className="refundPopupLabel">Bank Name:</span>
            <span className="refundPopupValue">
              {selectedRequest?.refundInformation?.bankName || "N/A"}
            </span>
          </div>
          <div className="refundPopupField">
            <span className="refundPopupLabel">Account Number:</span>
            <span className="refundPopupValue">
              {selectedRequest?.refundInformation?.accountNumber || "N/A"}
            </span>
          </div>
          <div className="refundPopupField">
            <span className="refundPopupLabel">Account Holder:</span>
            <span className="refundPopupValue">
              {selectedRequest?.refundInformation?.accountNameBank || "N/A"}
            </span>
          </div>
          <div className="refundPopupField" type={proofImage? "proofImage" : ""}>
            <span className="refundPopupLabel">Proof of Transfer:</span>
            <div className="refundProofUpload">
              {proofImage ? (
                <div className="refundImagWrapper">
                  <img
                    src={proofImage}
                    alt="Proof of Transfer"
                    className="refundProofImage"
                  />
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleUploadProofInModal}
                  />
                  <button
                    className="refundActionButton"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Upload Proof
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="refundPopupFooter">
          <button
            className="refundPopupButton refundPopupCancelButton"
            onClick={handleCloseApproveModal}
          >
            Cancel
          </button>
          <button
            className="refundPopupButton refundPopupSubmitButton"
            onClick={handleSubmitApprove}
            disabled={!proofImage}
            style={
              proofImage ? {} : { backgroundColor: "grey", cursor: "not-allowed" }
            }
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalApprove;