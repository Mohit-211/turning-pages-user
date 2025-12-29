import React from 'react'
import { Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
const ChapterHeader = ({chapter,onSave, saving, previewClick, editClick }) => {
    return (
        <div className="editor-header">
            <h2>{chapter?.title}</h2>
            <div className="btn-group-preview">
                <Button icon={<SaveOutlined />} onClick={() => { previewClick("preview") }}>
                    Preview
                </Button>
            
                <Button icon={<SaveOutlined />} onClick={() => { editClick("edit") }}>
                    Edit
                </Button>
                <Button icon={<SaveOutlined />} loading={saving} onClick={onSave}>
                    Save
                </Button>
                
            </div>
        </div>
    )
}

export default ChapterHeader