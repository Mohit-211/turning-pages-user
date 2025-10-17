import React, { useEffect, useState } from "react";
import { Form, Input, Button, Avatar, Skeleton, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { UpdateUserProfileApi, UserProfileApi } from "../../api/users/users.api";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await UserProfileApi();
      const data = res?.data?.data;
      setUser(data);

      form.setFieldsValue({
        name: data?.user_profile?.name || "",
        mobile: data?.user_profile?.mobile || "",
        email: data?.email || "",
      });
    } catch (error) {
      message.error("Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await UpdateUserProfileApi(values);
      message.success("Profile updated successfully");
      loadProfile();
    } catch (error) {
      message.error("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div className="profile-page">
      <div className="cover-photo"></div>

      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-section">
            <Avatar
              size={100}
              src="https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
            />
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              className="edit-avatar"
            />
          </div>
          <div>
            <h2 className="username">{user?.user_profile?.name}</h2>
          </div>
        </div>
        <Button
          type="primary"
          className="save-btn"
          onClick={() => form.submit()}
          loading={saving}
        >
          Save changes
        </Button>
      </div>

      <div className="form-section">
        <h3>Personal details</h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="profile-form"
        >
          <div className="form-grid">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="form-grid">
            <Form.Item
              label="Mobile number"
              name="mobile"
              rules={[{ required: true, message: "Please enter mobile number" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email ID"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
