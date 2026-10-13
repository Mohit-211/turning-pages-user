import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { sendOtpApi } from "../../api/auth/auth.api";
import "./Auth.scss";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      // Always 200, even for unknown emails, so the user goes to the OTP step either way.
      await sendOtpApi({ email, type: "forgot_password" });
      const encodedEmail = btoa(email);
      const encodedType = btoa("forgot_password");
      navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);
    } catch {
      // The API client shows the server message (e.g. 429 rate limit).
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <Form name="forgot-password" layout="vertical" onFinish={onFinish} autoComplete="off">
        <p>Enter your account email and we'll send you a code to reset your password.</p>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Send OTP
          </Button>
        </Form.Item>
        <Form.Item>
          <div className="login-text">
            Remembered it? <Link to="/login">Back to Login</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
