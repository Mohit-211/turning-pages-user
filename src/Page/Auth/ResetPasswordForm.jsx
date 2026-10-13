import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { forgotPasswordApi } from "../../api/auth/auth.api";
import { passwordRule } from "../../constants/validation";
import "./Auth.scss";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { email, token } = location.state || {};

  // The reset token comes from the OTP step; without it the flow has to start over.
  if (!email || !token) return <Navigate to="/forgot-password" replace />;

  const onFinish = async ({ password, confirmPassword }) => {
    setLoading(true);
    try {
      await forgotPasswordApi({ email, token, password, confirm_password: confirmPassword });
      // A reset signs the user out on every device.
      localStorage.removeItem("book_publish_token");
      message.success("Password changed successfully. Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      // Expired, used or wrong token: the code has to be requested again.
      if (error?.response?.data?.message?.includes("Token is not Valid")) {
        navigate("/forgot-password", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <Form name="reset-password" layout="vertical" onFinish={onFinish} autoComplete="off">
        <p>Set a new password for {email}.</p>
        <Form.Item
          label="New Password"
          name="password"
          hasFeedback
          rules={[{ required: true, message: "Please create a password" }, passwordRule]}
        >
          <Input.Password
            placeholder="Create a new password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm your new password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Reset Password
          </Button>
        </Form.Item>
        <Form.Item>
          <div className="login-text">
            <Link to="/login">Back to Login</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
