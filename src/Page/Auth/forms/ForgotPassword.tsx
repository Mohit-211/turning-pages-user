import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { forgotPasswordApi } from "../../../api/auth/auth.api";
import "./ForgotPassword.scss"
const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
console.log(location,"======")
  const { email, token } = location.state || {};

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (!email || !token) {
      message.error("Invalid request. Please try again.");
      return;
    }

    if (values.password !== values.confirm_password) {
      return message.error("Passwords do not match");
    }

    setLoading(true);

    try {
      const payload = {
        email,
        password: values.password,
        confirm_password: values.confirm_password,
        token,
      };

      const response = await forgotPasswordApi(payload);

      if (response?.data?.success) {
        message.success("Password reset successfully!");
        navigate("/login");
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ForgotPassword">
      <Form layout="vertical" onFinish={onFinish}>
        
        <Form.Item
          label="New Password"
          name="password"
          rules={[{ required: true, message: "Enter password" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirm_password"
          rules={[{ required: true, message: "Confirm password" }]}
        >
          <Input.Password />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Reset Password
        </Button>
      </Form>
    </div>
  );
};

export default ForgotPassword;