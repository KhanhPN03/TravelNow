function Pagination({ totalRows, rowsPerPage, setCurrentPage, currentPage }) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  console.log(totalPages);
  const getPages = () => {
    const pages = [];

    // Luôn hiển thị trang đầu tiên
    pages.push(1);

    // Hiển thị dấu "..." nếu khoảng cách lớn giữa trang đầu tiên và các trang lân cận
    if (currentPage > 3) {
      pages.push("...");
    }

    // Hiển thị các trang gần trang hiện tại
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // Hiển thị dấu "..." nếu khoảng cách lớn giữa trang cuối cùng và các trang lân cận
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Luôn hiển thị trang cuối cùng
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();
  return (
    <div className="paginationContainerAdmin">
      {/* Nút Prev */}
      <button
        className="buttonPaginationAdmin"
        style={{      
          backgroundColor: currentPage === 1 ? "lightgray" : "white",
          color: currentPage === 1 ? "darkgray" : "#858995",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
      >
        <i class='bx bx-chevron-left'></i>
      </button>

      {/* Các trang */}
      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={index}
              className="threeDotPaginationAdmin"          
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={index}
            className="numberPagePaginationAdmin"
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
        className="buttonPaginationAdmin"
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
        <i class='bx bx-chevron-right'></i>
      </button>
    </div>
  );
}

export default Pagination;
