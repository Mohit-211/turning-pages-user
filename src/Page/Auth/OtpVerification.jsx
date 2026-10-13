import React, { useEffect, useState } from "react";
import { Input } from "../../component/ui/Input/Input";
import { Button } from "../../component/ui/button/button";
import { Label } from "../../component/ui/Label/Label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sendOtpApi, verifyOtpApi } from "../../api/auth/auth.api";
import { message } from "antd";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "../../constants/validation";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // A code was just sent by the screen that brought the user here, so start on cooldown.
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") ? atob(searchParams.get("email")) : "";
  const type = searchParams.get("type") ? atob(searchParams.get("type")) : "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      message.error(`Please enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        otp,
        type
      };
      const response = await verifyOtpApi(payload);
      if (response?.data?.success) {
        if (type === "forgot_password") {
          // Short-lived, single-use reset token; kept out of the URL.
          navigate("/reset-password", {
            state: { email, token: response?.data?.data?.token },
          });
          return;
        }
        message.success(response?.data?.message || "OTP verified successfully");
        navigate("/login");
      }
    } catch (error) {
      // The API client shows the server message. Clear the input once the code is no longer usable.
      const errorMsg = error?.response?.data?.message || "";
      if (errorMsg.includes("request a new")) setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtpApi({ email, type });
      message.success("A new OTP has been sent to your email.");
      setOtp("");
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      // 429: "Please wait N seconds before requesting a new OTP."
      const seconds = Number(error?.response?.data?.message?.match(/(\d+) seconds/)?.[1]);
      if (seconds) setCooldown(seconds);
    } finally {
      setResending(false);
    }
  };

  if (!email || !type) {
    return (
      <div className="auth-form">
        <p>This verification link is incomplete.</p>
        <Link to="/login">Back to Login</Link>
      </div>
    );
  }

  return (

    <form onSubmit={handleVerifyOtp} className="auth-form">
      <div className="field">
        <Label htmlFor="otp">{OTP_LENGTH}-digit OTP sent to {email}</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
        />
        <small>The code expires in 10 minutes.</small>
      </div>

      <Button type="submit" className="btn-primary" block loading={loading} disabled={loading}>
        Verify OTP
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={cooldown > 0 || resending}
        onClick={handleResend}
      >
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </Button>
    </form>

  );
};

export default OtpVerification;
