import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, sendOtpApi } from "../../../api/auth/auth.api"; // ✅ import sendOtpApi

import "./LoginForm.scss";

const LoginForm = () => {
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: "0x4AAAAAADFcZ6m1dRakT4n3",
        callback: (token) => setCaptchaToken(token),
      });
    }
  }, []);

  useEffect(() => {
    window.handleTurnstileCallback = (token) => {
      setCaptchaToken(token);
    };
    return () => {
      delete window.handleTurnstileCallback;
    };
  }, []);

  const onFinish = async ({ email, password }) => {
    if (!captchaToken) {
      message.error("Please verify captcha");
      return;
    }

    setLoading(true);

    try {
      const response = await loginApi({ email, password, captchaToken });

      const token = response?.data?.data?.tokens?.access?.token;
      localStorage.setItem("book_publish_token", token);

      message.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      const status = error?.response?.data?.status;
      const errorMessage = error?.response?.data?.message || "Login failed";

      if (status === 400 && errorMessage.toLowerCase().includes("not verified")) {

        // ✅ Call sendOtpApi silently, then redirect after 2s
        setTimeout(async () => {
          try {
            await sendOtpApi({ email, type: "email_varification" });
          } catch (_) {
            // silent — user still gets redirected regardless
          } finally {
            const encodedEmail = btoa(email);
            const encodedType = btoa("email_varification");
            navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);
          }
        }, 2000);

        return;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form login-form">
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Enter a valid email address" },
          ]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <div className="cf-turnstile-wrapper">
          <div ref={turnstileRef}></div>
        </div>

        <div className="form-meta">
          <Link to="/auth/forgot-password-sendotp" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          disabled={!captchaToken}
          className="login-btn"
        >
          Login
        </Button>

        <div className="login-text">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;