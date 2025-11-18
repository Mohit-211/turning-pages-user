// Toolbar.jsx
import React from "react";
import { Button } from "antd";
import { EditOutlined, UploadOutlined, RobotOutlined } from "@ant-design/icons";

export default function Toolbar({ onOpenAIAssistant, onOpenUploadModal }) {
  return (
    <div className="top-toolbar">
      {/* <Button icon={<EditOutlined />}>Write Manually</Button> */}
      <Button icon={<UploadOutlined />} onClick={onOpenUploadModal}>
        Upload
      </Button>
      <Button icon={<RobotOutlined />} onClick={onOpenAIAssistant}>
        AI Assistant
      </Button>
    </div>
  );
}
