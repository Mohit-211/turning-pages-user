import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { registerApi } from "../../api/auth/auth.api";
import "./Auth.scss";

const { Text } = Typography;

const SignUpForm = ({ signUpData = {}, setSignUpData = () => { } }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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
      };

      const response = await registerApi(payload);
      console.log(response, "response")
      if (response?.data?.success) {
        message.success(response?.data?.message);
        const encodedEmail = btoa(email);


        navigate(`/otp-verify?email=${encodedEmail}`);
      } else {
        setPasswordError(response?.data?.message || "Registration failed");
      }
    } catch (error) {
      setPasswordError(error?.response?.data?.message || "Something went wrong");
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
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input
            placeholder="Enter your full name"
            onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
          />
        </Form.Item>

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
            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
          />
        </Form.Item>

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

        <Form.Item
          label="Password"
          name="password"
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please create a password"
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (value.includes(" ")) {
                  return Promise.reject("Password cannot contain spaces");
                }
                if (value.length < 8) {
                  return Promise.reject("Password must be at least 8 characters long");
                }
                const digitMatches = value.match(/\d/g) || [];
                if (digitMatches.length < 2) {
                  return Promise.reject("Password must contain at least 2 digits");
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input.Password
            placeholder="Create a password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
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
            placeholder="Confirm your password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
          />
        </Form.Item>


        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form.Item>

        {/* <Text type="secondary">
          By signing up, you agree to our <a href="#terms">Terms of Service</a> and{" "}
          <a href="#privacy">Privacy Policy</a>
        </Text> */}

        <p className="signup-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Form>
    </div>
  );
};

export default SignUpForm;
