import React, { useState } from "react";
import { Modal, Input } from "antd";

export default function AddChapterModal({ visible, onCancel, onCreate, loading }) {
  const [title, setTitle] = useState("");
  return (
    <Modal
      title="Add Chapter"
      open={visible}
      onOk={() => onCreate(title)}
      onCancel={onCancel}
      okText="Create"
      confirmLoading={loading}
    >
      <Input
        placeholder="Chapter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </Modal>
  );
}
