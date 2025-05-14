import React, { useContext, useEffect, useState } from "react";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import AdminHeader from "./admin_components/AdminHeader";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Context } from "../../context/ContextProvider";
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
const TabTransform = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabTransformAdmin">
      <div
        className={`tabTransformLeft ${
          activeTab === "profile" ? "active" : ""
        }`}
        onClick={() => setActiveTab("profile")}
      >
        <button className="ffGTMedium fs-18">Profile Details</button>
      </div>
      <div
        className={`tabTransformRight ${
          activeTab === "password" ? "active" : ""
        }`}
        onClick={() => setActiveTab("password")}
      >
        <button className="ffGTMedium fs-18">Change Password</button>
      </div>
    </div>
  );
};

export default function EditProfile() {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "password"
  const [profileDetails, setProfileDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // For error feedback
  const { user } = useContext(Context);
  const userId = user?.user?._id;

  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch initial profile data
  useEffect(() => {
    if (!userId) return; // Prevent fetch if userId is not available
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/account/${userId}`
      );
      const customer = response.data.user || {};
      setProfileDetails(customer);
      console.log("Fetched profile:", customer);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Update profile details
  const updateAccount = async (updatedCustomer) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/account/${updatedCustomer._id}`,
        updatedCustomer
      );
      if (response.data.success) {
        notify("Update account successfully", "success");
      }
      const updatedProfile = response.data.user || updatedCustomer;
      setProfileDetails(updatedProfile); // Update state with new data
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error updating customer data:", {
        message: error.message,
        response: error.response ? error.response.data : null,
      });
      notify(`Error when update account. ${error.message}`, "error");
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const updatedCustomer = {
      _id: userId,
      firstname: profileDetails.firstname,
      lastname: profileDetails.lastname,
      email: profileDetails.email,
      username: profileDetails.username,
      DOB: profileDetails.DOB,
      phone: profileDetails.phone,
      // Add other fields like dob if present in your schema
    };
    updateAccount(updatedCustomer);
  };

  // Handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordDetails;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    const updatedCustomer = {
      _id: userId,
      currentPassword,
      newPassword,
    };

    updateAccount(updatedCustomer).then(() => {
      setPasswordDetails({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordDetails((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  return (
    <div className="containerAdmin ">
      <SidebarNavigate />
      <div
        datatype="bgFalse"
        className="rightSidebarContainer fitScreenHeight "
      >
        <AdminHeader />
        <div className="profileSettingsContainer ">
          <TabTransform activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="tabContent ffGTBold ">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {activeTab === "profile" ? (
                  <form
                    onSubmit={handleProfileSubmit}
                    className="profileDetails"
                  >
                    <h3 className="underLineBreak fs20">Full Name</h3>
                    <div className="editProfileInputGroup dFlex gap20">
                      <div className="inputEditProfileContent w50 gap20">
                        <span className="clrGrey-300">First Name</span>
                        <input
                          type="text"
                          name="firstname"
                          value={profileDetails.firstname || ""}
                          onChange={handleProfileChange}
                          placeholder="First name"
                        />
                      </div>

                      <div className="inputEditProfileContent w50">
                        <span className="clrGrey-300">Last Name</span>
                        <input
                          type="text"
                          name="lastname"
                          value={profileDetails.lastname || ""}
                          onChange={handleProfileChange}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="editProfileInputGroup dFlex gap20">
                      <div className="inputEditProfileContent w50 gap20">
                        <span className="clrGrey-300">Username</span>
                        <input
                          type="text"
                          name="username"
                          value={profileDetails.username || ""}
                          onChange={handleProfileChange}
                          placeholder="Username"
                        />
                      </div>

                      <div className="inputEditProfileContent w50">
                        <span className="clrGrey-300">Date of birth</span>
                        <input
                          type="date"
                          name="DOB"
                          value={
                            profileDetails.DOB
                              ? new Date(profileDetails.DOB)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                          }
                          onChange={handleProfileChange}
                          placeholder="Date of birth"
                        />
                      </div>
                    </div>
                    <h3 className="underLineBreak fs20">Contact Details</h3>
                    <div className="editProfileInputGroup">
                      <div className="inputEditProfileContent w50 disable">
                        <span className="clrGrey-300">Email</span>
                        <input
                          type="email"
                          name="email"
                          value={profileDetails.email || ""}
                          onChange={handleProfileChange}
                          placeholder="Email"
                          disabled
                        />
                      </div>
                      <div className="inputEditProfileContent w50">
                        <span className="clrGrey-300">Phone Number</span>
                        <input
                          type="tel"
                          name="phone"
                          value={profileDetails.phone || ""}
                          onChange={handleProfileChange}
                          placeholder="Mobile Phone"
                        />
                      </div>
                    </div>
                    {error && (
                      <p style={{ color: "red", margin: "10px 0" }}>{error}</p>
                    )}
                    <button
                      type="submit"
                      className="editProfileSaveBtn clrWhite bgOrange"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="editProfileChangePassword"
                  >
                    <h3 className="underLineBreak fs20">Old Password</h3>
                    <div className="editProfileInputGroup">
                      <div className="inputEditProfileContent w50">
                        <span className="clrGrey-300">
                          Enter your old password
                        </span>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordDetails.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter Your Current Password"
                        />
                      </div>
                    </div>
                    <h3 className="underLineBreak fs20">New Password</h3>
                    <div className="editProfileInputGroup">
                      <div className="inputEditProfileContent w50">
                        <span className="clrGrey-300">
                          Enter your new password
                        </span>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordDetails.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter Your New Password"
                        />
                      </div>
                    </div>
                    <div className="editProfileInputGroup">
                      <div className="inputEditProfileContent w50">
                        <span className="clrGrey-300">
                          Confirm your new password
                        </span>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordDetails.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm Your New Password"
                        />
                      </div>
                    </div>
                    {error && (
                      <p style={{ color: "red", margin: "10px 0" }}>{error}</p>
                    )}
                    <button type="submit" className="editProfileSaveBtn bgOrange clrWhite">
                      Save
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}
