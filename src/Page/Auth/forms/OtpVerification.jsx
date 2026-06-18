import React, { useState, useEffect } from "react";
import { Input } from "../../../component/ui/Input/Input";
import { Button } from "../../../component/ui/button/button";
import { Label } from "../../../component/ui/Label/Label";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtpApi, sendOtpApi } from "../../../api/auth/auth.api";
import { message } from "antd";

import "./OtpVerification.scss";

const RESEND_COOLDOWN = 30;

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email")
    ? atob(searchParams.get("email"))
    : "";
  const type = searchParams.get("type") ? atob(searchParams.get("type")) : "";

  // ✅ Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendOtp = async () => {
    if (!email) {
      message.error("Invalid verification link");
      return;
    }

    setResendLoading(true);
    try {
      await sendOtpApi({ email, type });
      message.success("OTP resent! Please check your inbox.");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to resend OTP. Try again.";
      message.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

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
        const token = response?.data?.data?.token;

        if (type === "forgot_password") {
          navigate("/auth/forgot-password", { state: { email, token } });
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "OTP verification failed";
      message.error(errorMessage);
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

      {/* ✅ Resend OTP */}
      <div className="resend-wrapper">
        <span className="resend-label">Didn't receive the OTP?</span>
        <button
          type="button"
          className={`resend-btn ${cooldown > 0 ? "resend-btn--disabled" : ""}`}
          onClick={handleResendOtp}
          disabled={cooldown > 0 || resendLoading}
        >
          {resendLoading
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend OTP"}
        </button>
      </div>
    </form>
  );
};

export default OtpVerification;