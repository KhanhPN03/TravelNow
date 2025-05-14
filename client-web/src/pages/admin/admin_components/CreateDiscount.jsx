import React, { useState, useContext } from "react";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { Context } from "../../../context/ContextProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateDiscountModal = ({ isOpen, onClose, onCreate }) => {
  const { user } = useContext(Context);
  const [discountPrice, setDiscountPrice] = useState("");
  const [minTotalPrice, setMinTotalPrice] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountDateStart, setDiscountDateStart] = useState("");
  const [discountDateEnd, setDiscountDateEnd] = useState("");
  const [discountSlots, setDiscountSlots] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!discountPrice || isNaN(priceNumeric)) {
      newErrors.discountPrice = "Discount Price must be a valid number.";
    }
    if (!minTotalPrice || isNaN(minPriceNumeric)) {
      newErrors.minTotalPrice = "Min Total Price must be a valid number.";
    }

    if (!discountMessage.trim()) {
      newErrors.discountMessage = "Discount Message is required.";
    }
    if (!discountCode) {
      newErrors.discountCode = "Discount Code is required.";
    }
    if (!discountDateStart) {
      newErrors.discountDateStart = "Discount Start Date is required.";
    } else {
      const startDate = new Date(discountDateStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.discountDateStart =
          "Discount Start Date must be today or in the future.";
      }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateInputs() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/discount/create",
        {
          discountPrice: discountPrice.replace(/,/g, ""),
          minTotalPrice: minTotalPrice.replace(/,/g, ""),
          discountMessage,
          discountCode,
          discountDateStart,
          discountDateEnd,
          discountSlots: discountSlots.replace(/,/g, ""),
          discountAvailableSlots: discountSlots.replace(/,/g, ""),
          isActive,
          createdBy: user?.user._id,
          updatedBy: null,
        }
      );

      if (response.data.success) {
        // Hiển thị thông báo với discountCode thay vì ID
        notify(
          `Discount code "${discountCode}" created successfully!`,
          "success"
        );

        // Reset form values
        setDiscountPrice("");
        setMinTotalPrice("");
        setDiscountMessage("");
        setDiscountCode("");
        setDiscountDateStart("");
        setDiscountDateEnd("");
        setDiscountSlots("");
        setIsActive(true);
        setErrors({});

        // Đóng modal và cập nhật dữ liệu
        setTimeout(() => {
          onClose();
          // Gọi onCreate với dữ liệu mới để cập nhật UI mà không cần reload
          if (onCreate) {
            onCreate(response.data.discount);
          }
        }, 1500);
      } else {
        notify("Failed to create discount. Please try again.", "error");
      }
    } catch (error) {
      console.error(
        "Error creating discount:",
        error.response?.data || error.message
      );
      notify("Failed to create discount. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setDiscountCode(code);
  };

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDC">
        <h2 className="clrDarkBlue ffGTBold">Discount</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          <div className="formGroupDiscount ffGTBold fs-14">
            <label>Discount Price</label>
            <input
              type="text"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              onBlur={() => setDiscountPrice(formatCurrency(discountPrice))}
              placeholder="Enter discount price"
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
            />
            {errors.minTotalPrice && (
              <p className="error">{errors.minTotalPrice}</p>
            )}
          </div>
          <div className="editProfileInputGroupDiscount dFlex gap20">
            <div className="formGroupDiscount w50 ffGTBold fs-14">
              <label>Discount Start Date</label>
              <input
                type="date"
                value={discountDateStart}
                onChange={(e) => setDiscountDateStart(e.target.value)}
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
              />
              {errors.discountDateEnd && (
                <span className="error">{errors.discountDateEnd}</span>
              )}
            </div>
          </div>
          <div className="formGroupDiscount ffGTBold fs-14">
            <label>Discount Slots</label>
            <input
              type="text"
              value={discountSlots}
              onChange={(e) => setDiscountSlots(e.target.value)}
              onBlur={() => setDiscountSlots(formatCurrency(discountSlots))}
              placeholder="Enter discount slots"
            />
            {errors.discountSlots && (
              <p className="error">{errors.discountSlots}</p>
            )}
          </div>
          <div className="formGroupDiscount inputDiscountMessage ffGTBold fs-14">
            <label>Discount Message</label>
            <ReactQuill
              value={discountMessage}
              onChange={(e) => setDiscountMessage(e)}
              className="discountQuill"
              modules={toolbarOptions}
            />
            {errors.discountMessage && (
              <p className="error">{errors.discountMessage}</p>
            )}
          </div>
          <div className="formGroupDiscount ffGTBold fs-14">
            <label>Discount Code</label>
            <div className="codeContainer">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter discount code or click generate code"
              />
            </div>
            <button className="btnGenerateCode" onClick={generateCode}>
              Generate Code
            </button>
            {errors.discountCode && (
              <p className="error">{errors.discountCode}</p>
            )}
          </div>
        </div>
        <div className="ModalDCActions ffGTMedium fs-16">
          <button
            type="button"
            className="btnDC btnPrimaryDC"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className="btnDC btnSecondaryDC"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
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

export default CreateDiscountModal;
