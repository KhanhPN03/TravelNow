import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "react-quill/dist/quill.snow.css";

import React, { useState } from "react";

import ReactQuill from "react-quill";
import TimePicker from "react-time-picker";
import CurrencyInput from "react-currency-input-field";

export default function FormInputCreateTour({
  fieldName,
  fieldObj,
  formData,
  setFormData,
  isNum,
  disabled,
  error,
}) {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      if (id === "dateStart") {
        return {
          ...prev,
          dateStart: { ...prev.dateStart, date: value },
        };
      }
      return {
        ...prev,
        [id]: value,
      };
    });
  };

  const handleChangeNum = (e) => {
    const { id, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData((prev) => {
        return {
          ...prev,
          [id]: value === "" ? 0 : parseInt(value, 10),
        };
      });
    }
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      description: e,
    }));
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      dateStart: {
        ...prev.dateStart,
        time: e,
      },
    }));
  };

  const handlePriceChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      price: e,
    }));
  };

  const toolbarOptions = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Handle invalid date
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  return (
    <div className="formInputContainer clrDarkBlue">
      <label htmlFor={fieldObj}>{fieldName}</label>
      {fieldObj === "description" ? (
        <>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={handleDescriptionChange}
            modules={toolbarOptions}
            readOnly={disabled}
          />
          <p className="createTourErrorMessage">{error && error}</p>
        </>
      ) : fieldObj === "timeStart" ? (
        <>
          <TimePicker
            onChange={handleDateChange}
            value={formData["dateStart"].time}
            format="hh:mm a" // Đảm bảo hiển thị AM/PM
            // amPmAriaLabel="Select AM/PM" // Nhãn cho lựa chọn AM/PM
            disableClock={true}
            disabled={disabled}
          />

          <p className="createTourErrorMessage">{error && error}</p>
        </>
      ) : fieldObj === "price" ? (
        <>
          <CurrencyInput
            id="input-example"
            name="tourPrice"
            prefix="đ"
            value={formData.price || 0}
            // defaultValue={0}
            decimalsLimit={2}
            onValueChange={(value, name, values) => handlePriceChange(value)}
            disabled={disabled}
          />
          <p className="createTourErrorMessage">{error && error}</p>
        </>
      ) : (
        <>
          <input
            className="mt6CreateTour"
            type={fieldObj === "dateStart" ? "date" : "text"}
            id={fieldObj}
            value={
              fieldObj === "dateStart"
                ? formatDateForInput(formData["dateStart"].date) // Format the date
                : formData[fieldObj] || ""
            }
            onChange={isNum ? handleChangeNum : handleChange}
            disabled={disabled}
          />
          <p className="createTourErrorMessage">{error && error}</p>
        </>
      )}
    </div>
  );
}
