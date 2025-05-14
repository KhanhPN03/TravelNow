import React, { useState } from "react";
import SidebarLoginRegister from "./SidebarLoginRegister";
import axios from "axios";

const ForgotPassword1 = ({ onNextStep }) => {
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

   

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(emailOrPhone)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/account/forgot-password", {
                email: emailOrPhone.toLowerCase(),
            });

            setIsLoading(false);

            if (response.data.success) {
                onNextStep(2, emailOrPhone);
            }
        } catch (error) {
            setIsLoading(false);
            setError("Email not found");
        }
    };

    return (
        <section className="dGrid">
            <SidebarLoginRegister />
            <div className="forgotWrapper">
                <p className="fs-14 ffGTMedium clrDarkBlue">
                    Return to <a className="clrOrange textUnderline" href="/login">Login</a>
                </p>
                <h1 className="ffGTBold clrDarkBlue fs-32">Forgot Password?</h1>
                <p className="fs-20 ffGTMedium clrDarkBlue">
                    Enter the email address associated with your account.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="formInputGroup">
                        <label type="passwordInput" className="dFlex" htmlFor="emailorphone">
                            <span className="fs-16 ffGTRegular clrDarkBlue">
                                Email Address
                            </span>
                        </label>
                        <input
                            id="emailorphone"
                            type="text"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            placeholder="Enter Your Email"
                            disabled={isLoading}
                        />
                        {error && <p className="fs-14 ffGTMedium clrRed">{error}</p>}
                    </div>
                    <button
                        type="submit"
                        className="fs-14 ffGTBold loginButton clrWhite mb-30"
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Continue"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ForgotPassword1;