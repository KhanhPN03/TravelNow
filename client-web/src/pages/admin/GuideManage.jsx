import { useContext, useEffect, useState } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserToExcel from "./admin_components/UserToExcel";
import GuideGraphicsChart from "./admin_components/GuideGraphicsChart";
import { Context } from "../../context/ContextProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SortFilterModal from "./admin_components/SortFilterModalAccount";
import DeleteModal from "./admin_components/DeleteModal";
import PlaceHolder from "./admin_components/PlaceHolder";

const columnsWithImage = ["username", "email", "phone", "firstname"];

export default function GuideManage() {
  const type = "Guides";
  const [guideData, setGuideData] = useState([]);
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

  const { user } = useContext(Context);
  const userId = user?.user?._id;

  const [socket, setSocket] = useState(null);

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
    fetchGuides();

    // Set up WebSocket connection
    const ws = new WebSocket("ws://localhost:5000");
    setSocket(ws);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      notify(notification.message, notification.status);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/account/guide/");
      const guides = response.data.guides || [];
      setGuideData(guides);
      setFilteredData(guides);
      setFilteredDataBeforeSearch(guides);
    } catch (error) {
      console.error("Error fetching data:", error);
      notify("Failed to fetch guides", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateGuide = async (updatedGuide) => {
    try {
      const updateResponse = await axios.put(
        `http://localhost:5000/account/guide/${updatedGuide._id}`,
        updatedGuide
      );

      if (updateResponse.data.success) {
        notify("Guide updated successfully!", "success");
        // Send notification through WebSocket
        if (socket) {
          socket.send(
            JSON.stringify({
              message: "A guide account has been updated.",
              status: "success",
            })
          );
        }
        await fetchGuides(); // Refresh guide list
        return Promise.resolve(); // Resolve to indicate success
      }
    } catch (error) {
      let errorMessage = "Failed to update guide. Please try again.";
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

  const openDeleteModal = () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one guide to delete", "warn");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const softDeleteGuide = async () => {
    try {
      const deletePromises = selectedRows.map((guideId) =>
        axios.delete(
          `http://localhost:5000/account/guide/softDelete/${guideId}/${userId}`
        )
      );
      const responses = await Promise.all(deletePromises);

      const failedDeletions = responses.filter((res) => !res.data.success);
      if (failedDeletions.length > 0) {
        failedDeletions.forEach((res) => {
          notify(res.data.message || "Failed to delete a guide", "warn");
        });
      }

      await fetchGuides();
      setSelectedRows([]);

      if (failedDeletions.length === 0) {
        notify("Selected guides soft deleted successfully", "success");
        if (socket) {
          socket.send(
            JSON.stringify({
              message: "Selected guide accounts have been soft deleted.",
              status: "success",
            })
          );
        }
      }
    } catch (error) {
      console.error(
        "Error deleting guide:",
        error.response?.data || error.message
      );
      notify(
        error.response?.data?.message ||
          "Guide has been assigned to subsidiary tour. Can not delete!",
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
    const filtered = filteredDataBeforeSearch.filter((guide) =>
      columnsWithImage.some((key) =>
        guide[key]
          ? guide[key].toString().toLowerCase().includes(lowercasedQuery)
          : false
      )
    );
    setFilteredData(filtered);
  };

  const handleFilter = (newFilterConfig) => {
    let filtered = [...guideData];
    if (newFilterConfig.gender) {
      filtered = filtered.filter(
        (guide) => guide.gender === newFilterConfig.gender
      );
    }
    if (newFilterConfig.dobStart) {
      filtered = filtered.filter(
        (guide) => new Date(guide.dob) >= new Date(newFilterConfig.dobStart)
      );
    }
    if (newFilterConfig.dobEnd) {
      filtered = filtered.filter(
        (guide) => new Date(guide.dob) <= new Date(newFilterConfig.dobEnd)
      );
    }
    if (newFilterConfig.createdAtStart) {
      filtered = filtered.filter(
        (guide) =>
          new Date(guide.createdAt) >= new Date(newFilterConfig.createdAtStart)
      );
    }
    if (newFilterConfig.createdAtEnd) {
      filtered = filtered.filter(
        (guide) =>
          new Date(guide.createdAt) <= new Date(newFilterConfig.createdAtEnd)
      );
    }
    if (newFilterConfig.birthMonth) {
      filtered = filtered.filter(
        (guide) =>
          new Date(guide.dob).getMonth() + 1 ===
          parseInt(newFilterConfig.birthMonth)
      );
    }
    setFilteredData(filtered);
    setFilteredDataBeforeSearch(filtered);
    setFilterConfig(newFilterConfig);
    setFilterModalOpen(false);
  };

  const openSortFilterModal = () => {
    setFilterModalOpen(true);
  };

  const closeSortFilterModal = () => {
    setFilterModalOpen(false);
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
    navigate("createGuide");
  };

  const handleBack = () => {
    navigate(-1);
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
            feedbackTitle={"List of guide accounts"}
          >
            <div className="tableContainerAdmin">
              <ActionTableWrapper
                hasLeftDeleteButton={false}
                leftDeleteButtonFunction={() => {}}
                hasRightActionButtons={true}
                hasLeftAction={true}
                hasAdd={true}
                hasExportExcel={true}
                hasFilter={true}
                hasDelete={true}
                hasSearch={true}
                rightAddButtonFunction={handleAddButtonClick}
                rightDeleteButtonFunction={openDeleteModal}
                rightExportExcelFunction={() => UserToExcel(filteredData, type)}
                onSearchChange={handleSearchChange}
                onFilterClick={openSortFilterModal}
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
                    updateAccount={updateGuide}
                    setSelectedRowsDelete={setSelectedRows}
                    hasLeftAction={true}
                    onSort={handleSort}
                    hasOptionsButton={true}
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
        </div>

        <div className="statisticCardsContainer">
          <div className="contenChartAdmin">
            {loading ? <p>Loading...</p> : <GuideGraphicsChart />}
          </div>
        </div>
      </div>
      <ToastContainer style={{ width: "auto" }} />
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
        onDelete={softDeleteGuide}
        selectedCount={selectedRows.length}
      />
    </div>
  );
}