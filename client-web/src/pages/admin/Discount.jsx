import React, { useEffect, useState, useContext } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TableContentDiscount from "./admin_components/TableContentDiscount";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import axios from "axios";
import UserToExcel from "./admin_components/UserToExcel";
import CreateDiscountModal from "./admin_components/CreateDiscount";
import FilterDiscountModal from "./admin_components/FilterDiscountModal ";
import SortDiscountModal from "./admin_components/SortDiscountModal";
import DeleteModal from "./admin_components/DeleteModal";
import ChartDiscount from "./admin_components/ChartDiscount";
import DiscountCodeChart from "./admin_components/DiscountCodeChart";
import UpdateDiscountModal from "./admin_components/UpdateDiscountModal";
import { ToastContainer, toast } from "react-toastify";
import { Context } from "../../context/ContextProvider";
import PlaceHolder from "./admin_components/PlaceHolder";

const columnsWithImage = [
  { key: "discountPrice", label: "Discount Price" },
  { key: "discountCode", label: "Discount Code" },
  { key: "discountDateStart", label: "Date Start" },
  { key: "discountDateEnd", label: "Date End" },
  { key: "discountSlots", label: "Discount Slots" },
  { key: "discountAvailableSlots", label: "Available Slots" },
];

const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return "";
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Discount() {
  const [discountData, setDiscountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState(null);
  const [isSortModalOpen, setSortModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const { user } = useContext(Context);
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

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/discount");
      const discounts = response.data.discounts;
      const formattedDiscounts = discounts
        .filter((discount) => !discount.deleted)
        .map((discount) => ({
          ...discount,
          discountDateStartOriginal: discount.discountDateStart,
          discountDateEndOriginal: discount.discountDateEnd,
          discountDateStart: formatDateForDisplay(discount.discountDateStart),
          discountDateEnd: formatDateForDisplay(discount.discountDateEnd),
        }));
      setDiscountData(formattedDiscounts);
    } catch (error) {
      console.error("Error fetching discount data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [isDeleteModalOpen]);

  const parseFormattedDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const date = new Date(parts[2], parts[1] - 1, parts[0]);
    return isNaN(date.getTime()) ? null : date;
  };

  const filteredDiscountData = discountData.filter((discount) => {
    const query = searchQuery.toLowerCase();
    const searchPass =
      discount.discountCode?.toLowerCase().includes(query) ||
      discount.discountPrice?.toString().includes(query);

    if (filterCriteria) {
      if (
        filterCriteria.discountPriceMin &&
        discount.discountPrice < Number(filterCriteria.discountPriceMin)
      )
        return false;
      if (
        filterCriteria.discountPriceMax &&
        discount.discountPrice > Number(filterCriteria.discountPriceMax)
      )
        return false;
      if (
        filterCriteria.discountSlotsMin &&
        discount.discountSlots < Number(filterCriteria.discountSlotsMin)
      )
        return false;
      if (
        filterCriteria.discountSlotsMax &&
        discount.discountSlots > Number(filterCriteria.discountSlotsMax)
      )
        return false;

      if (filterCriteria.discountDateStart) {
        const recordStart = parseFormattedDate(discount.discountDateStart);
        const filterStart = new Date(filterCriteria.discountDateStart);
        if (recordStart < filterStart) return false;
      }
      if (filterCriteria.discountDateEnd) {
        const recordEnd = parseFormattedDate(discount.discountDateEnd);
        const filterEnd = new Date(filterCriteria.discountDateEnd);
        if (recordEnd > filterEnd) return false;
      }

      if (
        filterCriteria.isActive !== undefined &&
        discount.isActive !== JSON.parse(filterCriteria.isActive)
      ) {
        return false;
      }
    }

    return searchPass;
  });

  const sortedDiscountData = [...filteredDiscountData];
  if (sortCriteria && sortCriteria.field) {
    sortedDiscountData.sort((a, b) => {
      let aValue = a[sortCriteria.field];
      let bValue = b[sortCriteria.field];

      if (["discountPrice", "discountSlots"].includes(sortCriteria.field)) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      if (
        ["discountDateStart", "discountDateEnd"].includes(sortCriteria.field)
      ) {
        aValue = parseFormattedDate(aValue);
        bValue = parseFormattedDate(bValue);
      }
      if (aValue < bValue) return sortCriteria.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sortCriteria.order === "asc" ? 1 : -1;
      return 0;
    });
  }

  const lastPostIndex = currentPage * rowsPerPage;
  const firstPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = sortedDiscountData.slice(firstPostIndex, lastPostIndex);

  const handleCreateDiscount = (newDiscount) => {
    // Format dates for display
    newDiscount.discountDateStartOriginal = newDiscount.discountDateStart;
    newDiscount.discountDateEndOriginal = newDiscount.discountDateEnd;
    newDiscount.discountDateStart = formatDateForDisplay(
      newDiscount.discountDateStart
    );
    newDiscount.discountDateEnd = formatDateForDisplay(
      newDiscount.discountDateEnd
    );

    setDiscountData((prev) => [newDiscount, ...prev]);

    setCurrentPage(1);

    setModalOpen(false);
    notify(`Discount restored successfully`, "success");

    fetchDiscounts();
  };

  const handleFilter = (filters) => {
    setFilterCriteria(filters);
  };

  const handleSort = (sortConfig) => {
    setSortCriteria(sortConfig);
  };

  const handleUpdateDiscount = (discount) => {
    setSelectedDiscount(discount);
    setUpdateModalOpen(true);
  };

  const handleDiscountUpdated = (updatedDiscount) => {
    setUpdateModalOpen(false);
    setSelectedDiscount(null);
    fetchDiscounts();
  };
  const handleSoftDelete = async () => {
    try {
      console.log("User:", user);
      if (!user || !user.user._id) {
        notify("User not authenticated", "error");
        return;
      }

      if (!selectedRows.length) {
        notify("No discounts selected", "warn");
        return;
      }

      console.log("Selected Rows:", selectedRows);
      console.log("User ID:", user.user._id);

      const results = await Promise.all(
        selectedRows.map(async (id) => {
          try {
            const res = await axios.delete(
              `http://localhost:5000/discount/softDelete/${id}/${user.user._id}`
            );
            return { id, success: res.data.success, message: res.data.message };
          } catch (err) {
            console.error(`Error deleting discount ${id}:`, err);
            return {
              id,
              success: false,
              message:
                err.response?.data?.message || "Failed to delete discount",
            };
          }
        })
      );

      results.forEach((result) => {
        if (result.success) {
          notify(`Discount moved to trash successfully`, "success");
        } else {
          notify(`Discount ${result.id}: ${result.message}`, "warn");
        }
      });

      setSelectedRows([]);
      setDeleteModalOpen(false);
      fetchDiscounts();
    } catch (error) {
      console.error("Error soft deleting discounts:", error);
      notify("Unexpected error occurred while deleting discounts", "error");
    }
  };
  const handleOpenDeleteModal = () => {
    if (selectedRows.length > 0) {
      setDeleteModalOpen(true);
    } else {
      notify("Please select at least one discount to delete.", "warn");
    }
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <AdminHeader />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 50,
            width: "100%",
            maxWidth: "1100px",
            marginTop: 50,
          }}
        >
          <WrapperTable
            hasTabTransform={false}
            hasSelectDateTab={false}
            hasSelectDiscount={true}
            hasFeedbackTab={false}
            backLinkFeedback=""
          >
            <div className="tableContainerAdmin">
              <ActionTableWrapper
                hasLeftDeleteButton={false}
                leftDeleteButtonFunction={() => {}}
                hasRightActionButtons={true}
                rightAddButtonFunction={() => setModalOpen(true)}
                rightDeleteButtonFunction={handleOpenDeleteModal}
                rightExportExcelFunction={() => UserToExcel(discountData)}
                hasLeftAction={true}
                onSearchChange={(query) => setSearchQuery(query)}
                onFilterClick={() => setFilterModalOpen(true)}
                onSortClick={() => setSortModalOpen(true)}
                hasLeftActionSort={false}
                hasAdd={true}
                hasDelete={true}
                hasExportExcel={true}
                hasFilter={true}
                hasSearch={true}
              />
              {loading ? (
                <p>Loading...</p>
              ) : sortedDiscountData.length === 0 ? (
                <PlaceHolder type="data" />
              ) : (
                <>
                  <TableContentDiscount
                    columns={columnsWithImage}
                    data={currentRows}
                    backgroundColorButton="var(--clr-orange)"
                    labelButton="View details"
                    hasCheckbox={true}
                    updateCustomer={handleDiscountUpdated}
                    setSelectedRowsDelete={setSelectedRows}
                    hasAction={true}
                    onSort={handleSort}
                  />
                  <div className="paginationWrapper">
                    <Pagination
                      totalRows={sortedDiscountData.length}
                      rowsPerPage={rowsPerPage}
                      setCurrentPage={setCurrentPage}
                      currentPage={currentPage}
                    />
                  </div>
                </>
              )}
            </div>
          </WrapperTable>
          <div className="statisticCardsContainer">
            <div className="contenChartAdmin">
              {loading ? <p>Loading...</p> : <ChartDiscount />}
              {loading ? <p>Loading...</p> : <DiscountCodeChart />}
            </div>
          </div>
        </div>
      </div>
      <CreateDiscountModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateDiscount}
      />
      <UpdateDiscountModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedDiscount(null);
        }}
        onUpdate={handleDiscountUpdated}
        discount={selectedDiscount}
      />
      {isFilterModalOpen && (
        <FilterDiscountModal
          isOpen={isFilterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onFilter={handleFilter}
        />
      )}
      {isSortModalOpen && (
        <SortDiscountModal
          isOpen={isSortModalOpen}
          onClose={() => setSortModalOpen(false)}
          onSort={handleSort}
        />
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleSoftDelete}
        selectedCount={selectedRows.length}
      />
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}
