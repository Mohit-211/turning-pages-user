import { useEffect, useState } from "react";
import { Modal, Button, Input, List, Tag, Radio, message, Skeleton } from "antd";
import { CreateSupportApi, GetAllSupportApi, GetSupportByIdApi } from "../../api/operations/support.api";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isRaiseModalVisible, setIsRaiseModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form fields
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("low"); // default priority

  // Fetch all tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await GetAllSupportApi();
      setTickets(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Open ticket details
  const openDetails = async (ticket) => {
    try {
      const res = await GetSupportByIdApi(ticket.id);
      setSelectedTicket(res?.data?.data);
      setIsDetailsModalVisible(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit new ticket
  const handleSubmit = async () => {
    if (!subject || !query) {
      return message.warning("Please fill all fields");
    }

    const payload = {
      subject,
      description: query,
      priority, // 'low', 'medium', 'high', 'urgent'
    };

    try {
      await CreateSupportApi(payload);
      message.success("Ticket created successfully");
      setIsRaiseModalVisible(false);
      setSubject("");
      setQuery("");
      setPriority("low");
      fetchTickets(); // Refresh ticket list
    } catch (err) {
      console.error(err);
    }
  };

  // Map priority to tag color
  const getPriorityColor = (p) => {
    switch (p) {
      case "low": return "green";
      case "medium": return "blue";
      case "high": return "orange";
      case "urgent": return "red";
      default: return "default";
    }
  };

  return (
    <div style={{ padding: 32, minHeight: "100vh", background: "#f5f7fb" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Support</h1>
        <Button type="primary" onClick={() => setIsRaiseModalVisible(true)}>
          + Raise Ticket
        </Button>
      </div>

      {/* Ticket List */}
      {loading ? (
        <List
          itemLayout="horizontal"
          dataSource={[1, 2, 3, 4]} // Skeleton placeholders
          renderItem={() => (
            <List.Item style={{ background: "#fff", padding: 20, marginBottom: 12, borderRadius: 12 }}>
              <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 2 }} />
            </List.Item>
          )}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={tickets}
          renderItem={(ticket) => (
            <List.Item
              onClick={() => openDetails(ticket)}
              style={{
                background: "#fff",
                padding: 20,
                marginBottom: 12,
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ marginBottom: 6 }}>{ticket?.subject}</h3>
                <p style={{ margin: 0, color: "#6b7280", marginBottom: 6 }}>{ticket?.ticket_code}</p>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  <strong>Create Ticket:</strong> {new Date(ticket.created_at).toLocaleString()}
                </p>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  <strong>Last Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Tag color={ticket.status === "in-progress" ? "blue" : "orange"}>
                  {ticket.status === "in-progress" ? "In Progress" : "Pending"}
                </Tag>
                {ticket.priority && (
                  <Tag color={getPriorityColor(ticket.priority)}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </Tag>
                )}
              </div>
            </List.Item>
          )}
        />
      )}

      {/* Raise Ticket Modal */}
      <Modal
        title="Raise Support Ticket"
        open={isRaiseModalVisible}
        onCancel={() => setIsRaiseModalVisible(false)}
        onOk={handleSubmit}
        okText="Submit Ticket"
      >
        <label>Subject</label>
        <Input
          placeholder="Enter subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ marginBottom: 12, marginTop: 6 }}
        />

        <label>Your Query</label>
        <Input.TextArea
          rows={4}
          placeholder="Describe your issue..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div style={{ marginTop: 12 }}>
          <label><strong>Priority:</strong></label>
          <Radio.Group
            onChange={(e) => setPriority(e.target.value)}
            value={priority}
            style={{ marginTop: 6 }}
          >
            <Radio value="low">Low</Radio>
            <Radio value="medium">Medium</Radio>
            <Radio value="high">High</Radio>
            <Radio value="urgent">Urgent</Radio>
          </Radio.Group>
        </div>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        title="Ticket Details"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedTicket ? (
          <>
            <p><strong>ID:</strong> {selectedTicket.ticket_code}</p>
            <p><strong>Subject:</strong> {selectedTicket.subject}</p>
            <p><strong>Query:</strong> {selectedTicket.description}</p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedTicket.status === "in-progress" ? "In Progress" : "Pending"}
            </p>
            {selectedTicket.priority && (
              <Tag color={getPriorityColor(selectedTicket.priority)}>
                {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
              </Tag>
            )}
          </>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    </div>
  );
}
