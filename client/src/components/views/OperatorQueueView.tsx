import {
  CheckCircleOutlined,
  StopOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Button, Segmented, Space, Tag } from "antd";
import { useState } from "react";
import type { PendingItemRecord } from "../../types";
import { DynamicGrid, type DynamicColumnType } from "../DynamicGrid";

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
  const [tab, setTab] = useState<"pending" | "granted">("pending");

  const pendingColumns: DynamicColumnType<PendingItemRecord>[] = [
    {
      title: "Ticket #",
      dataIndex: ["ticket", "ticketNumber"],
      key: "ticketNumber",
      width: "12%",
      render: (t: string) => <strong style={{ color: "#2563eb" }}>{t}</strong>,
    },
    {
      title: "User",
      dataIndex: ["ticket", "createdBy"],
      key: "createdBy",
      width: "14%",
    },
    {
      title: "Folder Path",
      dataIndex: ["item", "folderPath"],
      key: "folderPath",
      width: "22%",
      render: (text: string) => (
        <span className="folder-code-badge">{text}</span>
      ),
    },
    {
      title: "Requested Access",
      dataIndex: ["item", "accessType"],
      key: "accessType",
      width: "12%",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Confirmed Access",
      dataIndex: ["item", "confirmAccessType"],
      key: "confirmAccessType",
      width: "12%",
      render: (text: string, record) => (
        <Tag color="purple" style={{ fontWeight: 600 }}>
          {text || record.item.accessType}
        </Tag>
      ),
      exportValue: (text: string, record) => text || record.item.accessType,
    },
    {
      title: "Reason",
      dataIndex: ["item", "reasonForAccess"],
      key: "reasonForAccess",
      width: "14%",
    },
    {
      title: "Actions",
      key: "actions",
      width: "14%",
      exportable: false,
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
  ];

  const grantedColumns: DynamicColumnType<PendingItemRecord>[] = [
    {
      title: "Ticket #",
      dataIndex: ["ticket", "ticketNumber"],
      key: "ticketNumber",
      width: "12%",
      render: (t: string) => <strong style={{ color: "#2563eb" }}>{t}</strong>,
    },
    {
      title: "User",
      dataIndex: ["ticket", "createdBy"],
      key: "createdBy",
      width: "14%",
    },
    {
      title: "Folder Path",
      dataIndex: ["item", "folderPath"],
      key: "folderPath",
      width: "24%",
      render: (text: string) => (
        <span className="folder-code-badge">{text}</span>
      ),
    },
    {
      title: "Confirmed Access",
      dataIndex: ["item", "confirmAccessType"],
      key: "confirmAccessType",
      width: "14%",
      render: (text: string, record) => (
        <Tag color="purple" style={{ fontWeight: 600 }}>
          {text || record.item.accessType}
        </Tag>
      ),
      exportValue: (text: string, record) => text || record.item.accessType,
    },
    {
      title: "Granted On",
      dataIndex: ["item", "grantedAt"],
      key: "grantedAt",
      width: "16%",
      render: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
      exportValue: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
    },
    {
      title: "Expires On",
      dataIndex: ["item", "expiresAt"],
      key: "expiresAt",
      width: "10%",
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : "-"),
      exportValue: (d: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Action",
      key: "action",
      width: "10%",
      exportable: false,
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
  ];

  const searchFilter = (record: PendingItemRecord, query: string) =>
    record.ticket.ticketNumber.toLowerCase().includes(query) ||
    record.ticket.createdBy.toLowerCase().includes(query) ||
    record.item.folderPath.toLowerCase().includes(query) ||
    record.item.reasonForAccess.toLowerCase().includes(query) ||
    record.item.accessType.toLowerCase().includes(query);

  const tabSwitcher = (
    <Segmented
      value={tab}
      onChange={(val) => setTab(val as "pending" | "granted")}
      size="middle"
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
  );

  return (
    <DynamicGrid<PendingItemRecord>
      dataSource={tab === "pending" ? pendingItems : grantedItems}
      columns={tab === "pending" ? pendingColumns : grantedColumns}
      rowKey={(record) => record.item.id.toString()}
      title="Operator Fulfillment Console"
      subTitle="Execute folder sharing commands in Active Directory, grant permissions, and revoke access when required."
      headerActions={tabSwitcher}
      searchPlaceholder="Search operator tasks by ticket, user, or path..."
      customFilter={searchFilter}
      emptyText={
        tab === "pending"
          ? "No pending Operator actions"
          : "No active granted access items found"
      }
    />
  );
}
