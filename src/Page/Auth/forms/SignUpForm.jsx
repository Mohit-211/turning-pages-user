import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Row, Col } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import ReCAPTCHA from "react-google-recaptcha";
import { registerApi } from "../../../api/auth/auth.api";

import "./SignUpForm.scss";

const { Text } = Typography;

const SignUpForm = ({ signUpData = {}, setSignUpData = () => {} }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);

  useEffect(() => {
    if (!signUpData?.confirmPassword) {
      setPasswordError("");
      return;
    }

    if (signUpData?.password !== signUpData?.confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [signUpData?.password, signUpData?.confirmPassword]);

  const onFinish = async (values) => {
    const { name, last_name, email, mobile, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!captchaValue) {
      setPasswordError("Please verify captcha");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        last_name, // ✅ added
        email,
        mobile,
        password,
        confirm_password: confirmPassword,
        captcha: captchaValue,
      };

      const response = await registerApi(payload);

      if (response?.data?.success) {
        message.success(response?.data?.message);

        const encodedEmail = btoa(email);
        const encodedType = btoa("email_varification");

        navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);
      } else {
        setPasswordError(response?.data?.message || "Registration failed");
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message;

      if (errorMsg?.includes("not verified")) {
        const encodedEmail = btoa(values.email);
        const encodedType = btoa("email_varification");

        navigate(`/otp-verify?email=${encodedEmail}&type=${encodedType}`);
      } else {
        setPasswordError(errorMsg || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form signup-form">
      <Form layout="vertical" onFinish={onFinish} initialValues={signUpData}>
        
       <Row gutter={16}>
  {/* First Name */}
  <Col xs={24} md={12}>
    <Form.Item
      label="First Name"
      name="name"
      rules={[{ required: true, message: "Enter first name" }]}
    >
      <Input
        placeholder="First name"
        onChange={(e) =>
          setSignUpData({ ...signUpData, name: e.target.value })
        }
      />
    </Form.Item>
  </Col>

  {/* Last Name */}
  <Col xs={24} md={12}>
    <Form.Item
      label="Last Name"
      name="last_name"
      rules={[{ required: true, message: "Enter last name" }]}
    >
      <Input
        placeholder="Last name"
        onChange={(e) =>
          setSignUpData({ ...signUpData, last_name: e.target.value })
        }
      />
    </Form.Item>
  </Col>
</Row>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            placeholder="you@example.com"
            onChange={(e) =>
              setSignUpData({ ...signUpData, email: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="mobile"
          rules={[
            { required: true, message: "Please enter your phone number" },
            { pattern: /^\d{10}$/, message: "Phone number must be 10 digits" },
          ]}
        >
          <Input
            placeholder="10-digit phone number"
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setSignUpData({ ...signUpData, mobile: value });
            }}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          hasFeedback
          rules={[
            { required: true, message: "Please create a password" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (value.includes(" "))
                  return Promise.reject("No spaces allowed");
                if (value.length < 8)
                  return Promise.reject("At least 8 characters required");

                const digits = value.match(/\d/g) || [];
                if (digits.length < 2)
                  return Promise.reject("At least 2 digits required");

                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password
            placeholder="Create a password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            onChange={(e) =>
              setSignUpData({ ...signUpData, password: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
        >
          <Input.Password
            placeholder="Confirm your password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            onChange={(e) =>
              setSignUpData({
                ...signUpData,
                confirmPassword: e.target.value,
              })
            }
          />
        </Form.Item>

        {passwordError && (
          <Text type="danger" className="password-error">
            {passwordError}
          </Text>
        )}

        <div className="captcha-wrap">
          <ReCAPTCHA
            sitekey="6LdpsOgrAAAAAPx-8vWg-L8aBFYI_K2Y-eHzoutI"
            onChange={(value) => setCaptchaValue(value)}
          />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="signup-btn"
        >
          Sign Up
        </Button>

        <p className="signup-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Form>
    </div>
  );
};

export default SignUpForm;