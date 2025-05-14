import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Context } from "../../context/ContextProvider";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import PlaceHolder from "./admin_components/PlaceHolder";
import FilterTourModal from "./admin_components/FilterOTourModal";
import TicketCheckinDetails from "./admin_components/TicketCheckinDetails";
import ReviewModal from "./admin_components/ReviewModal";

const columnsWithImage = [
  "ticketRef",
  "buyerName",
  "buyerEmail",
  "buyerPhone",
  "bookedSlot",
  "bookingStatus",
  "finalPrice",
];

function TicketsManage() {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const { tourId } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [dataWithImage, setDataWithImage] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCheckinDetailsModalOpen, setIsCheckinDetailsModalOpen] =
    useState(false);
  const [isReviewDetailsModalOpen, setIsReviewDetailsModalOpen] =
    useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

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

  const formatToVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/ticket/${tourId}`)
      .then((tickets) => {
        let fetchedTickets = tickets.data.reviews;
        let tmpTickets = fetchedTickets.map((ticket) => ({
          ...ticket,
          ticketRef: ticket.ticketRef,
          buyerName: ticket.bookingId.buyerName,
          buyerEmail: ticket.bookingId.buyerEmail,
          buyerPhone: ticket.bookingId.buyerPhone,
          bookedSlot: ticket.bookingId.bookedSlot,
          bookingStatus: ticket.bookingId.bookingStatus,
          finalPrice: formatToVND(ticket.bookingId.finalPrice),
          createdAt: convertDate(ticket.createdAt) || "#",
        }));
        setDataWithImage(tmpTickets);
        setFilteredData(tmpTickets);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
      });
  }, [tourId]);

  const handleSearchChange = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = dataWithImage.filter((ticket) =>
      Object.keys(ticket).some((key) =>
        ticket[key]
          ? ticket[key].toString().toLowerCase().includes(lowercasedQuery)
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
    const filteredTickets = dataWithImage.filter((ticket) => {
      let isValid = true;
      if (filters.bookedSlotMin && ticket.bookedSlot < filters.bookedSlotMin) {
        isValid = false;
      }
      if (filters.bookedSlotMax && ticket.bookedSlot > filters.bookedSlotMax) {
        isValid = false;
      }
      if (
        filters.createdAtStart &&
        new Date(ticket.createdAt) < new Date(filters.createdAtStart)
      ) {
        isValid = false;
      }
      if (
        filters.createdAtEnd &&
        new Date(ticket.createdAt) > new Date(filters.createdAtEnd)
      ) {
        isValid = false;
      }
      if (
        filters.bookingStatus &&
        ticket.bookingStatus !== filters.bookingStatus
      ) {
        isValid = false;
      }
      return isValid;
    });
    setFilteredData(filteredTickets);
    setIsFilterModalOpen(false);
  };

  const [reviewDetails, setReviewDetails] = useState();

  const handleViewReviewDetails = (id) => {
    setIsReviewDetailsModalOpen(true);
    axios
      .get(`http://localhost:5000/review-tour/ticket/${id}`)
      .then((reviews) => {
        setReviewDetails(reviews.data.review);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
      });
  };

  const handleViewCheckInDetails = (id) => {
    setSelectedRowId(id);
    setIsCheckinDetailsModalOpen(true);
  };

  const closeCheckinDetailsModal = () => {
    setIsCheckinDetailsModalOpen(false);
    setSelectedRowId(null);
  };

  // const handleDeleteFeedback = async (details) => {
  //   try {
  //     const response = await axios.put(
  //       `http://localhost:5000/review-tour/admin/${details._id}`
  //     );

  //     if (response.data.success) {
  //       // Update local details to reflect deleted feedback
  //       const updatedDetails = { ...details, feedback: "" };
  //       onDelete(updatedDetails); // Notify parent of updated details
  //       toast.success("Delete feedback successfully");
  //       if (onRefreshReviews) {
  //         await onRefreshReviews(); // Re-fetch review to update TableRowTicked
  //       }
  //     } else {
  //       toast.error("Failed to delete feedback");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting feedback:", error);
  //     toast.error("Failed to delete feedback");
  //   } finally {
  //     onClose();
  //   }
  // };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div datatype="bgFalse" className="rightSidebarContainer fitScreenHeight">
        <AdminHeader />
        <div className="dashboardTableContainer">
          <WrapperTable
            hasTabTransform={false}
            hasSelectDateTab={false}
            hasFeedbackTab={true}
            backLinkFeedback={() => navigate(-1)}
            feedbackTitle={"List of tickets"}
          >
            <div className="tableContainerAdmin">
              <div className="tableAdmin">
                <ActionTableWrapper
                  onSearchChange={handleSearchChange}
                  onFilterClick={handleOpenFilterModal}
                  hasRightActionButtons={false}
                  hasFilter={false}
                  hasLeftAction={false}
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
                      optionBtnBehavior="dropdownmenu"
                      onSort={handleSort}
                      hasViewReviewDetails={true}
                      hasViewCheckInDetails={true}
                      handleViewReviewDetails={handleViewReviewDetails}
                      handleViewCheckInDetails={handleViewCheckInDetails}
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
            onClose={handleCloseFilterModal}
            onFilter={handleApplyFilter}
          />
        </div>
      </div>
      {isCheckinDetailsModalOpen && (
        <TicketCheckinDetails
          onClose={closeCheckinDetailsModal}
          rowId={selectedRowId}
        />
      )}
      {isReviewDetailsModalOpen && (
        <ReviewModal
          details={reviewDetails}
          onClose={() => setIsReviewDetailsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default TicketsManage;
