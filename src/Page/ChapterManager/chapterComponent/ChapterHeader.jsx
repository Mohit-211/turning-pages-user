import React, { useState } from "react";
import { Button } from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";

const ChapterHeader = ({
  chapter,
  onSave,
  saving,
  previewClick,
  editClick,
}) => {
  const [mode, setMode] = useState("edit"); // 'edit' | 'preview'

  const handlePreview = () => {
    setMode("preview");
    previewClick("preview");
  };

  const handleEdit = () => {
    setMode("edit");
    editClick("edit");
  };

  return (
    <div className="editor-header">
      <h2>{chapter?.title}</h2>

      <div className="btn-group-preview">
        {/* SHOW PREVIEW BUTTON ONLY IN EDIT MODE */}
        {mode === "edit" && (
          <Button
            icon={<EyeOutlined />}
            onClick={handlePreview}
          >
            Preview
          </Button>
        )}

        {/* SHOW EDIT BUTTON ONLY IN PREVIEW MODE */}
        {mode === "preview" && (
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            Edit
          </Button>
        )}

        {/* SAVE BUTTON ALWAYS VISIBLE */}
        <Button
          icon={<SaveOutlined />}
          loading={saving}
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default ChapterHeader;
