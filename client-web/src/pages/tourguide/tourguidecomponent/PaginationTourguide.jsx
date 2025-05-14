import React from "react";

function PaginationTourguide({
  totalRows,
  rowsPerPage,
  setCurrentPage,
  currentPage,
}) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const getPages = () => {
    const pages = [];
    // Luôn hiển thị trang đầu tiên
    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="paginationContainerTourguide">
      {/* Nút Prev */}
      <button
        className="buttonPaginationTourguide"
        style={{
          backgroundColor: currentPage === 1 ? "lightgray" : "white",
          color: currentPage === 1 ? "darkgray" : "#858995",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
      >
        <i className="bx bx-chevron-left"></i>
      </button>

      {/* Các số trang */}
      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={index} className="threeDotPaginationAdmin">
              ...
            </span>
          );
        }
        return (
          <button
            key={index}
            className="numberPagePaginationTourguide"
            style={{
              backgroundColor: page === currentPage ? "#1A2B49" : "white",
              color: page === currentPage ? "white" : "black",
            }}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        );
      })}

      {/* Nút Next */}
      <button
        className="buttonPaginationTourguide"
        style={{
          backgroundColor: currentPage === totalPages ? "lightgray" : "white",
          color: currentPage === totalPages ? "darkgray" : "#858995",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
        disabled={currentPage === totalPages}
        onClick={() =>
          currentPage < totalPages && setCurrentPage(currentPage + 1)
        }
      >
        <i className="bx bx-chevron-right"></i>
      </button>
    </div>
  );
}

export default PaginationTourguide;
