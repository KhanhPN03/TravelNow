import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-CA"); // "YYYY-MM-DD" format
};

// Add border to cell
const fillCellBorder = (cell) => {
  cell.border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  };
};

// Center-align cell
const cellAlignCenter = (cell) => {
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
};

// Style table header
const tableHeader = (cell) => {
  cell.font = {
    name: "Arial",
    size: 13,
    bold: true,
  };
};
const formatDateForFilename = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};
// Convert image to base64
const toDataURL = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.readAsDataURL(xhr.response);
      reader.onloadend = function () {
        const base64 = reader.result;
        if (base64 && base64.startsWith("data:image/")) {
          resolve(base64);
        } else {
          reject(new Error("Invalid base64 image data"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read image data"));
    };
    xhr.onerror = () => reject(new Error("Failed to fetch image"));
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  });
};

export default async function ExportSubsidiaryTourToExcel(tours) {
  console.log("Exporting subsidiary tours:", tours);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Subsidiary Tours", {
    pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
    properties: { tabColor: { argb: "FF00FF00" } },
    views: [{ showGridLines: false }],
  });

  // Add logo in row 1
  let logoId;
  try {
    const logoBase64 =
      "data:image/png;base64,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";

    console.log("Logo base64:", logoBase64.substring(0, 50));
    logoId = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });
    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 84, height: 64 },
    });
  } catch (error) {
    console.error("Failed to load logo:", error);
  }

  // Add header in merged cells A2:G2
  const headerCell = worksheet.getCell("A2");
  headerCell.value = "TravelNow Co.,ltd";
  worksheet.mergeCells("A2:O2");
  headerCell.alignment = { horizontal: "center", vertical: "middle" };
  headerCell.font = {
    name: "Arial",
    size: 20,
    bold: true,
  };
  worksheet.getRow(2).height = 30;

  worksheet.addRow([]); // Spacer row (row 3)

  // Define columns for tour data
  worksheet.columns = [
    { key: "no", width: 6 },
    { key: "subTourCode", width: 20 },
    { key: "originalTourCode", width: 20 },
    { key: "title", width: 50 }, // Increased width for longer titles
    { key: "duration", width: 12 },
    { key: "dateStart", width: 18 },
    { key: "dateEnd", width: 14 },
    { key: "category", width: 12 },
    { key: "totalSlots", width: 12 },
    { key: "availableSlots", width: 12 },
    { key: "price", width: 12 },
    { key: "status", width: 12 },
    { key: "revenue", width: 12 },
    { key: "createdAt", width: 14 },
    { key: "createdBy", width: 14 },
  ];

  // Add table header (row 4)
  worksheet
    .addRow([
      "No.",
      "Sub Tour Code",
      "Original Tour Code",
      "Title",
      "Duration",
      "Date Start",
      "Date End",
      "Category",
      "Total Slots",
      "Available Slots",
      "Price",
      "Status",
      "Revenue",
      "Created At",
      "Created By",
    ])
    .eachCell((cell) => {
      fillCellBorder(cell);
      cellAlignCenter(cell);
      tableHeader(cell);
    });

  // Add tour data
  tours.forEach((tour, index) => {
    const row = worksheet.addRow([
      index + 1,
      tour.subTourCode || "N/A",
      tour.originalTourCode || "N/A",
      tour.title || "N/A",
      tour.duration || "N/A",
      tour.dateStart || "N/A",
      tour.dateEnd || "N/A",
      tour.category || "N/A",
      tour.totalSlots || "N/A",
      tour.availableSlots || "N/A",
      tour.price ? `${tour.price}₫` : "N/A",
      tour.status || "N/A",
      tour.revenue ? `${tour.revenue}₫` : "N/A",
      tour.createdAt || "N/A",
      tour.createdBy || "N/A",
    ]);

    row.eachCell((cell, colNumber) => {
      fillCellBorder(cell);
      if (colNumber === 4) {
        // Title column
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      } else if (colNumber === 1 || colNumber >= 5) {
        cellAlignCenter(cell);
      }
    });

    // Dynamically adjust row height based on title length
    const title = tour.title || "";
    if (title.length > 30) {
      const lines = Math.ceil(title.length / 40); // Estimate lines needed
      row.height = Math.max(15, lines * 15); // Minimum 15, increase per line
    }
  });

  // Add footer rows
  worksheet.addRow([]); // Spacer row
  const today = new Date();
  const date = formatDate(today);
  worksheet.addRow([
    `Total subsidiary tours assigned to ${date} is ${tours.length}`,
  ]);
  worksheet.addRow([`This report is created at ${date}`]);
  const signed = worksheet.addRow(["Signatures          "]);
  signed.alignment = { horizontal: "right" };

  // Merge cells for footer
  const currentRowIdx = worksheet.rowCount;
  const endColumnIdx = worksheet.columnCount;
  worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, endColumnIdx);

  // Write and download the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `SubsidiaryTours_${formatDateForFilename()}.xlsx`);
}
