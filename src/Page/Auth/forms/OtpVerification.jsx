import React, { useState } from "react";
import { Input } from "../../../component/ui/Input/Input";
import { Button } from "../../../component/ui/button/button";
import { Label } from "../../../component/ui/Label/Label";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtpApi } from "../../../api/auth/auth.api";
import { message } from "antd";

import "./OtpVerification.scss";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email")
    ? atob(searchParams.get("email"))
    : "";
  const type = searchParams.get("type") ? atob(searchParams.get("type")) : "";

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      message.error("Please enter the OTP");
      return;
    }

    if (!email) {
      message.error("Invalid verification link");
      return;
    }

    setLoading(true);

    try {
      const payload = { email, otp, type };
      const response = await verifyOtpApi(payload);

      if (response?.data?.success) {
        message.success(response?.data?.message || "OTP verified successfully");
        console.log(response, "response")
        const token = response?.data?.data?.token
        // ✅ CONDITIONAL REDIRECT
        if (type === "forgot_password") {
          navigate("/auth/forgot-password", {
            state: { email, token } // optional but recommended
          });
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleVerifyOtp} className="auth-form otp-form">
      <div className="field">
        <Label htmlFor="otp">
          Enter the OTP sent to <span className="otp-email">{email}</span>
        </Label>

        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="4-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={4}

        />
      </div>

      <Button type="submit" className="btn-primary" block loading={loading}>
        Verify OTP
      </Button>
    </form>
  );
};

export default OtpVerification;
