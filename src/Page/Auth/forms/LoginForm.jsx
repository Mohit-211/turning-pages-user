import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../../api/auth/auth.api";

import "./LoginForm.scss";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email, password }) => {
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      const token = response?.data?.data?.tokens?.access?.token;

      localStorage.setItem("book_publish_token", token);
      message.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Login failed";

      if (
        errorMessage.includes("not verified") ||
        errorMessage.includes("verify Your Otp")
      ) {
        message.info(`${errorMessage} Redirecting to OTP verification…`);

        const encodedEmail = btoa(email);
        const encodedType = btoa("email_varification");

        setTimeout(() => {
          navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);
        }, 10000);

        return;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form login-form">
      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
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

        <div className="form-meta">
          <Link to="/auth/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="login-btn"
        >
          Login
        </Button>

        <div className="login-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
