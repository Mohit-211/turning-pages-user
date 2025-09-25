import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../api/auth/auth.api";
import "./Auth.scss";
const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      const token = response.data.token;
      localStorage.setItem("book_publish_token", token);
      message.success("Login Successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {

      const errorMessage = error?.response?.data?.message || "Login failed";

      // Redirect only if user is not verified
      if (
        errorMessage.includes("not verified") ||
        errorMessage.includes("verify Your Otp")
      ) {
        message.info(`${errorMessage} Redirecting to OTP verification...`);

        const encodedEmail = btoa(email);
        const encodedType = btoa("email_varification");
        setTimeout(() => {
          navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);
        }, 10000); // 10 seconds
        return;
      }

      // All other errors (invalid password, email, etc) show error only
      message.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-form">
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
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>
        <Form.Item>
          <Link to="/auth/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <div className="login-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};
export default LoginForm;