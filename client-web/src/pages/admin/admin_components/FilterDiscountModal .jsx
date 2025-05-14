// import React, { useState } from "react";

// const FilterDiscountModal = ({ isOpen, onClose, onFilter }) => {
//   const [discountPriceMin, setDiscountPriceMin] = useState("");
//   const [discountPriceMax, setDiscountPriceMax] = useState("");
//   const [minTotalPriceMin, setMinTotalPriceMin] = useState("");
//   const [minTotalPriceMax, setMinTotalPriceMax] = useState("");
//   const [discountDateStart, setDiscountDateStart] = useState("");
//   const [discountDateEnd, setDiscountDateEnd] = useState("");
//   const [discountSlotsMin, setDiscountSlotsMin] = useState("");
//   const [discountSlotsMax, setDiscountSlotsMax] = useState("");
//   const [isActive, setIsActive] = useState(""); // Added for isActive filter

//   if (!isOpen) return null;

//   // Hàm định dạng: mỗi 3 số cách nhau bởi dấu phẩy
//   const formatCurrency = (value) => {
//     const num = value.replace(/\D/g, "");
//     if (!num) return "";
//     return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };

//   // Hàm kiểm tra lỗi cho các trường số và ngày
//   const validateFilter = () => {
//     if (discountPriceMin !== "" && discountPriceMax !== "") {
//       if (
//         Number(discountPriceMin.replace(/,/g, "")) >
//         Number(discountPriceMax.replace(/,/g, ""))
//       ) {
//         alert("Discount Price: Giá trị Min không được lớn hơn giá trị Max.");
//         return false;
//       }
//     }
//     if (minTotalPriceMin !== "" && minTotalPriceMax !== "") {
//       if (
//         Number(minTotalPriceMin.replace(/,/g, "")) >
//         Number(minTotalPriceMax.replace(/,/g, ""))
//       ) {
//         alert("Min Total Price: Giá trị Min không được lớn hơn giá trị Max.");
//         return false;
//       }
//     }
//     if (discountSlotsMin !== "" && discountSlotsMax !== "") {
//       if (
//         Number(discountSlotsMin.replace(/,/g, "")) >
//         Number(discountSlotsMax.replace(/,/g, ""))
//       ) {
//         alert("Discount Slots: Giá trị Min không được lớn hơn giá trị Max.");
//         return false;
//       }
//     }
//     if (discountDateStart !== "" && discountDateEnd !== "") {
//       if (new Date(discountDateStart) > new Date(discountDateEnd)) {
//         alert("Discount Date: Ngày bắt đầu không được muộn hơn ngày kết thúc.");
//         return false;
//       }
//     }
//     return true;
//   };

//   // Khi người dùng click Filter, chỉ lấy các trường có giá trị và gửi qua callback onFilter
//   const handleFilter = (e) => {
//     if (e && e.preventDefault) e.preventDefault();
//     if (!validateFilter()) return;

//     const filters = {};
//     if (discountPriceMin.trim() !== "") {
//       filters.discountPriceMin = discountPriceMin.replace(/,/g, "");
//     }
//     if (discountPriceMax.trim() !== "") {
//       filters.discountPriceMax = discountPriceMax.replace(/,/g, "");
//     }
//     if (minTotalPriceMin.trim() !== "") {
//       filters.minTotalPriceMin = minTotalPriceMin.replace(/,/g, "");
//     }
//     if (minTotalPriceMax.trim() !== "") {
//       filters.minTotalPriceMax = minTotalPriceMax.replace(/,/g, "");
//     }
//     if (discountDateStart.trim() !== "") {
//       filters.discountDateStart = discountDateStart;
//     }
//     if (discountDateEnd.trim() !== "") {
//       filters.discountDateEnd = discountDateEnd;
//     }
//     if (discountSlotsMin.trim() !== "") {
//       filters.discountSlotsMin = discountSlotsMin.replace(/,/g, "");
//     }
//     if (discountSlotsMax.trim() !== "") {
//       filters.discountSlotsMax = discountSlotsMax.replace(/,/g, "");
//     }
//     if (isActive !== "") {
//       filters.isActive = isActive; // Added for isActive filter
//     }

//     if (onFilter) onFilter(filters);
//     onClose();
//   };

//   return (
//     <div className="ModalDCBackdrop">
//       <div className="ModalDC">
//         <h2 className="clrDarkBlue ffGTBold">Filter Discount</h2>
//         <div className="line"></div>
//         <div className="ModalDC-body">
//           {/* Discount Price */}
//           <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
//             <div className="formGroupDiscount w50">
//               <label>Discount Price (Min)</label>
//               <input
//                 type="text"
//                 value={discountPriceMin}
//                 onChange={(e) => setDiscountPriceMin(e.target.value)}
//                 onBlur={() =>
//                   setDiscountPriceMin(formatCurrency(discountPriceMin))
//                 }
//                 placeholder="Enter minimum discount price"
//               />
//             </div>
//             <div className="formGroupDiscount w50">
//               <label>Discount Price (Max)</label>
//               <input
//                 type="text"
//                 value={discountPriceMax}
//                 onChange={(e) => setDiscountPriceMax(e.target.value)}
//                 onBlur={() =>
//                   setDiscountPriceMax(formatCurrency(discountPriceMax))
//                 }
//                 placeholder="Enter maximum discount price"
//               />
//             </div>
//           </div>
//           {/* Min Total Price */}
//           <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
//             <div className="formGroupDiscount w50">
//               <label>Min Total Price (Min)</label>
//               <input
//                 type="text"
//                 value={minTotalPriceMin}
//                 onChange={(e) => setMinTotalPriceMin(e.target.value)}
//                 onBlur={() =>
//                   setMinTotalPriceMin(formatCurrency(minTotalPriceMin))
//                 }
//                 placeholder="Enter minimum total price (min)"
//               />
//             </div>
//             <div className="formGroupDiscount w50">
//               <label>Min Total Price (Max)</label>
//               <input
//                 type="text"
//                 value={minTotalPriceMax}
//                 onChange={(e) => setMinTotalPriceMax(e.target.value)}
//                 onBlur={() =>
//                   setMinTotalPriceMax(formatCurrency(minTotalPriceMax))
//                 }
//                 placeholder="Enter minimum total price (max)"
//               />
//             </div>
//           </div>
//           {/* Discount Date */}
//           <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
//             <div className="formGroupDiscount  w50">
//               <label>Discount Date Start</label>
//               <input
//                 type="date"
//                 value={discountDateStart}
//                 onChange={(e) => setDiscountDateStart(e.target.value)}
//               />
//             </div>
//             <div className="formGroupDiscount  w50">
//               <label>Discount Date End</label>
//               <input
//                 type="date"
//                 value={discountDateEnd}
//                 onChange={(e) => setDiscountDateEnd(e.target.value)}
//               />
//             </div>
//           </div>
//           {/* Discount Slots */}
//           <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
//             <div className="formGroupDiscount w50">
//               <label>Discount Slots (Min)</label>
//               <input
//                 type="text"
//                 value={discountSlotsMin}
//                 onChange={(e) => setDiscountSlotsMin(e.target.value)}
//                 onBlur={() =>
//                   setDiscountSlotsMin(formatCurrency(discountSlotsMin))
//                 }
//                 placeholder="Enter minimum discount slots"
//               />
//             </div>
//             <div className="formGroupDiscount w50">
//               <label>Discount Slots (Max)</label>
//               <input
//                 type="text"
//                 value={discountSlotsMax}
//                 onChange={(e) => setDiscountSlotsMax(e.target.value)}
//                 onBlur={() =>
//                   setDiscountSlotsMax(formatCurrency(discountSlotsMax))
//                 }
//                 placeholder="Enter maximum discount slots"
//               />
//             </div>
//           </div>
//           {/* Active Status */}
//           <div
//             className="editInputGroupDiscount formGroupDiscount dFlex gap20 ffGTBold fs-14"
//             style={{
//               flexDirection: "row-reverse",
//             }}
//           >
//             <label>Active Status:</label>
//             <select
//               value={isActive}
//               onChange={(e) => setIsActive(e.target.value)}
//               style={{
//                 padding: "4px 4px",
//                 border: "1px solid #ccc",
//                 borderRadius: "5px",
//               }}
//             >
//               <option value="">All</option>
//               <option value="true">Active</option>
//               <option value="false">Inactive</option>
//             </select>
//           </div>
//         </div>
//         <div className="ModalDCActions ffGTMedium fs-16">
//           <button
//             type="button"
//             className="btnDC btnPrimaryDC"
//             onClick={handleFilter}
//           >
//             Filter
//           </button>
//           <button
//             type="button"
//             className="btnDC btnSecondaryDC"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FilterDiscountModal;
import React, { useState } from "react";

const FilterDiscountModal = ({ isOpen, onClose, onFilter }) => {
  const [discountPriceMin, setDiscountPriceMin] = useState("");
  const [discountPriceMax, setDiscountPriceMax] = useState("");
  const [minTotalPriceMin, setMinTotalPriceMin] = useState("");
  const [minTotalPriceMax, setMinTotalPriceMax] = useState("");
  const [discountDateStart, setDiscountDateStart] = useState("");
  const [discountDateEnd, setDiscountDateEnd] = useState("");
  const [discountSlotsMin, setDiscountSlotsMin] = useState("");
  const [discountSlotsMax, setDiscountSlotsMax] = useState("");
  const [isActive, setIsActive] = useState(""); // Added for isActive filter

  if (!isOpen) return null;

  // Hàm định dạng: mỗi 3 số cách nhau bởi dấu phẩy
  const formatCurrency = (value) => {
    const num = value.replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Hàm kiểm tra lỗi cho các trường số và ngày
  const validateFilter = () => {
    if (discountPriceMin !== "" && discountPriceMax !== "") {
      if (
        Number(discountPriceMin.replace(/,/g, "")) >
        Number(discountPriceMax.replace(/,/g, ""))
      ) {
        alert(
          "Discount Price: The Min value cannot be greater than the Max value."
        );
        return false;
      }
    }
    if (minTotalPriceMin !== "" && minTotalPriceMax !== "") {
      if (
        Number(minTotalPriceMin.replace(/,/g, "")) >
        Number(minTotalPriceMax.replace(/,/g, ""))
      ) {
        alert(
          "Min Total Price: The Min value cannot be greater than the Max value."
        );
        return false;
      }
    }
    if (discountSlotsMin !== "" && discountSlotsMax !== "") {
      if (
        Number(discountSlotsMin.replace(/,/g, "")) >
        Number(discountSlotsMax.replace(/,/g, ""))
      ) {
        alert(
          "Discount Slots: The Min value cannot be greater than the Max value."
        );
        return false;
      }
    }
    if (discountDateStart !== "" && discountDateEnd !== "") {
      if (new Date(discountDateStart) > new Date(discountDateEnd)) {
        alert(
          "Discount Date: The start date cannot be later than the end date."
        );
        return false;
      }
    }
    return true;
  };

  // Khi người dùng click Filter, chỉ lấy các trường có giá trị và gửi qua callback onFilter
  const handleFilter = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateFilter()) return;

    const filters = {};
    if (discountPriceMin.trim() !== "") {
      filters.discountPriceMin = discountPriceMin.replace(/,/g, "");
    }
    if (discountPriceMax.trim() !== "") {
      filters.discountPriceMax = discountPriceMax.replace(/,/g, "");
    }
    if (minTotalPriceMin.trim() !== "") {
      filters.minTotalPriceMin = minTotalPriceMin.replace(/,/g, "");
    }
    if (minTotalPriceMax.trim() !== "") {
      filters.minTotalPriceMax = minTotalPriceMax.replace(/,/g, "");
    }
    if (discountDateStart.trim() !== "") {
      filters.discountDateStart = discountDateStart;
    }
    if (discountDateEnd.trim() !== "") {
      filters.discountDateEnd = discountDateEnd;
    }
    if (discountSlotsMin.trim() !== "") {
      filters.discountSlotsMin = discountSlotsMin.replace(/,/g, "");
    }
    if (discountSlotsMax.trim() !== "") {
      filters.discountSlotsMax = discountSlotsMax.replace(/,/g, "");
    }
    if (isActive !== "") {
      filters.isActive = isActive; // Added for isActive filter
    }

    if (onFilter) onFilter(filters);
    onClose();
  };

  return (
    <div className="ModalDCBackdrop">
      <div className="ModalDC">
        <h2 className="clrDarkBlue ffGTBold">Filter Discount</h2>
        <div className="line"></div>
        <div className="ModalDC-body">
          {/* Discount Price */}
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Discount Price (Min)</label>
              <input
                type="text"
                value={discountPriceMin}
                onChange={(e) => setDiscountPriceMin(e.target.value)}
                onBlur={() =>
                  setDiscountPriceMin(formatCurrency(discountPriceMin))
                }
                placeholder="Enter minimum discount price"
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Discount Price (Max)</label>
              <input
                type="text"
                value={discountPriceMax}
                onChange={(e) => setDiscountPriceMax(e.target.value)}
                onBlur={() =>
                  setDiscountPriceMax(formatCurrency(discountPriceMax))
                }
                placeholder="Enter maximum discount price"
              />
            </div>
          </div>
          {/* Min Total Price */}
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Min Total Price (Min)</label>
              <input
                type="text"
                value={minTotalPriceMin}
                onChange={(e) => setMinTotalPriceMin(e.target.value)}
                onBlur={() =>
                  setMinTotalPriceMin(formatCurrency(minTotalPriceMin))
                }
                placeholder="Enter minimum total price (min)"
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Min Total Price (Max)</label>
              <input
                type="text"
                value={minTotalPriceMax}
                onChange={(e) => setMinTotalPriceMax(e.target.value)}
                onBlur={() =>
                  setMinTotalPriceMax(formatCurrency(minTotalPriceMax))
                }
                placeholder="Enter minimum total price (max)"
              />
            </div>
          </div>
          {/* Discount Date */}
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount  w50">
              <label>Discount Date Start</label>
              <input
                type="date"
                value={discountDateStart}
                onChange={(e) => setDiscountDateStart(e.target.value)}
              />
            </div>
            <div className="formGroupDiscount  w50">
              <label>Discount Date End</label>
              <input
                type="date"
                value={discountDateEnd}
                onChange={(e) => setDiscountDateEnd(e.target.value)}
              />
            </div>
          </div>
          {/* Discount Slots */}
          <div className="editInputGroupDiscount dFlex gap20 ffGTBold fs-14">
            <div className="formGroupDiscount w50">
              <label>Discount Slots (Min)</label>
              <input
                type="text"
                value={discountSlotsMin}
                onChange={(e) => setDiscountSlotsMin(e.target.value)}
                onBlur={() =>
                  setDiscountSlotsMin(formatCurrency(discountSlotsMin))
                }
                placeholder="Enter minimum discount slots"
              />
            </div>
            <div className="formGroupDiscount w50">
              <label>Discount Slots (Max)</label>
              <input
                type="text"
                value={discountSlotsMax}
                onChange={(e) => setDiscountSlotsMax(e.target.value)}
                onBlur={() =>
                  setDiscountSlotsMax(formatCurrency(discountSlotsMax))
                }
                placeholder="Enter maximum discount slots"
              />
            </div>
          </div>
          {/* Active Status */}
          <div
            className="editInputGroupDiscount formGroupDiscount dFlex gap20 ffGTBold fs-14"
            style={{
              flexDirection: "row-reverse",
            }}
          >
            <label>Active Status:</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              style={{
                padding: "4px 4px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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

export default FilterDiscountModal;
