import React from "react";
import { List, Button, Tooltip, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

export default function ChapterList({
  chapters,
  selectedId,
  onSelect,
  onDelete,
  onAdd,
}) {
  return (
    <div className="chapter-list-wrapper">
      <div className="sider-header">
        <h3>Chapters</h3>
        <Tooltip title="Add new chapter">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={onAdd}
          />
        </Tooltip>
      </div>

      <List
        className="chapter-list"
        dataSource={chapters}
        renderItem={(item) => (
          <List.Item
            className={item.id === selectedId ? "active" : ""}
            onClick={() => onSelect(item.id)}
            actions={[
              <Popconfirm
                title="Delete chapter?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDelete(item.id)} // ✅ delete works
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={(e) => e.stopPropagation()} // prevent select
                />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={`${item.word_count || 0} words`}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
