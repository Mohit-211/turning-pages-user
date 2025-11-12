import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import ReCAPTCHA from "react-google-recaptcha";   // ✅ import captcha
import { registerApi } from "../../api/auth/auth.api";
import "./Auth.scss";

const { Text } = Typography;

const SignUpForm = ({ signUpData = {}, setSignUpData = () => { } }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null); // ✅ captcha state

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
    // if (!captchaValue) {
    //   message.error("Please verify the reCAPTCHA");
    //   return;
    // }

    const { name, email, mobile, password, confirmPassword } = values;
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        mobile,
        password,
        confirm_password: confirmPassword,
        captcha: captchaValue, // ✅ send captcha token if needed in backend
      };
      const response = await registerApi(payload);
      console.log(response, "response");

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
      if (errorMsg?.includes("User is not verified yet")) {
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
    <div className="signup-container">
      <Form
        layout="vertical"
        onFinish={onFinish}
        className="signup-form"
        initialValues={signUpData}
      >
        {/* Full Name */}
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input
            placeholder="Enter your full name"
            onChange={(e) =>
              setSignUpData({ ...signUpData, name: e.target.value })
            }
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            placeholder="Enter your email"
            onChange={(e) =>
              setSignUpData({ ...signUpData, email: e.target.value })
            }
          />
        </Form.Item>

        {/* Mobile */}
        <Form.Item
          label="Mobile"
          name="mobile"
          rules={[
            { required: true, message: "Please enter your mobile number" },
            { pattern: /^\d{10}$/, message: "Mobile number must be 10 digits" },
          ]}
        >
          <Input
            placeholder="Enter your mobile number"
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setSignUpData({ ...signUpData, mobile: value });
            }}
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Password"
          name="password"
          hasFeedback
          rules={[
            { required: true, message: "Please create a password" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (value.includes(" ")) {
                  return Promise.reject("Password cannot contain spaces");
                }
                if (value.length < 8) {
                  return Promise.reject(
                    "Password must be at least 8 characters long"
                  );
                }
                const digitMatches = value.match(/\d/g) || [];
                if (digitMatches.length < 2) {
                  return Promise.reject(
                    "Password must contain at least 2 digits"
                  );
                }
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

        {/* Confirm Password */}
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
            placeholder="Confirm your password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            onChange={(e) =>
              setSignUpData({ ...signUpData, confirmPassword: e.target.value })
            }
          />
        </Form.Item>

        {/* ✅ ReCAPTCHA */}
        <Form.Item style={{ justifySelf: "center", textAlign: "center" }}>
          <ReCAPTCHA
            sitekey="6LdpsOgrAAAAAPx-8vWg-L8aBFYI_K2Y-eHzoutI"
            onChange={(value) => setCaptchaValue(value)}
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form.Item>

        <p className="signup-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Form>
    </div>
  );
};

export default SignUpForm;
