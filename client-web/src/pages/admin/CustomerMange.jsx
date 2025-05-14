import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import { useNavigate } from "react-router-dom";
import UserToExcel from "./admin_components/UserToExcel";
import CustomergraphicsChart from "./admin_components/CustomergraphicsChart";
import SortFilterModal from "./admin_components/SortFilterModalAccount";
import DeleteModal from "./admin_components/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "../../context/ContextProvider";
import PlaceHolder from "./admin_components/PlaceHolder";

const columnsWithImage = [
  "accountCode",
  "username",
  "email",
  "firstname",
  "lastname",
  "gender",
];

export default function CustomerManage() {
  const type = "Customers";
  const { user } = useContext(Context);
  const userId = user?.user?._id;
  const [customerData, setCustomerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataBeforeSearch, setFilteredDataBeforeSearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterConfig, setFilterConfig] = useState({
    gender: "",
    dobStart: "",
    dobEnd: "",
    createdAtStart: "",
    createdAtEnd: "",
  });
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/account/customer/"
      );
      const customers = response.data.users || [];
      setCustomerData(customers);
      setFilteredData(customers);
      setFilteredDataBeforeSearch(customers);
    } catch (error) {
      console.error("Error fetching data:", error);
      notify("Failed to fetch customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query) => {
    if (!query) {
      setFilteredData(filteredDataBeforeSearch);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = filteredDataBeforeSearch.filter((customer) =>
      Object.keys(customer).some(
        (key) =>
          customer[key] &&
          customer[key].toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered);
  };

  const handleFilter = (newFilterConfig) => {
    let filtered = [...customerData];
    if (newFilterConfig.gender) {
      filtered = filtered.filter(
        (customer) => customer.gender === newFilterConfig.gender
      );
    }
    if (newFilterConfig.dobStart) {
      filtered = filtered.filter(
        (customer) =>
          new Date(customer.DOB) >= new Date(newFilterConfig.dobStart)
      );
    }
    if (newFilterConfig.dobEnd) {
      filtered = filtered.filter(
        (customer) => new Date(customer.DOB) <= new Date(newFilterConfig.dobEnd)
      );
    }
    if (newFilterConfig.createdAtStart) {
      filtered = filtered.filter(
        (customer) =>
          new Date(customer.createdAt) >=
          new Date(newFilterConfig.createdAtStart)
      );
    }
    if (newFilterConfig.createdAtEnd) {
      filtered = filtered.filter(
        (customer) =>
          new Date(customer.createdAt) <= new Date(newFilterConfig.createdAtEnd)
      );
    }
    if (newFilterConfig.birthMonth) {
      filtered = filtered.filter(
        (customer) =>
          new Date(customer.DOB).getMonth() + 1 ===
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

  const updateAccount = async (updatedCustomer) => {
    try {
      const updateResponse = await axios.put(
        `http://localhost:5000/account/${updatedCustomer._id}`,
        updatedCustomer
      );

      if (updateResponse.data.success) {
        notify("Account updated successfully!", "success"); // Show toast in CustomerManage
        await fetchCustomers(); // Refresh customer list
        return Promise.resolve(); // Resolve to indicate success
      }
    } catch (error) {
      let errorMessage = "Failed to update account. Please try again.";
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message === "Email already exists in the database"
      ) {
        errorMessage = "Email already exists. Please use a different email.";
      }
      notify(errorMessage, "error"); // Show error toast in CustomerManage
      throw new Error(errorMessage); // Reject with error message
    }
  };

  const openDeleteModal = () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one customer to delete", "warn");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSoftDelete = async () => {
    try {
      const deletePromises = selectedRows.map((id) =>
        axios.delete(
          `http://localhost:5000/account/customer/softDelete/${id}/${userId}`
        )
      );
      const responses = await Promise.all(deletePromises);

      const failedDeletions = responses.filter((res) => !res.data.success);
      if (failedDeletions.length > 0) {
        failedDeletions.forEach((res) => {
          notify(res.data.message || "Failed to delete a customer", "warn");
        });
      }

      await fetchCustomers();
      setSelectedRows([]);
      if (failedDeletions.length === 0) {
        notify("Selected customers soft deleted successfully", "success");
      }
    } catch (error) {
      console.error(
        "Error deleting customers:",
        error.response?.data || error.message
      );
      notify(
        error.response?.data?.message ||
          "Customer have booking tour. Can not delete!",
        "error"
      );
    } finally {
      closeDeleteModal();
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const lastPostIndex = currentPage * rowsPerPage;
  const firstPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = filteredData.slice(firstPostIndex, lastPostIndex);

  const navigate = useNavigate();
  const handleAddButtonClick = () => {
    navigate("createCustomer");
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewCheckInDetails = (id) => {
    console.log("View check-in details for ID:", id);
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
            backLinkFeedback={() => handleBack()}
            feedbackTitle={"List of customer accounts"}
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
                    updateAccount={updateAccount}
                    hasOptionsButton={true}
                    onOptionClick={true}
                    setSelectedRowsDelete={setSelectedRows}
                    onSort={handleSort}
                    hasViewCheckInDetails={true}
                    hasViewReviewDetails={false}
                    handleViewCheckInDetails={handleViewCheckInDetails}
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
              {loading ? <p>Loading...</p> : <CustomergraphicsChart />}
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
        onDelete={handleSoftDelete}
        selectedCount={selectedRows.length}
      />
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}