import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import WrapperTable from "./admin_components/WrapperTable";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SortFilterModal from "./admin_components/SortFilterModalAccount";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import AdminGraphicsChart from "./admin_components/AdminGraphicsChart";
import UserToExcel from "./admin_components/UserToExcel";
import DeleteModal from "./admin_components/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "../../context/ContextProvider";
import PlaceHolder from "./admin_components/PlaceHolder";

const columnsWithImage = ["username", "email", "phone", "firstname"];

export default function AdminList() {
  const type = "Admins";
  const { user } = useContext(Context);
  const userId = user?.user?._id;

  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataBeforeSearch, setFilteredDataBeforeSearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    gender: "",
    dobStart: "",
    dobEnd: "",
    createdAtStart: "",
    createdAtEnd: "",
  });

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

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/account/superAdmin/"
      );
      const admins = response.data.admins || [];
      setAdminData(admins);
      setFilteredData(admins);
      setFilteredDataBeforeSearch(admins);
    } catch (error) {
      console.error("Error fetching data:", error);
      notify("Failed to fetch admins", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateAdmin = async (updatedAdmin) => {
    try {
      const updateResponse = await axios.put(
        `http://localhost:5000/account/superAdmin/${updatedAdmin._id}`,
        updatedAdmin
      );

      if (updateResponse.data.success) {
        notify("Admin updated successfully!", "success");
        await fetchAdmins(); // Refresh admin list
        return Promise.resolve(); // Resolve to indicate success
      }
    } catch (error) {
      let errorMessage = "Failed to update admin. Please try again.";
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message === "Email already exists in the database"
      ) {
        errorMessage = "Email already exists. Please use a different email.";
      }
      notify(errorMessage, "error");
      throw new Error(errorMessage); // Reject with error message
    }
  };

  const handleFilter = (newFilterConfig) => {
    let filtered = [...adminData];

    if (newFilterConfig.gender) {
      filtered = filtered.filter(
        (admin) => admin.gender === newFilterConfig.gender
      );
    }
    if (newFilterConfig.dobStart) {
      filtered = filtered.filter(
        (admin) => new Date(admin.DOB) >= new Date(newFilterConfig.dobStart)
      );
    }
    if (newFilterConfig.dobEnd) {
      filtered = filtered.filter(
        (admin) => new Date(admin.DOB) <= new Date(newFilterConfig.dobEnd)
      );
    }
    if (newFilterConfig.createdAtStart) {
      filtered = filtered.filter(
        (admin) =>
          new Date(admin.createdAt) >= new Date(newFilterConfig.createdAtStart)
      );
    }
    if (newFilterConfig.createdAtEnd) {
      filtered = filtered.filter(
        (admin) =>
          new Date(admin.createdAt) <= new Date(newFilterConfig.createdAtEnd)
      );
    }
    if (newFilterConfig.birthMonth) {
      filtered = filtered.filter(
        (admin) =>
          new Date(admin.DOB).getMonth() + 1 ===
          parseInt(newFilterConfig.birthMonth)
      );
    }

    setFilteredData(filtered);
    setFilteredDataBeforeSearch(filtered);
    setFilterConfig(newFilterConfig);
  };

  const openSortFilterModal = () => {
    setFilterModalOpen(true);
  };

  const closeSortFilterModal = () => {
    setFilterModalOpen(false);
  };

  const openDeleteModal = () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one admin to delete", "warn");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const softDeleteAdmin = async () => {
    try {
      const deletePromises = selectedRows.map((id) =>
        axios.delete(
          `http://localhost:5000/account/superAdmin/softDelete/${id}/${userId}`
        )
      );
      const responses = await Promise.all(deletePromises);

      const failedDeletions = responses.filter((res) => !res.data.success);
      if (failedDeletions.length > 0) {
        failedDeletions.forEach((res) => {
          notify(res.data.message || "Failed to delete an admin", "warn");
        });
      }

      await fetchAdmins();
      setSelectedRows([]);

      if (failedDeletions.length === 0) {
        notify("Selected admins soft deleted successfully", "success");
      }
    } catch (error) {
      console.error(
        "Error deleting admin:",
        error.response?.data || error.message
      );
      notify(
        error.response?.data?.message ||
          "Failed to soft delete admins. Please try again.",
        "error"
      );
    } finally {
      closeDeleteModal();
    }
  };

  const handleSearchChange = (query) => {
    if (!query) {
      setFilteredData(filteredDataBeforeSearch);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = filteredDataBeforeSearch.filter((admin) =>
      columnsWithImage.some((key) =>
        admin[key]
          ? admin[key].toString().toLowerCase().includes(lowercasedQuery)
          : false
      )
    );
    setFilteredData(filtered);
  };

  const handleSort = ({ field, order }) => {
    let sortedData = [...filteredData];
    sortedData.sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setFilteredData(sortedData);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const lastPostIndex = currentPage * rowsPerPage;
  const firstPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = filteredData.slice(firstPostIndex, lastPostIndex);

  const navigate = useNavigate();
  const handleAddButtonClick = () => {
    navigate("createAdmin");
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div datatype="bgFalse" className="rightSidebarContainer">
        <AdminHeader />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
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
            hasFeedbackTab={true}
            feedbackTitle={"List of admin account"}
          >
            <div className="tableContainerAdmin">
              <ActionTableWrapper
                hasLeftDeleteButton={false}
                leftDeleteButtonFunction={() => {}}
                hasRightActionButtons={true}
                rightAddButtonFunction={handleAddButtonClick}
                rightDeleteButtonFunction={openDeleteModal}
                hasLeftAction={true}
                rightExportExcelFunction={() => UserToExcel(filteredData, type)}
                onSearchChange={handleSearchChange}
                onFilterClick={openSortFilterModal}
                hasLeftActionSort={false}
                hasAdd={true}
                hasFilter={true}
                hasDelete={true}
                hasExportExcel={true}
                hasSearch={true}
              />
              {loading ? (
                <p>Loading...</p>
              ) : filteredData.length === 0 ? (
                <PlaceHolder type={"data"} />
              ) : (
                <>
                  <TableContent
                    columns={columnsWithImage}
                    data={currentRows}
                    backgroundColorButton="var(--clr-orange)"
                    labelButton="View details"
                    hasCheckbox={true}
                    updateAccount={updateAdmin}
                    hasOptionsButton={true}
                    onOptionClick={true}
                    setSelectedRowsDelete={setSelectedRows}
                    onSort={handleSort}
                  />
                  <div className="paginationWrapper">
                    <Pagination
                      totalRows={filteredData.length}
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
              {loading ? <p>Loading...</p> : <AdminGraphicsChart />}
            </div>
          </div>
        </div>
      </div>

      {isFilterModalOpen && (
        <SortFilterModal
          isOpen={isFilterModalOpen}
          onClose={closeSortFilterModal}
          onSort={handleSort}
          onFilter={handleFilter}
        />
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={softDeleteAdmin}
        selectedCount={selectedRows.length}
      />
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}