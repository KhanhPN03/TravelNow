import { useContext, useEffect, useState, useCallback } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import axios from "axios";
import FormDropDownCreateTour from "./admin_components/FormDropDownCreateTour";
import PlaceHolder from "./admin_components/PlaceHolder";
import DeleteModal from "./admin_components/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import { Context } from "../../context/ContextProvider";

// Define column configurations for each type (UI-friendly names)
const columnsByType = {
  "Original Tour": [
    "originalTourCode",
    "title",
    "duration",
    "category",
    "createdAt",
    "createdBy",
    "deletedAt",
    "deletedBy",
  ],
  "Subsidiary Tour": [
    "subTourCode",
    "originalTourCode",
    "title",
    "duration",
    "category",
    "createdAt",
    "createdBy",
    "deletedAt",
    "deletedBy",
  ],
  Account: [
    "accountCode",
    "username",
    "role",
    "email",
    "firstname",
    "lastname",
    "createdAt",
    "deletedAt",
    "deletedBy",
  ],
  Discount: [
    "discountCode",
    "createdAt",
    "createdBy",
    "deletedAt",
    "deletedBy",
  ],
};

// Define API endpoint configurations for each type (API-friendly keys)
const apiEndpointsByType = {
  OriginalTour: {
    fetch: "http://localhost:5000/trash/OriginalTour",
    hardDelete: "http://localhost:5000/trash/hardDelete/OriginalTour/",
    restore: "http://localhost:5000/trash/restore/OriginalTour/",
    dataKey: "originalTours",
  },
  SubsidiaryTour: {
    fetch: "http://localhost:5000/trash/SubsidiaryTour",
    hardDelete: "http://localhost:5000/trash/hardDelete/SubsidiaryTour/",
    restore: "http://localhost:5000/trash/restore/SubsidiaryTour/",
    dataKey: "subsidiaryTours",
  },
  Account: {
    fetch: "http://localhost:5000/trash/Account",
    hardDelete: "http://localhost:5000/trash/hardDelete/Account/",
    restore: "http://localhost:5000/trash/restore/Account/",
    dataKey: "accounts",
  },
  Discount: {
    fetch: "http://localhost:5000/trash/Discount",
    hardDelete: "http://localhost:5000/trash/hardDelete/Discount/",
    restore: "http://localhost:5000/trash/restore/Discount/",
    dataKey: "discounts",
  },
};

// Map UI-friendly type names to API-friendly keys
const typeMap = {
  "Original Tour": "OriginalTour",
  "Subsidiary Tour": "SubsidiaryTour",
  Account: "Account",
  Discount: "Discount",
};

function Trash() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [dataWithImage, setDataWithImage] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [type, setType] = useState("Original Tour"); // UI-friendly type
  const [deleteModal, setDeleteModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataBeforeSearch, setFilteredDataBeforeSearch] = useState([]);

  const { user } = useContext(Context);
  const userRole = user?.user?.role; // Get user role (e.g., "admin", "superAdmin")
  console.log(userRole);

  // Pagination
  const lastPostIndex = currentPage * rowsPerPage;
  const firstPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = filteredData.slice(firstPostIndex, lastPostIndex);

  // Convert date to formatted string
  const convertDate = (date) => {
    if (!date) return "N/A";
    const newDate = new Date(date);
    const formattedDate = newDate
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
      })
      .replace(",", "");
    return formattedDate;
  };

  // Toast notification
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

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      const apiType = typeMap[type]; // Map UI type to API type
      const endpointConfig = apiEndpointsByType[apiType];
      if (!endpointConfig) {
        throw new Error(`Invalid type: ${type}`);
      }
      const response = await axios.get(endpointConfig.fetch);
      let fetchedData = response.data[endpointConfig.dataKey] || [];

      // Filter data based on user role for Account type
      if (type === "Account" && userRole === "admin") {
        // Admins can only see customer and guide accounts
        fetchedData = fetchedData.filter(
          (item) => item.role === "customer" || item.role === "guide"
        );
      }

      // Filter for deleted items and map the data
      let tmpData = fetchedData
        .filter((item) => item.deleted)
        .map((item) => {
          const mappedItem = {
            ...item,
            createdAt: convertDate(item.createdAt),
            deletedAt: convertDate(item.deletedAt),
          };

          // Handle createdBy and deletedBy based on type
          if (type === "Original Tour" || type === "Subsidiary Tour") {
            mappedItem.createdBy = item.createdBy?.accountCode || "Unknown";
            mappedItem.deletedBy =
              item.deletedBy?.accountCode || item.deletedBy || "Unknown";
            if (type === "Subsidiary Tour") {
              mappedItem.originalTourCode =
                item.originalTourId?.originalTourCode || "N/A";
              mappedItem.title = item.originalTourId?.title || "N/A";
              mappedItem.duration = item.originalTourId?.duration || "N/A";
              mappedItem.category = item.originalTourId?.category || "N/A";
            }
          } else if (type === "Account") {
            mappedItem.createdBy = "System"; // Accounts might not have a createdBy
            mappedItem.deletedBy = item.deletedBy?.accountCode || "Unknown";
          } else if (type === "Discount") {
            mappedItem.createdBy =
              item.createdBy?.username ||
              item.createdBy?.accountCode ||
              "Unknown";
            mappedItem.deletedBy =
              item.deletedBy?.username ||
              item.deletedBy?.accountCode ||
              item.deletedBy ||
              "Unknown";
            mappedItem.startDate = convertDate(item.discountDateStart);
            mappedItem.endDate = convertDate(item.discountDateEnd);
          }

          return mappedItem;
        });

      setDataWithImage(tmpData);
      setFilteredData(tmpData);
      setFilteredDataBeforeSearch(tmpData);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      notify(`Error fetching ${type} data`, "error");
    }
  }, [type, userRole]);

  // Fetch data on mount and when type, deleteModal, or userRole changes
  useEffect(() => {
    fetchData();
  }, [fetchData, type, deleteModal, userRole]);

  const openDeleteModal = () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one item to delete", "warn");
      return;
    }
    // For Account type, check if selected rows include admin/superAdmin accounts for non-superAdmin users
    if (type === "Account" && userRole !== "superAdmin") {
      const selectedAccounts = filteredData.filter((item) =>
        selectedRows.includes(item._id)
      );
      const hasRestrictedAccount = selectedAccounts.some(
        (account) => account.role === "admin" || account.role === "superAdmin"
      );
      if (hasRestrictedAccount) {
        notify(
          "Only superAdmin can delete admin or superAdmin accounts",
          "warn"
        );
        return;
      }
    }
    setDeleteModal(!deleteModal);
  };

  const handleChangeType = (e) => {
    setType(e.target.value);
    setCurrentPage(1); // Reset pagination
    setSelectedRows([]); // Clear selected rows
  };

  const handleHardDelete = async () => {
    try {
      // For Account type, verify no admin/superAdmin accounts are selected for non-superAdmin users
      if (type === "Account" && userRole !== "superAdmin") {
        const selectedAccounts = filteredData.filter((item) =>
          selectedRows.includes(item._id)
        );
        const hasRestrictedAccount = selectedAccounts.some(
          (account) => account.role === "admin" || account.role === "superAdmin"
        );
        if (hasRestrictedAccount) {
          notify(
            "Only superAdmin can delete admin or superAdmin accounts",
            "warn"
          );
          return;
        }
      }

      const apiType = typeMap[type]; // Map UI type to API type
      const endpointConfig = apiEndpointsByType[apiType];
      await Promise.all(
        selectedRows.map((id) =>
          axios.delete(`${endpointConfig.hardDelete}${id}/${user.user._id}`)
        )
      );
      notify(`${type} hard deleted successfully`, "success");
      setDeleteModal(false); // Close modal after deletion
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error hard deleting ${type}:`, error);
      notify(`Error hard deleting ${type}`, "error");
    }
  };

  const handleRestore = async () => {
    try {
      // For Account type, verify no admin/superAdmin accounts are selected for non-superAdmin users
      if (type === "Account" && userRole !== "superAdmin") {
        const selectedAccounts = filteredData.filter((item) =>
          selectedRows.includes(item._id)
        );
        const hasRestrictedAccount = selectedAccounts.some(
          (account) => account.role === "admin" || account.role === "superAdmin"
        );
        if (hasRestrictedAccount) {
          notify(
            "Only superAdmin can restore admin or superAdmin accounts",
            "warn"
          );
          return;
        }
      }

      const apiType = typeMap[type]; // Map UI type to API type
      const endpointConfig = apiEndpointsByType[apiType];
      await Promise.all(
        selectedRows.map((id) =>
          axios.put(`${endpointConfig.restore}${id}/${user.user._id}`)
        )
      );
      notify(`${type} restored successfully`, "success");
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error restoring ${type}:`, error);
      notify(`Error restoring ${type}`, "error");
    }
  };

  // Search function
  const handleSearchChange = (query) => {
    if (!query) {
      setFilteredData(filteredDataBeforeSearch); // Reset to data before search
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const columns = columnsByType[type];

    const filtered = filteredDataBeforeSearch.filter((item) =>
      columns.some((column) => {
        const value = item[column];
        return value
          ? value.toString().toLowerCase().includes(lowercasedQuery)
          : false;
      })
    );

    setFilteredData(filtered);
  };

  // Sort function
  const handleSort = ({ field, order }) => {
    let sortedData = [...filteredData];

    sortedData.sort((a, b) => {
      if (!a[field] && !b[field]) return 0;
      if (!a[field]) return 1;
      if (!b[field]) return -1;

      if (field === "createdAt" || field === "deletedAt") {
        const dateA = a[field] === "N/A" ? new Date(0) : new Date(a[field]);
        const dateB = b[field] === "N/A" ? new Date(0) : new Date(b[field]);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }

      return order === "asc"
        ? a[field].toString().localeCompare(b[field].toString())
        : b[field].toString().localeCompare(a[field].toString());
    });

    setFilteredData(sortedData);
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <DeleteModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(!deleteModal)}
          onDelete={handleHardDelete}
        />
        <AdminHeader />
        <div className="statisticCardsContainer">
          <FormDropDownCreateTour
            dropDownType={"binType"}
            handleChange={handleChangeType}
          />
        </div>
        <div className="dashboardTableContainer">
          <WrapperTable
            hasTabTransform={false}
            hasSelectDateTab={false}
            hasFeedbackTab={false}
            backLinkFeedback={""}
          >
            <div className="tableContainerAdmin">
              <div className="tableAdmin">
                <ActionTableWrapper
                  hasLeftDeleteButton={false}
                  leftDeleteButtonFunction={() => {}}
                  hasRightActionButtons={true}
                  rightDeleteButtonFunction={openDeleteModal}
                  hasRestore={true}
                  hasDelete={true}
                  hasSearch={true}
                  rightRestoreFunction={handleRestore}
                  hasLeftAction={true}
                  onSearchChange={handleSearchChange}
                />
                {currentRows.length <= 0 ? (
                  <PlaceHolder type="trash" />
                ) : (
                  <>
                    <TableContent
                      columns={columnsByType[type]}
                      data={currentRows}
                      hasImageColumn={false}
                      backgroundColorButton="var(--clr-dark-blue)"
                      labelButton="Options"
                      hasCheckbox={true}
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
            </div>
          </WrapperTable>
        </div>
      </div>
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}

export default Trash;
