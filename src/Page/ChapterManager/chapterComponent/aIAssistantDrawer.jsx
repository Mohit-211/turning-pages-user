import React from "react";
import { Drawer, Input, Button } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";

export default function AIAssistantDrawer({
  visible,
  onClose,
  instruction,
  setInstruction,
  aiLoading,
  onGenerate,
}) {
  return (
    <Drawer
      title="AI Assistant"
      placement="right"
      width={380}
      open={visible}
      onClose={onClose}
    >
      <Input.TextArea
        rows={4}
        placeholder="Enter instruction (e.g. Continue the story...)"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
      />
      <Button
        type="primary"
        block
        icon={<ThunderboltOutlined />}
        loading={aiLoading}
        onClick={onGenerate}
        style={{ marginTop: 12 }}
      >
        Generate with AI
      </Button>
    </Drawer>
  );
}
