import React, { useState } from "react";
import "./BookHeader.scss";
import { Save, Send } from "lucide-react";
import { GetBooksByStatusApi } from "../../../api/operations/book.api";
import { message } from "antd";
export default function BookHeader({ bookId, title }) {
    const [loading, setLoading] = useState(false);
    const handleSave = async (status) => {
        console.log(status, "status")
        try {
            const payload = {
                book_id: bookId,
                status: status,
            };
            setLoading(true);
            const res = await GetBooksByStatusApi(payload);
            console.log("Saved:", res.data);
            message.success("Saved")
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };
    return (
        <div className="book-header">
            <div className="book-title">
                <span className="book-icon">📘</span>
                <h3>{title}</h3>
            </div>
            <div className="actions">
                <button
                    className="action-btn"
                    onClick={() => handleSave("draft")}
                    disabled={loading}
                >
                    <Save size={16} />
                    Save Draft
                </button>
                <button
                    className="submit-btn"
                    onClick={() => handleSave("in-editing")}
                    disabled={loading}
                >
                    <Send size={16} />
                    Submit for Editing
                </button>
            </div>
        </div>
    );
}