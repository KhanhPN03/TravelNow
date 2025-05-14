import React, { useState } from "react";
import SidebarLoginRegister from "./SidebarLoginRegister";
import axios from "axios";

const ForgotPassword3 = ({ userEmail, otp }) => {
    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (passwords.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/account/reset-password", {
                email: userEmail,
                otp,
                newPassword: passwords.password,
            });

            if (response.data.success) {
                window.location.replace("/login"); // Redirect to login, clearing history
            }
        } catch (error) {
            setError("Failed to reset password");
        }
    };

    return (
        <section className="dGrid">
            <SidebarLoginRegister />
            <div className="forgotWrapper">
                <p className="ffGTMedium clrDarkBlue">
                    Return to{" "}
                    <a className="clrOrange textUnderline" href="/login">
                        Login
                    </a>
                </p>
                <h1 className="ffGTBold clrDarkBlue fs-32">Reset Password</h1>
                <p className="ffGTMedium clrDarkBlue">Enter your new password</p>
                <form onSubmit={handleSubmit}>
                    <div className="formInputGroup">
                        <label type="passwordInput" className="dFlex" htmlFor="newPassword">
                            <span className="fs-16 ffGTRegular clrDarkBlue">New Password</span>
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={passwords.password}
                            onChange={(e) =>
                                setPasswords((prev) => ({ ...prev, password: e.target.value }))
                            }
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="formInputGroup">
                        <label type="passwordInput" className="dFlex" htmlFor="confirmPassword">
                            <span className="fs-16 ffGTRegular clrDarkBlue">Confirm Password</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                }))
                            }
                            placeholder="Confirm new password"
                        />
                        {error && (
                            <p className="fs-14 ffGTMedium clrRed" style={{ marginTop: "5px" }}>
                                {error}
                            </p>
                        )}
                    </div>
                    <button type="submit" className="fs-14 ffGTBold loginButton clrWhite mt-20">
                        Change Password
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ForgotPassword3;