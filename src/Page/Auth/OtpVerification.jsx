import React, { useState } from "react";
import { Input } from "../../component/ui/Input/Input";
import { Button } from "../../component/ui/button/button";
import { Label } from "../../component/ui/Label/Label";
import AuthLayout from "./AuthLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtpApi } from "../../api/auth/auth.api"; 
import { message } from "antd";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") ? atob(searchParams.get("email")) : "";
 const type = searchParams.get("type") ? atob(searchParams.get("type")) : "";
console.log(type,"type")

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      message.error("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        otp,
        type:type
      };
console.log(payload,"payload")
      const response = await verifyOtpApi(payload); 
      console.log(response,"response")
      if (response?.data?.success) {
        message.success(response?.data?.message || "OTP verified successfully");
        navigate("/login"); 
      } else {
        message.error(response?.data?.message || "Invalid OTP");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
 
      <form onSubmit={handleVerifyOtp} className="auth-form">
        <div className="field">
          <Label htmlFor="otp">OTP sent to {email}</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <Button type="submit" className="btn-primary" block loading={loading}>
          Verify OTP
        </Button>
      </form>
  
  );
};

export default OtpVerification;
