import { useEffect, useState } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "./DeleteModal";

const columnsWithImage = [
  "subTourCode",
  "username",
  "feedback",
  "feedback at",
  "average rating",
  "transport rating",
  "services rating",
  "price quality rating",
];

function FeedbackManage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [dataWithImage, setDataWithImage] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const lastPostIndex = currentPage * rowsPerPage;
  const firstPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = filteredData.slice(firstPostIndex, lastPostIndex);
  const [deleteModal, setDeleteModal] = useState(false);

  const { tourType, tourId } = useParams();
  const isOriginal = tourType === "original";

  const convertDate = (date) => {
    const newDate = new Date(date);
    return newDate
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
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

  const fetchData = () => {
    const endpoint = isOriginal
      ? `http://localhost:5000/review-tour/admin/total/${tourId}`
      : `http://localhost:5000/review-tour/admin/${tourId}`;

    axios
      .get(endpoint)
      .then((reviews) => {
        let fetchedReviews = reviews.data.reviews;
        let tmpReviews = fetchedReviews.map((review) => ({
          ...review,
          "feedback at": convertDate(review.createdAt),
          username: review.userId.username,
          subTourCode: review.subTourId.subTourCode,
          "average rating": `${review.avgRating}/5`,
          "transport rating": `${review.rating.transport}/5`,
          "services rating": `${review.rating.services}/5`,
          "price quality rating": `${review.rating.priceQuality}/5`,
        }));
        setDataWithImage(tmpReviews);
        setFilteredData(tmpReviews);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        notify("Failed to fetch reviews", "error");
      });
  };

  useEffect(() => {
    fetchData();
  }, [tourId, refreshKey]);

  const navigate = useNavigate();
  const handleAddButtonClick = () => navigate("createTour");

  const handleSoftDelete = async () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one feedback to delete", "warn");
      return;
    }

    try {
      const deletePromises = selectedRows.map((id) =>
        axios.put(`http://localhost:5000/review-tour/admin/${id}`)
      );
      const responses = await Promise.all(deletePromises);
      const failed = responses.find((res) => res.data.success === false);
      if (failed) {
        notify(failed.data.message, "warn");
      } else {
        setSelectedRows([]);
        setRefreshKey((prev) => prev + 1);
        notify("Removed feedback successfully", "success");
        setDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      notify("Failed to delete feedback", "error");
    }
  };

  const handleSort = ({ field, order }) => {
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = field === "feedback at" ? new Date(a[field]) : a[field];
      const bValue = field === "feedback at" ? new Date(b[field]) : b[field];
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
      setFilteredData(dataWithImage);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = dataWithImage.filter((review) =>
      Object.keys(review).some((key) =>
        review[key]?.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered);
  };

  const openDeleteModal = () => {
    if (selectedRows.length === 0) {
      notify("Please select at least one tour to delete", "warn");
      return;
    }
    setDeleteModal(true);
  };

  const handleApplyFilter = (filters) => {
    let filteredReviews = dataWithImage;

    if (filters.dateStart) {
      filteredReviews = filteredReviews.filter(
        (review) =>
          new Date(review["feedback at"]) >= new Date(filters.dateStart)
      );
    }
    if (filters.dateEnd) {
      filteredReviews = filteredReviews.filter(
        (review) => new Date(review["feedback at"]) <= new Date(filters.dateEnd)
      );
    }
    if (filters.averageRatingMin) {
      filteredReviews = filteredReviews.filter(
        (review) =>
          parseFloat(review.avgRating) >= parseFloat(filters.averageRatingMin)
      );
    }
    if (filters.averageRatingMax) {
      filteredReviews = filteredReviews.filter(
        (review) =>
          parseFloat(review.avgRating) <= parseFloat(filters.averageRatingMax)
      );
    }
    if (filters.username) {
      filteredReviews = filteredReviews.filter((review) =>
        review.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }

    setFilteredData(filteredReviews);
    setIsFilterModalOpen(false);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/toursmanage/tourdetail/subsidiary/${id}`);
  };

  const handleBack = () => {
    navigate(-1);
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
            backLinkFeedback={handleBack}
            feedbackTitle={"Reviews"}
          >
            <div className="tableContainerAdmin">
              <div className="tableAdmin">
                <ActionTableWrapper
                  hasLeftDeleteButton={currentRows.length > 0}
                  leftDeleteButtonCustomTitle="Delete Feedback"
                  leftDeleteButtonFunction={openDeleteModal}
                  hasRightActionButtons={true}
                  rightAddButtonFunction={handleAddButtonClick}
                  rightDeleteButtonFunction={() => {}}
                  hasLeftAction={true}
                  onFilterClick={() => setIsFilterModalOpen(true)}
                  onSearchChange={handleSearchChange}
                  hasAdd={false}
                  hasDelete={false}
                  hasExportExcel={false}
                  hasFilter={false}
                  hasSearch={false}
                />
                {currentRows.length <= 0 ? (
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
                      hasViewDetails={true}
                      hasViewFeedbacks={true}
                      onSort={handleSort}
                      handleViewDetails={handleViewDetails}
                      hasOptionsButton={false}
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

export default FeedbackManage;
