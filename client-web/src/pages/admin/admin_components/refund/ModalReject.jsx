import { commonRejectReasons } from "../../../../data/DataStatic";
import { useState, useMemo } from "react"; // Giữ useMemo để tính toán giá trị

function ModalReject({ handleCloseRejectModal, handleSubmitReject, rejectReason, setRejectReason, adminReason, setAdminReason }) {
  // Thêm state để quản lý thông báo lỗi, chỉ hiển thị sau khi nhấn Submit
  const [showError, setShowError] = useState(false);

  // Tính toán isSubmitDisabled bằng useMemo để kiểm tra điều kiện
  const isSubmitDisabled = useMemo(() => {
    if (rejectReason === "Other") {
      // Kiểm tra nếu adminReason là chuỗi trống hoặc chỉ chứa khoảng trắng
      if (!adminReason || adminReason.trim() === "") {
        return true; // Vô hiệu hóa nút Submit
      }
    }
    return false; // Cho phép submit
  }, [rejectReason, adminReason]); // Chỉ tính lại khi rejectReason hoặc adminReason thay đổi

  // Hàm xử lý khi nhấn Submit
  const onSubmit = () => {
    if (isSubmitDisabled) {
      // Nếu không hợp lệ, hiển thị thông báo lỗi
      setShowError(true);
    } else {
      // Nếu hợp lệ, gọi hàm submit và ẩn thông báo lỗi
      setShowError(false);
      handleSubmitReject();
    }
  };

  return (
    <div className="refundModalOverlay">
      <div className="refundModalContent">
        <h3>Reject Refund Request</h3>
        <p>Please select a reason for rejection:</p>
        {commonRejectReasons.map((reason) => (
          <div key={reason} className="refundModalReason">
            <input
              type="radio"
              id={reason}
              name="rejectReason"
              value={reason}
              checked={rejectReason === reason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setShowError(false); // Ẩn thông báo lỗi khi thay đổi lựa chọn
              }}
            />
            <label htmlFor={reason}>{reason}</label>
          </div>
        ))}
        {rejectReason === "Other" && (
          <div>
            <input
              type="text"
              placeholder="Enter custom reason"
              value={adminReason}
              onChange={(e) => {
                setAdminReason(e.target.value);
                setShowError(false); // Ẩn thông báo lỗi khi người dùng nhập
              }}
              className="refundModalCustomInput"
            />
            {/* Hiển thị thông báo lỗi nếu có */}
            {showError && isSubmitDisabled && (
              <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                Please enter a valid reason for rejection.
              </p>
            )}
          </div>
        )}
        <div className="refundModalFooter">
          <button onClick={handleCloseRejectModal} className="refundModalCancelButton">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="refundModalSubmitButton"       
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalReject;