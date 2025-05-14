import React, { useState, useRef, useEffect } from "react";
import SidebarLoginRegister from "./SidebarLoginRegister";
import axios from "axios";

const ForgotPassword2 = ({ onNextStep, userEmail }) => {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [timer, setTimer] = useState(30);
    const [resendEnabled, setResendEnabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const inputRefs = useRef([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setResendEnabled(true);
        }
    }, [timer]);

    const handleChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setErrorMessage("");

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otp.some((char) => char === "")) {
            setErrorMessage("Please enter the complete OTP code.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/account/verify-otp", {
                email: userEmail,
                otp: otpCode,
            });

            if (response.data.success) {
                onNextStep(3, userEmail, otpCode); // Pass OTP to next step
            }
        } catch (error) {
            setErrorMessage("Invalid OTP code");
        }
    };

    const handleResendOTP = async () => {
        setOtp(Array(4).fill(""));
        setTimer(30);
        setResendEnabled(false);
        setErrorMessage("");

        try {
            await axios.post("http://localhost:5000/account/forgot-password", {
                email: userEmail.toLowerCase(),
            });
        } catch (error) {
            setErrorMessage("Failed to resend OTP");
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
                <h1 className="ffGTBold clrDarkBlue fs-32">OTP Verification</h1>
                <p className="ffGTMedium clrDarkBlue">
                    We have sent the verification code to your email address
                </p>
                <div className="fs-20 clrDarkBlue forgetstep2Email">
                    <p className="ffGTMedium clrDarkBlue noWrap forgetstep2EmailPContent">
                        Account Email Address:
                    </p>
                    <span className="ffGTMedium clrDarkBlue noWrap">{userEmail}</span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="forgetstep2handle">
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                value={value}
                                maxLength="1"
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                className="forgetstep2Input ffGTMedium"
                            />
                        ))}
                    </div>
                    {errorMessage && (
                        <p className="ffGTMedium" style={{ color: "red", marginBottom: "10px" }}>
                            {errorMessage}
                        </p>
                    )}
                    <p className="forgettimer ffGTMedium">
                        {timer > 0 ? `00:${timer.toString().padStart(2, "0")}` : ""}
                    </p>
                    <div className="dFlex ffGTMedium forgetstep2Footer">
                        <span className="ffGTMedium clrDarkBlue">Did not receive OTP?</span>
                        <button
                            className={`resend-button ${resendEnabled ? "enabled" : ""}`}
                            type="button"
                            onClick={handleResendOTP}
                            disabled={!resendEnabled}
                        >
                            Send OTP
                        </button>
                    </div>
                    <button type="submit" className="fs-14 ffGTBold clrWhite loginButton">
                        Submit
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ForgotPassword2;