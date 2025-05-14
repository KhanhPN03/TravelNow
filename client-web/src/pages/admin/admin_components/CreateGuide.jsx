import React, { useContext, useState } from "react";
import axios from "axios";
import SidebarNavigate from "./SidebarNavigate";
import AdminHeader from "./AdminHeader";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Context } from "../../../context/ContextProvider";

const CreateGuide = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    DOB: "",
    gender: "male",
    phone: "",
    password: "",
  });
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

  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFields({ ...fields, [name]: value });
     // Clear phone error when user starts typing
     if (name === "phone" && errors.phone) {
      setErrors({ ...errors, phone: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;
    const DOBRegex = /^\d{4}-\d{2}-\d{2}$/;
  
    if (!fields.email || !emailRegex.test(fields.email)) {
      newErrors.email = "A valid email is required";
    }
    if (!fields.username) {
      newErrors.username = "Username is required";
    }
    if (!fields.firstname || !nameRegex.test(fields.firstname)) {
      newErrors.firstname =
        "First name is required and must contain only letters";
    }
    if (!fields.lastname || !nameRegex.test(fields.lastname)) {
      newErrors.lastname =
        "Last name is required and must contain only letters";
    }
    if (!fields.DOB || !DOBRegex.test(fields.DOB)) {
      newErrors.DOB = "Date of birth is required (DD-MM-YYYY)";
    }
    if (!fields.gender) {
      newErrors.gender = "Gender is required";
    }
    // Updated phone validation
    if (!fields.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(fields.phone)) {
      newErrors.phone = "Phone number must be 10 digits and start with 0";
    }
    if (!fields.password) {
      newErrors.password = "Password is required";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Calculate the max date (15 years ago from today)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/account/guide",
          {
            accountCode: "G",
            email: fields.email,
            username: fields.username,
            firstname: fields.firstname,
            lastname: fields.lastname,
            DOB: fields.DOB,
            gender: fields.gender,
            phone: fields.phone,
            password: fields.password,
            avatar:
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            createdBy: user.user._id,
          }
        );

        if (response.data.success) {
          notify("Create new guide successfully", "success");
          setFields({
            email: fields.email,
            username: fields.username,
            firstname: fields.firstname,
            lastname: fields.lastname,
            DOB: fields.DOB,
            gender: fields.gender,
            phone: fields.phone,
            password: fields.password,
          });
          setTimeout(() => navigate(-1), 3000);
        }
      } catch (error) {
        console.error(
          "Error creating guide:",
          error.response?.data || error.message
        );
        notify("Failed to create guide. Please try again.", "error");
      }
    }
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <AdminHeader />

        <div className="profileSettingsContainer">
          <form onSubmit={handleSubmit} className="tabContent ffGTBold">
            <div className="createAccount ">
              <button onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h2 className=" fs20">Create New Guide</h2>
            </div>
            {/* Full Name */}
            <h3 className="underLineBreak fs20">Full Name</h3>
            <div className="editProfileInputGroup dFlex gap20">
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">First Name</span>
                <input
                  type="text"
                  name="firstname"
                  value={fields.firstname}
                  onChange={(e) => handleChange("firstname", e.target.value)}
                  placeholder="Enter First Name"
                />
                {errors.firstname && (
                  <span className="error">{errors.firstname}</span>
                )}
              </div>
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Last Name</span>
                <input
                  type="text"
                  name="lastname"
                  value={fields.lastname}
                  onChange={(e) => handleChange("lastname", e.target.value)}
                  placeholder="Enter Last Name"
                />
                {errors.lastname && (
                  <span className="error">{errors.lastname}</span>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <h3 className="underLineBreak fs20">Contact Details</h3>
            <div className="editProfileInputGroup dFlex gap20">
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Email</span>
                <input
                  type="email"
                  name="email"
                  value={fields.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter Email"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={fields.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Enter Phone"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <h3 className="underLineBreak fs20">Date of Birth & Gender</h3>
            <div className="editProfileInputGroup dFlex gap20">
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Date of Birth</span>
                <input
                  type="date"
                  name="DOB"
                  value={fields.DOB}
                  onChange={(e) => handleChange("DOB", e.target.value)}
                  placeholder="MM-DD-YYYY"
                  max={getMaxDate()}
                />
                {errors.DOB && <span className="error">{errors.DOB}</span>}
              </div>
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Gender</span>
                <select
                  name="gender"
                  value={fields.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <span className="error">{errors.gender}</span>
                )}
              </div>
            </div>

            {/* Username and Password */}
            <h3 className="underLineBreak fs20">Account Details</h3>
            <div className="editProfileInputGroup dFlex gap20">
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Username</span>
                <input
                  type="text"
                  name="username"
                  value={fields.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="Enter Username"
                />
                {errors.username && (
                  <span className="error">{errors.username}</span>
                )}
              </div>
              <div className="inputEditProfileContent w50">
                <span className="clrGrey-300">Password</span>
                <input
                  type="password"
                  name="password"
                  value={fields.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter Password"
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="editProfileSaveBtn bgOrange clrWhite"
            >
              Create Guide
            </button>
          </form>
        </div>
      </div>
      <ToastContainer style={{ width: "480px" }} />
    </div>
  );
};

export default CreateGuide;
