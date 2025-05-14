import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarNavigate from "./SidebarNavigate";
import AdminHeader from "./AdminHeader";
import WrapperTable from "./WrapperTable";
import ActionTableWrapper from "./ActionTableWrapper";
import TableContent from "./TableContent";
import Pagination from "./Pagination";
import FilterTourModal from "./FilterSTourModal";
import PlaceHolder from "./PlaceHolder";
import DeleteModal from "./DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import { Context } from "../../../context/ContextProvider";
import ExportSubsidiaryTourToExcel from "./SubsidiaryTourToExcel";

const columnsWithImage = [
  "subTourCode",
  "dateStart",
  "dateEnd",
  "totalSlots",
  "availableSlots",
  "price",
  "status",
  "revenue",
  "createdBy",
];

function SubsidiaryToursManage() {
  const { user } = useContext(Context);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [dataWithImage, setDataWithImage] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataBeforeSearch, setFilteredDataBeforeSearch] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const lastPostIndex = currentPage * rowsPerPage;
  const fisrtPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = filteredData.slice(fisrtPostIndex, lastPostIndex);
  const [isExporting, setIsExporting] = useState(false);

  const { orgTourId } = useParams();

  const convertDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString("en-CA");
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
      .get(
        `http://localhost:5000/subsidiaryTours/getSubToursByOrgTourId/${orgTourId}`
      )
      .then((tours) => {
        let fetchedTours = tours.data.subsidiaryTours;
        let tmpTours = [];
        fetchedTours.forEach((tour) => {
          if (!tour.deleted) {
            tmpTours.push({
              ...tour,
              createdAt: convertDate(tour.createdAt),
              createdBy: tour.createdBy.accountCode
                ? tour.createdBy.accountCode
                : "Unknown",
              title: tour.originalTourId.title,
              originalTourCode: tour.originalTourId.originalTourCode,
              duration: tour.originalTourId.duration,
              category: tour.originalTourId.category,
              status: handleTourStatus(tour.hide, tour.isCanceled),

              dateEndDisplay: convertDate(tour.dateEnd),

              dateStart: {
                date: tour.dateStart.date,
                time: tour.dateStart.time,
                display: `${tour.dateStart.time} ${convertDate(
                  tour.dateStart.date
                )}`,
              },
            });
          }
        });

        setDataWithImage(tmpTours);
        setFilteredData(tmpTours);
        setFilteredDataBeforeSearch(tmpTours);
        //
      })
      .catch((error) => {
        console.error("Error fetching tours:", error);
        notify("Failed to fetch tours", "error");
      });
  }, [deleteModal]);

  const navigate = useNavigate();

  const handleAddButtonClick = () =>
    navigate("/admin/dashboard/toursmanage/createTour");

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

  const handleSort = ({ field, order }) => {
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = field === "dateStart" ? a[field].date : a[field];
      const bValue = field === "dateStart" ? b[field].date : b[field];
      return order === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
    setFilteredData(sortedData);
  };

  const handleSearchChange = (query) => {
    if (!query) {
      setFilteredData(filteredDataBeforeSearch);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = filteredDataBeforeSearch.filter((tour) =>
      Object.keys(tour).some((key) =>
        tour[key]?.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered);
  };

  const handleApplyFilter = (filters) => {
    let filteredTours = dataWithImage;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (filters.dateStart || filters.dateEnd) {
      filteredTours = filteredTours.filter((tour) => {
        const tourStartDate = new Date(tour.dateStart.date);
        tourStartDate.setHours(0, 0, 0, 0);

        const filterStart = filters.dateStart
          ? new Date(filters.dateStart)
          : null;
        const filterEnd = filters.dateEnd ? new Date(filters.dateEnd) : null;

        if (filterStart) filterStart.setHours(0, 0, 0, 0);
        if (filterEnd) filterEnd.setHours(0, 0, 0, 0);

        const isAfterStart = filterStart ? tourStartDate >= filterStart : true;
        const isBeforeEnd = filterEnd ? tourStartDate <= filterEnd : true;

        return isAfterStart && isBeforeEnd;
      });
    }

    if (filters.totalSlotsMin) {
      filteredTours = filteredTours.filter(
        (tour) => tour.totalSlots >= Number(filters.totalSlotsMin)
      );
    }

    if (filters.totalSlotsMax) {
      filteredTours = filteredTours.filter(
        (tour) => tour.totalSlots <= Number(filters.totalSlotsMax)
      );
    }

    if (filters.priceMin) {
      filteredTours = filteredTours.filter(
        (tour) => tour.price >= Number(filters.priceMin)
      );
    }

    if (filters.priceMax) {
      filteredTours = filteredTours.filter(
        (tour) => tour.price <= Number(filters.priceMax)
      );
    }

    if (filters.status && filters.status !== "all") {
      filteredTours = filteredTours.filter((tour) => {
        const tourStartDate = new Date(tour.dateStart.date);
        const tourEndDate = new Date(tour.dateEnd);
        tourStartDate.setHours(0, 0, 0, 0);
        tourEndDate.setHours(0, 0, 0, 0);

        if (filters.status === "Before") {
          return tourStartDate > currentDate;
        } else if (filters.status === "In-progress") {
          return tourStartDate <= currentDate && currentDate <= tourEndDate;
        } else if (filters.status === "Ended") {
          return tourEndDate < currentDate;
        }
        return true;
      });
    }

    if (filters.language && filters.language !== "all") {
      filteredTours = filteredTours.filter(
        (tour) => tour.guideLanguage === filters.language
      );
    }

    setFilteredData(filteredTours);
    setFilteredDataBeforeSearch(filteredTours);
    setIsFilterModalOpen(false);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/dashboard/toursmanage/tourdetail/subsidiary/${id}`);
  };

  const handleViewFeedbacks = (id) => {
    // navigate(`/admin/toursmanage/tourfeedback/subsidiary/${id}`);
    // navigate(`dashboard/subtoursmanage/tourfeedback/subsidiary/${id}`);
    navigate(`/admin/dashboard/subtoursmanage/tourfeedback/subsidiary/${id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewTickets = (id) => {
    // navigate(`tourticket`);
    navigate(`/admin/dashboard/subtoursmanage/${id}/tourticket`);
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div datatype="bgFalse" className="rightSidebarContainer fitScreenHeight">
        <DeleteModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          onDelete={handleSoftDelete}
          selectedCount={selectedRows.length}
        />
        <AdminHeader />
        <div className="dashboardTableContainer">
          <WrapperTable
            hasTabTransform={false}
            hasSelectDateTab={false}
            hasFeedbackTab={true}
            backLinkFeedback={() => handleBack()}
            feedbackTitle={"List of subsidiary tours"}
          >
            <div className="tableContainerAdmin">
              <div className="tableAdmin">
                <ActionTableWrapper
                  hasLeftDeleteButton={false}
                  leftDeleteButtonFunction={() => {}}
                  hasRightActionButtons={true}
                  rightAddButtonFunction={handleAddButtonClick}
                  rightDeleteButtonFunction={openDeleteModal}
                  hasLeftAction={true}
                  onFilterClick={() => setIsFilterModalOpen(true)}
                  rightExportExcelFunction={handleExportExcel}
                  onSearchChange={handleSearchChange}
                  
                  hasAdd={true}
                  hasDelete={true}
                  hasExportExcel={true}
                  hasFilter={true}
                  hasSearch={true}
                />
                {currentRows.length <= 0 ? (
                  <PlaceHolder type="data" />
                ) : (
                  <>
                    <TableContent
                      columns={columnsWithImage}
                      data={currentRows.map((row) => ({
                        ...row,
                        dateStart: row.dateStart.display,
                        dateEnd: row.dateEndDisplay,
                      }))}
                      hasImageColumn={false}
                      backgroundColorButton="var(--clr-dark-blue)"
                      labelButton="Options"
                      hasCheckbox={true}
                      setSelectedRowsDelete={setSelectedRows}
                      optionBtnBehavior="dropdownmenu"
                      hasViewDetails={true}
                      hasViewFeedbacks={true}
                      hasViewTickets={true}
                      onSort={handleSort}
                      handleViewDetails={handleViewDetails}
                      handleViewFeedbacks={handleViewFeedbacks}
                      handleViewTickets={handleViewTickets}
                      hasOptionsButton={true}
                      hasExportExcel={true}
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

export default SubsidiaryToursManage;
