import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { sendOtpApi } from "../../../api/auth/auth.api";

const SendOtp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

 const onFinish = async ({ email }: { email: string }) => {
        setLoading(true);

        try {
            await sendOtpApi({ email ,type:"forgot_password"});

            message.success("OTP sent to your email!");

            const encodedEmail = btoa(email);
            const encodedType = btoa("forgot_password");

            navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);

        } catch (error: any) {
           
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="auth-form send-otp-form">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Enter valid email" },
          ]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Send OTP
        </Button>
      </Form>
    </div>
  );
};

export default SendOtp;