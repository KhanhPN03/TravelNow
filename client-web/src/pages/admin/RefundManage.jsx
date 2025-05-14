import { useState, useRef, useEffect, useContext } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import Pagination from "./admin_components/Pagination";
import "./refund.css";
import ModalApprove from "./admin_components/refund/ModalApprove";
import ModalViewRefundDetail from "./admin_components/refund/ModalViewRefundDetail";
import axios from "axios";
import ModalReject from "./admin_components/refund/ModalReject";
import { Context } from "../../context/ContextProvider";

function RefundManage() {
  const [refundData, setRefundData] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Trạng thái hiển thị modal View Details
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false); // Trạng thái cho modal Reject
  const [rejectReason, setRejectReason] = useState(""); // Lý do reject được chọn hoặc nhập
  const [adminReason, setAdminReason] = useState(""); // Lý do tùy chỉnh từ input
  const [proofImage, setProofImage] = useState(null);
  const { user } = useContext(Context);
  const userId = user.user._id;
  const rowsPerPage = 5;

  const fileInputRef = useRef(null); // Ref để xử lý input file

  const tabs = [
    {
      name: "Pending",
      count: refundData.filter((r) => r.refundStatus === "PENDING").length,
    },
    {
      name: "Success",
      count: refundData.filter((r) => r.refundStatus === "SUCCESS").length,
    },
    {
      name: "Failed",
      count: refundData.filter((r) => r.refundStatus === "FAILED").length,
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSortOrder("newest");
    setSearchQuery("");
  };

  // Hàm lọc và sắp xếp dữ liệu
  const processData = () => {
    let filteredData = refundData.filter(
      (item) => item.refundStatus.toLowerCase() === activeTab.toLowerCase()
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      console.log("searchQuery: ", searchQuery);
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          typeof value === "object" && value !== null
            ? Object.values(value).some((subValue) =>
                String(subValue).toLowerCase().includes(query)
              )
            : String(value).toLowerCase().includes(query)
        )
      );
    }

    return [...filteredData].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  // Xử lý Reject (chuyển từ Pending sang Failed)
  const handleReject = (id) => {
    const request = refundData.find((item) => item._id === id);
    setSelectedRequest(request);
    setShowRejectModal(true); // Mở modal Reject
    setRejectReason(""); // Reset lý do
    setAdminReason(""); // Reset input tùy chỉnh
  };

  // Hàm mở modal Approve
  const handleOpenApproveModal = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
    setProofImage(null); // Reset ảnh khi mở modal
  };

  // Hàm xử lý upload ảnh chuyển khoản trong modal
  const handleUploadProofInModal = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("thumbnail", file); // Dùng "thumbnail" để khớp với backend
      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("response upload: ", response.data.thumbnailPath);
        setProofImage(response.data.thumbnailPath); // Lưu đường dẫn ảnh vào state
      } catch (error) {
        console.error("Error uploading reject proof:", error);
      }
    }
  };

  // Xử lý khi nhấn "View Details" trong cột Actions
  const handleViewDetails = (request) => {
    console.log("request: ", request);
    setSelectedDetails(request);
    setShowDetailsModal(true);
  };

  // Hàm đóng modal Approve
  const handleCloseApproveModal = () => {
    setShowApproveModal(false);
    setSelectedRequest(null);
    setProofImage(null);
  };

  // Hàm xử lý Submit trong modal Approve
  const handleSubmitApprove = async () => {
    if (proofImage && selectedRequest) {
      try {
        const { createdAt, updatedAt, ...rest } = selectedRequest;
        const updatedRequest = {
          ...rest,
          refundStatus: "SUCCESS",
          refundBillImage: proofImage,
          refundBy: userId, // Thay bằng ID của admin hiện tại nếu có
        };

        await axios.put(
          `http://localhost:5000/refund/update/${selectedRequest._id}`,
          updatedRequest
        );
        fetchData();
        handleCloseApproveModal();
      } catch (error) {
        alert(error.response.data.message);
        console.log("Error approving refund:", error);
      }
    }
  };

  // Hàm đóng modal View Details
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
  };

  const processedData = processData();
  const totalRows = processedData.length;
  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentData = processedData.slice(firstIndex, lastIndex);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
    setCurrentPage(1);
  };

  // Hàm xử lý khi submit Reject từ modal
  const handleSubmitReject = async () => {
    if (!selectedRequest || !rejectReason) {
      alert("Please select or enter a reason for rejection.");
      return;
    }

    const { createdAt, updatedAt, ...rest } = selectedRequest; // Lấy các trường khác ngoài createdAt và updatedAt

    try {
      const updateRequest = {
        refundStatus: "FAILED", // Sử dụng refundStatus thay vì status
        refundInformation: {
          ...rest.refundInformation, // Giữ nguyên các trường khác
          reason: {
            ...rest.refundInformation.reason, // Giữ lý do khách hàng (nếu có)
            admin: rejectReason === "Other" ? adminReason : rejectReason, // Lưu lý do từ chối của admin
          },
        },
      };
      await axios.put(
        `http://localhost:5000/refund/update/${selectedRequest._id}`,
        updateRequest
      );
      fetchData();
      setShowRejectModal(false); // Đóng modal sau khi submit
      setSelectedRequest(null);
    } catch (error) {
      console.log("Error rejecting refund:", error);
      alert(error.response?.data?.message || "Failed to reject refund.");
    }
  };

  // Hàm đóng modal Reject
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason("");
    setAdminReason("");
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/refund/get-all`);
      setRefundData(response.data.refundRequests);
    } catch (error) {
      console.log("Error fetching data refund management:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer" datatype="bgFalse">
        <AdminHeader />


        <div className="refundContainer">
          <div className="refundHeader">
            <div className="refundTabs">
              {tabs.map((tab) => (
                <div
                  key={tab.name}
                  className={`refundTab ${
                    activeTab === tab.name ? "refundTabActive" : ""
                  }`}
                  onClick={() => handleTabChange(tab.name)}
                >
                  {tab.name}{" "}
                  <span
                    className="refundBadge"
                    title={tab.count > 99 ? `Total: ${tab.count}` : undefined}
                  >
                    {tab.count > 99 ? "99+" : tab.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="refundContent">
            <div className="refundFilterWrapper">
              <div className="refundSearchContainer">
                <span className="refundSearchIcon">🔍</span>
                <input
                  type="text"
                  placeholder="Search in all fields..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="refundSearchInput"

                />
              </div>
              <button onClick={handleSortToggle} className="refundSortButton">
                <span className="refundSortIcon">📅</span>
                Sort by Timeline:{" "}
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </button>
            </div>
            {currentData.length > 0 ? (
              <>
                <div className="refundTableWrapper">
                  <table className="refundTable">
                    <thead>
                      <tr>
                        <th>Account Code</th>
                        <th>Email</th>
                        <th>Ticket Reference</th>
                        <th>Reason</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((request) => (
                        <tr key={request._id} className="refundTableRow">
                          <td className="refundTableCell">
                            {request.userId.accountCode}
                          </td>
                          <td className="refundTableCell">
                            {request.userId.email}
                          </td>
                          <td className="refundTableCell">
                            {request.ticketId.ticketRef}
                          </td>
                          <td className="refundTableCell">
                            {request.refundInformation.reason.customer}
                          </td>
                          <td className="refundTableCell">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="refundTableCell" style={{ width: activeTab === "Failed" ? "215px" : "150px" }}>
                            {activeTab === "Pending" ? (
                              <div className="refundActionButtons">
                                <button
                                  className="refundActionButton refundApproveButton"
                                  onClick={() =>
                                    handleOpenApproveModal(request)
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="refundActionButton refundRejectButton"
                                  onClick={() => handleReject(request._id)}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : activeTab === "Failed" ? (
                              <div className="refundActionButtons">
                                <button
                                  className="refundActionButton"
                                  onClick={() => handleViewDetails(request)}
                                >
                                  View Details
                                </button>
                                <button
                                  className="refundActionButton refundApproveButton"
                                  onClick={() =>
                                    handleOpenApproveModal(request)
                                  }
                                >
                                  Approve
                                </button>
                              </div>
                            ) : (
                              <button
                                className="refundActionButton"
                                onClick={() => handleViewDetails(request)}
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="refundPaginationWrapper">
                  <Pagination
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="refundNoData">
                <p>No Refund Requests Found</p>
              </div>
            )}

            {showApproveModal && selectedRequest && (
              <ModalApprove
                handleSubmitApprove={handleSubmitApprove}
                handleCloseApproveModal={handleCloseApproveModal}
                handleUploadProofInModal={handleUploadProofInModal}
                proofImage={proofImage}
                selectedRequest={selectedRequest}
                fileInputRef={fileInputRef}
              />
            )}

            {showRejectModal && selectedRequest && (
              <ModalReject
                handleCloseRejectModal={handleCloseRejectModal}
                handleSubmitReject={handleSubmitReject}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                adminReason={adminReason}
                setAdminReason={setAdminReason}
              />
            )}

            {showDetailsModal && selectedDetails && (
              <ModalViewRefundDetail
                handleCloseDetailsModal={handleCloseDetailsModal}
                selectedDetails={selectedDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundManage;
