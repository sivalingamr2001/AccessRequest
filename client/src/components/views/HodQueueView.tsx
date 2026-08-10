import {
  Button,
  Card,
  Empty,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import type { PendingItemRecord } from "../../types";

const { Title, Text } = Typography;

interface Props {
  items: PendingItemRecord[];
  onApprove: (record: PendingItemRecord, role: "HOD" | "OWNER") => void;
  onReject: (record: PendingItemRecord, role: "HOD" | "OWNER") => void;
}

export default function HodQueueView({ items, onApprove, onReject }: Props) {
  const [searchText, setSearchText] = useState("");

  const filtered = items.filter((record) => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      record.ticket.ticketNumber.toLowerCase().includes(query) ||
      record.ticket.createdBy.toLowerCase().includes(query) ||
      record.item.folderPath.toLowerCase().includes(query) ||
      record.item.reasonForAccess.toLowerCase().includes(query) ||
      record.item.accessType.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={2} className="gradient-header" style={{ margin: 0 }}>
            HOD Approval Console
          </Title>
          <Text type="secondary">
            Review and approve access items requested by your department or
            folder mappings.
          </Text>
        </div>
        <Input.Search
          placeholder="Search pending approvals..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
        />
      </div>

      <Card className="premium-card">
        <Table
          dataSource={filtered}
          rowKey={(record) => record.item.id.toString()}
          columns={[
            {
              title: "Ticket #",
              dataIndex: ["ticket", "ticketNumber"],
              key: "ticketNumber",
              width: 140,
              render: (t: string) => (
                <strong style={{ color: "#2563eb" }}>{t}</strong>
              ),
            },
            {
              title: "Requester",
              dataIndex: ["ticket", "createdBy"],
              key: "createdBy",
              width: 150,
            },
            {
              title: "Folder Path",
              dataIndex: ["item", "folderPath"],
              key: "folderPath",
              render: (text: string) => (
                <span className="folder-code-badge">{text}</span>
              ),
            },
            {
              title: "Requested Access",
              dataIndex: ["item", "accessType"],
              key: "accessType",
              width: 130,
              render: (text: string) => <Tag color="blue">{text}</Tag>,
            },
            {
              title: "Confirmed Access",
              dataIndex: ["item", "confirmAccessType"],
              key: "confirmAccessType",
              width: 130,
              render: (text: string) =>
                text ? (
                  <Tag color="purple">{text}</Tag>
                ) : (
                  <Text type="secondary">-</Text>
                ),
            },
            {
              title: "Reason",
              dataIndex: ["item", "reasonForAccess"],
              key: "reasonForAccess",
            },
            {
              title: "Approval Stage",
              key: "stage",
              width: 130,
              render: (_, record) =>
                record.item.status === "PENDING_FOLDER_OWNER" ? (
                  <Tag color="purple">Folder Owner</Tag>
                ) : (
                  <Tag color="cyan">Dept HOD</Tag>
                ),
            },
            {
              title: "Actions",
              key: "actions",
              width: 180,
              render: (_: any, record: PendingItemRecord) => {
                const role =
                  record.item.status === "PENDING_FOLDER_OWNER"
                    ? "OWNER"
                    : "HOD";
                return (
                  <Space>
                    <Button
                      type="primary"
                      style={{
                        background: "#22c55e",
                        color: "#fff",
                        borderColor: "#22c55e",
                      }}
                      onClick={() => onApprove(record, role)}
                    >
                      Approve
                    </Button>
                    <Button danger onClick={() => onReject(record, role)}>
                      Reject
                    </Button>
                  </Space>
                );
              },
            },
          ]}
          locale={{
            emptyText: <Empty description="No pending HOD approval items" />,
          }}
        />
      </Card>
    </div>
  );
}
