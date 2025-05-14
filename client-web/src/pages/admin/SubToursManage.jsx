import { useContext, useEffect, useState } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilterTourModal from "./admin_components/FilterOTourModal";
import SubsidiaryTourChart from "./admin_components/SubsidiaryTourChart";
import { Context } from "../../context/ContextProvider";
import PlaceHolder from "./admin_components/PlaceHolder";
import DeleteModal from "./admin_components/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import ExportSubsidiaryTourToExcel from "./admin_components/SubsidiaryTourToExcel";
import ReviewModal from "./admin_components/ReviewModal";
const columnsWithImage = [
  "subTourCode",
  "originalTourCode",
  "title",
  "duration",
  "dateStart",
  "dateEnd",
  "category",
  "totalSlots",
  "availableSlots",
  "price",
  "status",
  "revenue",
  "createdAt",
  "createdBy",
];

function SubToursManage() {
  const { user } = useContext(Context);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [dataWithImage, setDataWithImage] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataBeforeSearch, setFilteredDataBeforeSearch] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);


  const lastPostIndex = currentPage * rowsPerPage;
  const firstPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = filteredData.slice(firstPostIndex, lastPostIndex);

  const convertDate = (date) => {
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

  const notify = (message, status) => {
    if (status === "success") {
      toast.success(message);
    } else if (status === "error") {
      toast.error(message);
    } else if (status === "warn") {
      toast.warning(message);
    }
  };

  const handleTourStatus = (hide, cancel) => {
    if (hide) {
      return "Completed";
    } else if (cancel) {
      return "Cancelled";
    }
    return "Ongoing";
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/subsidiaryTours/`)
      .then((tours) => {
        let fetchedTours = tours.data.subsidiaryTours;
        let tmpTours = [];
        fetchedTours.forEach((tour) => {
          if (!tour.deleted) {
            tmpTours.push({
              ...tour,
              createdAt: convertDate(tour.createdAt),
              createdBy: tour.createdBy.accountCode,
              title: tour.originalTourId.title,
              originalTourCode: tour.originalTourId.originalTourCode,
              duration: tour.originalTourId.duration,
              category: tour.originalTourId.category,
              status: handleTourStatus(tour.hide, tour.isCanceled),
              dateStart: `${tour.dateStart.time} ${convertDate(
                tour.dateStart.date
              )}`,
              dateEnd: convertDate(tour.dateEnd),
            });
          }
        });
        setDataWithImage(tmpTours);
        setFilteredData(tmpTours);
        setFilteredDataBeforeSearch(tmpTours);
      })
      .catch((error) => {
        console.error("Error fetching tours:", error);
        notify("Failed to fetch tours", "error");
      });
  }, [deleteModal]);

  const navigate = useNavigate();
  const handleAddButtonClick = () => {
    navigate("createTour");
  };

  const openDeleteModal = () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one tour to delete", "warn");
      return;
    }
    setDeleteModal(true);
  };

  const handleSoftDelete = async () => {
    try {
      const deletePromises = selectedRows.map((id) =>
        axios.delete(
          `http://localhost:5000/subsidiaryTours/softDelete/${id}/${user.user._id}`
        )
      );
      const responses = await Promise.all(deletePromises);
      setDeleteModal(false);
      const failed = responses.find((res) => res.data.success === false);
      if (failed) {
        notify(failed.data.message, "warn");
      } else {
        setSelectedRows([]);
        notify("Removed tours to trash successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting tours:", error);
      notify("Failed to delete tours", "error");
    }
  };

  const handleSearchChange = (query) => {
    if (!query) {
      setFilteredData(filteredDataBeforeSearch);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = filteredDataBeforeSearch.filter((tour) =>
      Object.keys(tour).some((key) =>
        tour[key]
          ? tour[key].toString().toLowerCase().includes(lowercasedQuery)
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

  const handleOpenFilterModal = () => setIsFilterModalOpen(true);
  const handleCloseFilterModal = () => setIsFilterModalOpen(false);

  const handleApplyFilter = (filters) => {
    const filteredTours = dataWithImage.filter((tour) => {
      let isValid = true;
      if (filters.durationMin && tour.duration < filters.durationMin) {
        isValid = false;
      }
      if (filters.durationMax && tour.duration > filters.durationMax) {
        isValid = false;
      }
      if (
        filters.createdAtStart &&
        new Date(tour.createdAt) < new Date(filters.createdAtStart)
      ) {
        isValid = false;
      }
      if (
        filters.createdAtEnd &&
        new Date(tour.createdAt) > new Date(filters.createdAtEnd)
      ) {
        isValid = false;
      }
      if (filters.category && tour.category !== filters.category) {
        isValid = false;
      }
      return isValid;
    });
    setFilteredData(filteredTours);
    setFilteredDataBeforeSearch(filteredTours);
    setIsFilterModalOpen(false);
  };

  const handleViewDetails = (id) => {
    navigate(`tourdetail/subsidiary/${id}`);
  };

  const handleViewFeedbacks = (id) => {
    navigate(`tourfeedback/subsidiary/${id}`);
  };

  const handleViewTickets = (id) => {
    navigate(`${id}/tourticket`);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await ExportSubsidiaryTourToExcel(filteredData);
      notify("Exported subsidiary tours successfully", "success");
    } catch (error) {
      console.error("Error exporting tours:", error);
      notify("Failed to export tours", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <DeleteModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          onDelete={handleSoftDelete}
          selectedCount={selectedRows.length}
        />
        <AdminHeader />
        <div className="statisticCardsContainer">
          <div className="contenChartAdmin">
            <SubsidiaryTourChart />
          </div>
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
                  rightAddButtonFunction={handleAddButtonClick}
                  hasLeftAction={true}
                  onSearchChange={handleSearchChange}
                  rightDeleteButtonFunction={openDeleteModal}
                  rightExportExcelFunction={handleExportExcel}
                  onFilterClick={handleOpenFilterModal}
                  hasAdd={true}
                  hasDelete={true}
                  hasExportExcel={true}
                  hasFilter={true}
                  hasSearch={true}
                />
                {isExporting ? (
                  <p>Exporting...</p>
                ) : currentRows.length <= 0 ? (
                  <PlaceHolder type="data" />
                ) : (
                  <>
                    <TableContent
                      columns={columnsWithImage}
                      data={currentRows}
                      hasImageColumn={false}
                      backgroundColorButton="var(--clr-dark-blue)"
                      labelButton="Options"
                      hasCheckbox={true}
                      setSelectedRowsDelete={setSelectedRows}
                      optionBtnBehavior="dropdownmenu"
                      onSort={handleSort}
                      hasViewDetails={true}
                      hasViewFeedbacks={true}
                      hasViewTickets={true}
                      handleViewDetails={handleViewDetails}
                      handleViewFeedbacks={handleViewFeedbacks}
                      handleViewTickets={handleViewTickets}
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
            </div>
          </WrapperTable>
          <FilterTourModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onFilter={handleApplyFilter}
            dataWithImage={dataWithImage}
          />
        
        </div>
      </div>
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}

export default SubToursManage;
