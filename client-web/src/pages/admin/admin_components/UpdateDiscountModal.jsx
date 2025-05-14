import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { Context } from "../../../context/ContextProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateDiscountModal = ({ isOpen, onClose, onUpdate, discount }) => {
  const { user } = useContext(Context);
  const [discountPrice, setDiscountPrice] = useState("");
  const [minTotalPrice, setMinTotalPrice] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountDateStart, setDiscountDateStart] = useState("");
  const [discountDateEnd, setDiscountDateEnd] = useState("");
  const [discountSlots, setDiscountSlots] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [discountAvailableSlots, setDiscountAvailableSlots] = useState("");
  const [createdByUsername, setCreatedByUsername] = useState("");
  const [updatedByUsername, setUpdatedByUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState("full");

  useEffect(() => {
    if (discount && isOpen) {
      setDiscountPrice(formatCurrency(discount.discountPrice.toString()));
      setMinTotalPrice(formatCurrency(discount.minTotalPrice.toString()));
      setDiscountMessage(discount.discountMessage || "");
      setDiscountCode(discount.discountCode || "");
      setDiscountDateStart(
        discount.discountDateStartOriginal
          ? new Date(discount.discountDateStartOriginal)
              .toISOString()
              .split("T")[0]
          : ""
      );
      setDiscountDateEnd(
        discount.discountDateEndOriginal
          ? new Date(discount.discountDateEndOriginal)
              .toISOString()
              .split("T")[0]
          : ""
      );
      setDiscountSlots(formatCurrency(discount.discountSlots.toString()));
      setDiscountAvailableSlots(
        formatCurrency(discount.discountAvailableSlots.toString())
      );
      setIsActive(discount.isActive || false);
      setCreatedByUsername(
        discount.createdBy?.accountCode || discount.createdBy?.username || "N/A"
      );
      setUpdatedByUsername(
        discount.updatedBy?.accountCode || discount.updatedBy?.username || "N/A"
      );

      const currentDate = new Date();
      const startDate = new Date(discount.discountDateStartOriginal);
      const endDate = new Date(discount.discountDateEndOriginal);

      if (currentDate < startDate) {
        setEditMode("full");
      } else if (currentDate >= startDate && currentDate <= endDate) {
        setEditMode("limited");
      } else if (currentDate > endDate) {
        setEditMode("none");
      }
    }
  }, [discount, isOpen]);

  const toolbarOptions = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  if (!isOpen) return null;

  const notify = (message, status) => {
    if (status === "success") {
      return toast.success(message);
    }
    if (status === "error") {
      return toast.error(message);
    }
    if (status === "warn") {
      return toast.warning(message);
    }
  };

  const formatCurrency = (value) => {
    const num = value.replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const validateInputs = () => {
    const newErrors = {};
    const priceNumeric = discountPrice.replace(/,/g, "");
    const minPriceNumeric = minTotalPrice.replace(/,/g, "");
    const slotsNumeric = discountSlots.replace(/,/g, "");
    const availableSlotsNumeric = discountAvailableSlots.replace(/,/g, "");

    if (editMode === "full") {
      if (!discountPrice || isNaN(priceNumeric)) {
        newErrors.discountPrice = "Discount Price must be a valid number.";
      }
      if (!minTotalPrice || isNaN(minPriceNumeric)) {
        newErrors.minTotalPrice = "Min Total Price must be a valid number.";
      }
      if (!discountCode.trim()) {
        newErrors.discountCode = "Discount Code is required.";
      }
      if (!discountDateStart) {
        newErrors.discountDateStart = "Discount Start Date is required.";
      }
    }

    if (editMode === "full" || editMode === "limited") {
      if (!discountMessage.trim()) {
        newErrors.discountMessage = "Discount Message is required.";
      }
      if (!discountDateEnd) {
        newErrors.discountDateEnd = "Discount End Date is required.";
      }
      if (discountDateStart && discountDateEnd) {
        const start = new Date(discountDateStart);
        const end = new Date(discountDateEnd);
        if (start >= end) {
          newErrors.discountDateEnd =
            "Discount End Date must be after Discount Start Date.";
        }
      }
      if (!discountSlots || isNaN(slotsNumeric)) {
        newErrors.discountSlots = "Discount Slots must be a valid number.";
      }
      if (
        editMode === "limited" &&
        parseInt(slotsNumeric) <
          parseInt(slotsNumeric) - parseInt(availableSlotsNumeric)
      ) {
        newErrors.discountSlots =
          "Discount Slots must be greater than or equal to Available Slots.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (editMode === "none") {
      return;
    }
    if (!validateInputs()) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/discount/update/${discount._id}`,
        {
          ...(editMode === "full" && {
            discountPrice: discountPrice.replace(/,/g, ""),
            minTotalPrice: minTotalPrice.replace(/,/g, ""),
            discountCode,
            discountDateStart,
          }),
          ...(editMode === "full" || editMode === "limited"
            ? {
                discountMessage,
                discountDateEnd,
                discountSlots: discountSlots.replace(/,/g, ""),
                isActive,
              }
            : {}),
          updatedBy: user?.user._id,
        }
      );
      if (response.data.success) {
        // Replace alert with toast notification
        notify("Discount updated successfully!", "success");

        // Update parent component if onUpdate callback exists
        if (onUpdate) {
          onUpdate(response.data.discount);
        }

        // Close modal after a brief delay to allow user to see the toast
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        notify("Failed to update discount. Please try again.", "error");
      }
    } catch (error) {
      console.error(
        "Error updating discount:",
        error.response?.data || error.message
      );
      notify("Failed to update discount. Please try again.", "error");
    }
  };

  const toggleActiveStatus = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDC">
        <h2 className="clrDarkBlue ffGTBold">Update Discount</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          <div
            className="formGroupDiscount ffGTBold fs-14"
            style={{ marginBottom: "5px" }}
          >
            <div
              className="toggleContainer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: isActive ? "#e6ffe6" : "#ffe6e6",
              }}
            >
              <button
                className={`toggleButton ${isActive ? "active" : "inactive"}`}
                onClick={toggleActiveStatus}
                disabled={editMode === "full" || editMode === "none"}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: isActive ? "#4caf50" : "#f44336",
                  color: "white",
                  border: "none",
                  cursor:
                    editMode === "full" || editMode === "none"
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isActive ? "Active" : "Inactive"}
              </button>
              <span
                className="statusText"
                style={{ fontSize: "14px", color: "#555" }}
              >
                {isActive
                  ? "This discount is currently active to customers"
                  : "This discount is currently inactive to customers"}
              </span>
            </div>
          </div>
          <div className="lineUpdate">
            <div className="formGroupDiscount ffGTBold fs-14">
              <label>Discount Price</label>
              <input
                type="text"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                onBlur={() => setDiscountPrice(formatCurrency(discountPrice))}
                placeholder="Enter discount price"
                disabled={editMode !== "full"}
              />
              {errors.discountPrice && (
                <p className="error">{errors.discountPrice}</p>
              )}
            </div>

            <div className="formGroupDiscount ffGTBold fs-14">
              <label>Min Total Price</label>
              <input
                type="text"
                value={minTotalPrice}
                onChange={(e) => setMinTotalPrice(e.target.value)}
                onBlur={() => setMinTotalPrice(formatCurrency(minTotalPrice))}
                placeholder="Enter minimum total price"
                disabled={editMode !== "full"}
              />
              {errors.minTotalPrice && (
                <p className="error">{errors.minTotalPrice}</p>
              )}
            </div>
          </div>
          <div className="editProfileInputGroupDiscount dFlex gap20">
            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Discount Start Date</label>
              <input
                type="date"
                value={discountDateStart}
                onChange={(e) => setDiscountDateStart(e.target.value)}
                disabled={editMode !== "full"}
              />
              {errors.discountDateStart && (
                <span className="error">{errors.discountDateStart}</span>
              )}
            </div>

            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Discount End Date</label>
              <input
                type="date"
                value={discountDateEnd}
                onChange={(e) => setDiscountDateEnd(e.target.value)}
                disabled={editMode === "none"}
              />
              {errors.discountDateEnd && (
                <span className="error">{errors.discountDateEnd}</span>
              )}
            </div>
          </div>
          <div className="editProfileInputGroupDiscount dFlex gap20">
            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Total Discount Slots</label>
              <input
                type="text"
                value={discountSlots}
                onChange={(e) => setDiscountSlots(e.target.value)}
                onBlur={() => setDiscountSlots(formatCurrency(discountSlots))}
                placeholder="Enter total discount slots"
                disabled={editMode === "none"}
              />
              {errors.discountSlots && (
                <p className="error">{errors.discountSlots}</p>
              )}
            </div>

            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Available Discount Slots</label>
              <input
                type="text"
                value={discountAvailableSlots}
                onChange={(e) => setDiscountAvailableSlots(e.target.value)}
                onBlur={() =>
                  setDiscountAvailableSlots(
                    formatCurrency(discountAvailableSlots)
                  )
                }
                placeholder="Enter available discount slots"
                disabled={true}
              />
              {errors.discountAvailableSlots && (
                <p className="error">{errors.discountAvailableSlots}</p>
              )}
            </div>
          </div>
          <div className="formGroupDiscount inputDiscountMessage ffGTBold fs-14">
            <label>Discount Message</label>
            <ReactQuill
              value={discountMessage}
              onChange={(content) => setDiscountMessage(content)}
              className="discountQuill"
              modules={toolbarOptions}
              readOnly={editMode === "none"}
            />
            {errors.discountMessage && (
              <p className="error">{errors.discountMessage}</p>
            )}
          </div>

          <div className="formGroupDiscount ffGTBold fs-14">
            <label>Discount Code</label>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code"
              disabled={editMode !== "full"}
            />
            {errors.discountCode && (
              <p className="error">{errors.discountCode}</p>
            )}
          </div>
          <div className="editProfileInputGroupDiscount dFlex gap20">
            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Created By</label>
              <input type="text" value={createdByUsername} disabled={true} />
            </div>

            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Updated By</label>
              <input type="text" value={updatedByUsername} disabled={true} />
            </div>
          </div>
        </div>
        <div className="ModalDCActions ffGTMedium fs-16">
          {editMode !== "none" && (
            <button
              type="button"
              className="btnDC btnPrimaryDC"
              onClick={handleSubmit}
            >
              Update
            </button>
          )}
          <button
            type="button"
            className="btnDC btnSecondaryDC"
            onClick={onClose}
          >
            {editMode === "none" ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        style={{ width: "auto" }}
      />
    </div>
  );
};

export default UpdateDiscountModal;
