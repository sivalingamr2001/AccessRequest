import {
  CheckCircleOutlined,
  StopOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Input,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import type { PendingItemRecord } from "../../types";

const { Title, Text } = Typography;

interface Props {
  pendingItems: PendingItemRecord[];
  grantedItems: PendingItemRecord[];
  onGrant: (record: PendingItemRecord) => void;
  onDeny: (record: PendingItemRecord) => void;
  onRevoke: (record: PendingItemRecord) => void;
}

export default function OperatorQueueView({
  pendingItems,
  grantedItems,
  onGrant,
  onDeny,
  onRevoke,
}: Props) {
  const [searchText, setSearchText] = useState("");
  const [tab, setTab] = useState<"pending" | "granted">("pending");

  const matches = (record: PendingItemRecord) => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      record.ticket.ticketNumber.toLowerCase().includes(query) ||
      record.ticket.createdBy.toLowerCase().includes(query) ||
      record.item.folderPath.toLowerCase().includes(query) ||
      record.item.reasonForAccess.toLowerCase().includes(query) ||
      record.item.accessType.toLowerCase().includes(query)
    );
  };

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
            Operator Fulfillment Console
          </Title>
          <Text type="secondary">
            Execute folder sharing commands in Active Directory, grant
            permissions, and revoke access when required.
          </Text>
        </div>
        <Input.Search
          placeholder="Search operator tasks by ticket, user, or path..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={tab}
          onChange={(val) => setTab(val as "pending" | "granted")}
          size="large"
          options={[
            {
              label: (
                <Space>
                  <ToolOutlined />
                  <span>Pending Tasks</span>
                  <Tag color="orange" style={{ marginLeft: 4 }}>
                    {pendingItems.length}
                  </Tag>
                </Space>
              ),
              value: "pending",
            },
            {
              label: (
                <Space>
                  <CheckCircleOutlined />
                  <span>Active Granted Access</span>
                  <Tag color="green" style={{ marginLeft: 4 }}>
                    {grantedItems.length}
                  </Tag>
                </Space>
              ),
              value: "granted",
            },
          ]}
        />
      </div>

      {tab === "pending" ? (
        <Card className="premium-card">
          <Table
            dataSource={pendingItems.filter(matches)}
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
                title: "User",
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
                width: 140,
                render: (text: string, record) => (
                  <Tag color="purple" style={{ fontWeight: 600 }}>
                    {text || record.item.accessType}
                  </Tag>
                ),
              },
              {
                title: "Reason",
                dataIndex: ["item", "reasonForAccess"],
                key: "reasonForAccess",
              },
              {
                title: "Actions",
                key: "actions",
                width: 230,
                render: (_: any, record: PendingItemRecord) => (
                  <Space>
                    <Button
                      type="primary"
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={() => onGrant(record)}
                    >
                      Grant Access
                    </Button>
                    <Button danger onClick={() => onDeny(record)}>
                      Deny Request
                    </Button>
                  </Space>
                ),
              },
            ]}
            locale={{
              emptyText: <Empty description="No pending Operator actions" />,
            }}
          />
        </Card>
      ) : (
        <Card className="premium-card">
          <Table
            dataSource={grantedItems.filter(matches)}
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
                title: "User",
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
                title: "Confirmed Access",
                dataIndex: ["item", "confirmAccessType"],
                key: "confirmAccessType",
                width: 140,
                render: (text: string, record) => (
                  <Tag color="purple" style={{ fontWeight: 600 }}>
                    {text || record.item.accessType}
                  </Tag>
                ),
              },
              {
                title: "Granted On",
                dataIndex: ["item", "grantedAt"],
                key: "grantedAt",
                width: 170,
                render: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
              },
              {
                title: "Expires On",
                dataIndex: ["item", "expiresAt"],
                key: "expiresAt",
                width: 130,
                render: (d: string) =>
                  d ? new Date(d).toLocaleDateString() : "-",
              },
              {
                title: "Action",
                key: "action",
                width: 160,
                render: (_: any, record: PendingItemRecord) => (
                  <Button
                    danger
                    type="primary"
                    ghost
                    icon={<StopOutlined />}
                    onClick={() => onRevoke(record)}
                  >
                    Revoke Access
                  </Button>
                ),
              },
            ]}
            locale={{
              emptyText: (
                <Empty description="No active granted access items found" />
              ),
            }}
          />
        </Card>
      )}
    </div>
  );
}
