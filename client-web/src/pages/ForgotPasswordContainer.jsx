import React, { useState } from "react";
import ForgotPassword1 from "./admin/admin_components/ForgotPassword";
import ForgotPassword2 from "./admin/admin_components/ForgotPasswordStep2";
import ForgotPassword3 from "./admin/admin_components/ForgotPasswordStep3";

const ForgotPasswordContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState(""); // Added to pass OTP to step 3

  const handleNextStep = (step, email, otpValue) => {
    if (email) setUserEmail(email);
    if (otpValue) setOtp(otpValue); // Store OTP if provided
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ForgotPassword1 onNextStep={handleNextStep} />;
      case 2:
        return (
          <ForgotPassword2 onNextStep={handleNextStep} userEmail={userEmail} />
        );
      case 3:
        return <ForgotPassword3 userEmail={userEmail} otp={otp} />;
      default:
        return <ForgotPassword1 onNextStep={handleNextStep} />;
    }
  };

  return <div>{renderStep()}</div>;
};

export default ForgotPasswordContainer;
