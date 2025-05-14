import SidebarComponent from "./SidebarComponent";
import TableTicked from "./TableTicked";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceHolder from "./PlaceHolder";
import { ToastContainer, toast } from "react-toastify";
const TableGuidedTours = ({ data, onViewDetail }) => {
  const today = new Date();
  return (
    <table className="guided-tours-table">
      <thead>
        <tr className="ffGTBold">
          <th>Tour Code</th>
          <th>Title</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((tour) => (
          <tr key={tour._id} className="ffGTRegular">
            <td>{tour.subTourCode || "N/A"}</td>
            <td>{tour.originalTourId?.title || "N/A"}</td>
            <td>
              {tour.dateStart?.date
                ? new Date(tour.dateStart.date).toLocaleDateString()
                : "N/A"}
            </td>
            <td>
              {tour.dateEnd
                ? new Date(tour.dateEnd).toLocaleDateString()
                : "N/A"}
            </td>
            <td>
              {new Date(tour.dateStart.date).toLocaleDateString() <
              new Date(today.getFullYear(), today.getMonth(), today.getDate())
                .toLocaleDateString
                ? "Completed"
                : "Future"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
const TableDetailCustomer = ({
  accountData,
  onClose,
  updateAccount,
  handleViewReview,
  handleViewCheckIn,
}) => {
  const [activePage, setActivePage] = useState("Page1");
  const [detailsModal, setDetailsModal] = useState(false);
  const [details, setDetails] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(accountData || {});
  const [tickets, setTickets] = useState([]);
  const [guidedTours, setGuidedTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const userRole = accountData?.role || "customer";

  useEffect(() => {
    if (activePage === "Page2" && accountData?._id) {
      if (userRole === "guide") {
        fetchGuidedTours();
      } else {
        fetchTickets();
      }
    }
  }, [activePage, accountData?._id, userRole]);

  const fetchTickets = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const bookingResponse = await axios.get(
        `http://localhost:5000/booking/user/${accountData._id}`
      );
      const bookings = bookingResponse.data.bookings || [];
      const bookingIds = bookings.map((b) => b._id);

      if (bookingIds.length === 0) {
        setTickets([]);
        return;
      }

      const ticketResponse = await axios.post(
        `http://localhost:5000/ticket/by-bookings`,
        { bookingIds }
      );
      if (ticketResponse.data.success) {
        setTickets(ticketResponse.data.tickets || []);
      } else {
        console.error("Failed to fetch tickets:", ticketResponse.data.message);
        setTickets([]);
        setFetchError("Failed to fetch tickets. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
      setFetchError(
        error.response?.data?.message ||
          "Error fetching tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchGuidedTours = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/subsidiaryTours/byGuide/${accountData._id}`
      );
      if (response.data.success) {
        setGuidedTours(response.data.tours || []);
      } else {
        console.error("Failed to fetch guided tours:", response.data.message);
        setGuidedTours([]);
        setFetchError("Failed to fetch guided tours. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching guided tours:", error);
      setGuidedTours([]);
      setFetchError(
        error.response?.data?.message ||
          "Error fetching guided tours. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/account/change-password/by-admin/${accountData._id}`,
        {
          newPassword: password,
        }
      );
      if (response.data.message) {
        setSuccessMessage("Update password successfully!");
      }
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update error:", error.response?.data);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    }
  };

  const handleDelete = () => {
    setDetails((prev) => ({ ...prev, feedback: "" }));
  };

  const handleCancel = () => {
    setDetailsModal(false);
    setDetails(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateAccount(user);
    } catch (error) {
      console.error("Error updating account:", error.message);
    }
  };

  const handleViewTourDetail = (tourId) => {
    console.log("View tour details for ID:", tourId);
  };

  return (
    <div className="wapperEdit">
      <SidebarComponent setActivePage={setActivePage} userRole={userRole} />
      <div>
        <button
          className="BtnClose"
          style={{ float: "right" }}
          onClick={onClose}
        >
          <div>
            <img src="../../../../images/iconX.svg" alt="close icon" />
          </div>
        </button>
        <div className="wapperContenModal" style={{ flex: 1, padding: "20px" }}>
          {activePage === "Page1" && (
            <form onSubmit={handleSave} className="adminProfileFormEdit">
              <div
                className="adminEditavatarSection"
                style={{ textAlign: "center", marginBottom: "20px" }}
              >
                <img
                  src={user.avatar || "https://via.placeholder.com/100"}
                  alt="Avatar"
                />
                <div className="inputfileimg">
                  <button
                    className="btnEditavatar"
                    type="button"
                    onClick={() => setShowInput(!showInput)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      style={{ fill: "rgba(0, 0, 0, 1)" }}
                    >
                      <path d="m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z"></path>
                      <path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              {showInput && (
                <input
                  className="inputAvatarimg"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setIsUploading(true);
                    setTimeout(() => setIsUploading(false), 2000);
                  }}
                />
              )}
              {isUploading && <p>Uploading Image...</p>}
              <div className="profileDetails">
                <div className="titleProfile">Profile Details</div>
                <div className="flexWrap profileDetailsField">
                  <div className="admincontentProfile">
                    <label
                      htmlFor="firstname"
                      className="ffGTBold fs-14 clrGrey-300"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={user.firstname || ""}
                      onChange={handleInputChange}
                      className="ffGTMedium fs-14 clrDarkBlue admininputCustomUserDetail"
                      id="firstname"
                    />
                  </div>
                  <div className="admincontentProfile">
                    <label
                      htmlFor="lastname"
                      className="ffGTBold fs-14 clrGrey-300"
                    >
                      Last name
                    </label>
                    <input
                      name="lastname"
                      className="ffGTMedium fs-14 clrDarkBlue admininputCustomUserDetail"
                      id="lastname"
                      value={user.lastname || ""}
                      type="text"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admincontentProfile">
                    <label
                      htmlFor="username"
                      className="ffGTBold fs-14 clrGrey-300"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={user.username || ""}
                      onChange={handleInputChange}
                      className="ffGTMedium fs-14 clrDarkBlue admininputCustomUserDetail"
                      id="username"
                    />
                  </div>
                  <div className="admincontentProfile">
                    <label htmlFor="DOB" className="ffGTBold fs-14 clrGrey-300">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      name="DOB"
                      value={
                        user.DOB
                          ? new Date(user.DOB).toISOString().substring(0, 10)
                          : ""
                      }
                      onChange={handleInputChange}
                      className="ffGTMedium fs-14 clrDarkBlue admininputCustomUserDetail"
                      id="DOB"
                    />
                  </div>
                </div>
              </div>
              <div className="contactDetails">
                <div className="titleProfile">Contact Details</div>
                <div className="flexWrap profileDetailsField">
                  <div className="admincontentProfile disable" data-type="mail">
                    <label
                      htmlFor="email"
                      className="ffGTBold fs-14 clrGrey-300"
                    >
                      Email
                    </label>
                    <input
                      disabled
                      name="email"
                      className="ffGTMedium fs-14 clrDarkBlue admininputCustomUserDetail"
                      id="email"
                      value={user.email || ""}
                      type="text"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admincontentProfile">
                    <label
                      htmlFor="phone"
                      className="ffGTBold fs-14 clrGrey-300"
                    >
                      Mobile Phone
                    </label>
                    <input
                      name="phone"
                      className="ffGTMedium fs-14 clrDarkBlue admininputCustomUserDetail"
                      id="mobilephone"
                      value={user.phone || ""}
                      type="text"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="ffGTMedium profileDetailsSaveBtn clrWhite bgOrange"
                id="userDetailSaveBtn"
              >
                Save
              </button>
            </form>
          )}
          {activePage === "Page2" && (
            <>
              {loading ? (
                <p>Loading...</p>
              ) : fetchError ? (
                <div
                  className="errorMessage"
                  style={{ color: "red", textAlign: "center" }}
                >
                  {fetchError}
                  <button
                    onClick={() =>
                      userRole === "guide" ? fetchGuidedTours() : fetchTickets()
                    }
                    style={{ marginLeft: "10px", padding: "5px 10px" }}
                  >
                    Retry
                  </button>
                </div>
              ) : userRole === "guide" ? (
                guidedTours.length === 0 ? (
                  <div className="emptyIcon">
                    <PlaceHolder type={"data"} />
                  </div>
                ) : (
                  <TableGuidedTours
                    data={guidedTours}
                    onViewDetail={handleViewTourDetail}
                  />
                )
              ) : tickets.length === 0 ? (
                <div className="emptyIcon">
                  <PlaceHolder type={"data"} />
                </div>
              ) : (
                <TableTicked
                  data={tickets}
                  accountData={accountData}
                  onViewDetail={handleViewReview}
                  onViewCheckin={handleViewCheckIn}
                />
              )}
            </>
          )}
          {activePage === "ChangePassword" && (
            <form className="adminFromChanglePass" onSubmit={handleSubmit}>
              <div className="formInputGroupChangle">
                <label
                  type="passwordInput"
                  className="dFlex"
                  htmlFor="newPassword"
                >
                  <span className="fs-16 ffGTRegular clrDarkBlue">
                    New Password
                  </span>
                </label>
                <div className="input-container ffGTRegular">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter New Password"
                    required
                  />
                  <i
                    className={`bx ${
                      showPassword ? "bx-show" : "bx-hide"
                    } input-icon password-toggle`}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              <div className="formInputGroupChangle">
                <label
                  type="passwordInput"
                  className="dFlex"
                  htmlFor="confirmPassword"
                >
                  <span className="fs-16 ffGTRegular clrDarkBlue">
                    Re-enter New Password
                  </span>
                </label>
                <div className="input-container ffGTRegular">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter New Password"
                    required
                  />
                  <i
                    className={`bx ${
                      showPassword ? "bx-show" : "bx-hide"
                    } input-icon password-toggle`}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              {errorMessage && (
                <p
                  className="error-message"
                  style={{ color: "red", marginBottom: "10px" }}
                >
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p
                  className="success-message"
                  style={{ color: "green", marginBottom: "10px" }}
                >
                  {successMessage}
                </p>
              )}
              <button
                type="submit"
                className="fs-14 ffGTBold changePasswordButton"
              >
                Change Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetailCustomer;
