import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { resetPasswordApi } from "../../../api/auth/auth.api";
import "./ChangePassword.scss"
const ChangePassword = () => {
  const [loading, setLoading] = useState(false);

const onFinish = async (values: any) => {
  if (values.new_password !== values.confirm_password) {
  }

  setLoading(true);

  try {
    const payload = {
      old_password: values.old_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };

    const response = await resetPasswordApi(payload);

    if (response?.data?.success) {
      message.success("Password changed successfully!");

      // ✅ clear auth
      localStorage.removeItem("book_publish_token");

      // ✅ redirect
      window.location.href = "/login";
    } else {
    }

  } catch (error: any) {
  
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="ChangePassword">
      <Form layout="vertical" onFinish={onFinish}>
        
        {/* Old Password */}
        <Form.Item
          label="Old Password"
          name="old_password"
          rules={[{ required: true, message: "Enter old password" }]}
        >
          <Input.Password />
        </Form.Item>

        {/* New Password */}
        <Form.Item
          label="New Password"
          name="new_password"
          rules={[
            { required: true, message: "Enter new password" },
            { min: 6, message: "Minimum 6 characters" }
          ]}
        >
          <Input.Password />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label="Confirm Password"
          name="confirm_password"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Passwords do not match");
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Change Password
        </Button>
      </Form>
    </div>
  );
};

export default ChangePassword;