import { Button, Space, Tag, Typography } from "antd";
import type { PendingItemRecord } from "../../types";
import { renderStatusTag } from "../../utils/statusTag";
import { DynamicGrid, type DynamicColumnType } from "../DynamicGrid";

const { Text } = Typography;

interface Props {
  items: PendingItemRecord[];
  onApprove: (record: PendingItemRecord, role: "HOD" | "OWNER") => void;
  onReject: (record: PendingItemRecord, role: "HOD" | "OWNER") => void;
}

export default function HodQueueView({ items, onApprove, onReject }: Props) {
  const columns: DynamicColumnType<PendingItemRecord>[] = [
    {
      title: "Ticket #",
      dataIndex: ["ticket", "ticketNumber"],
      key: "ticketNumber",
      width: "12%",
      render: (t: string) => <strong style={{ color: "#2563eb" }}>{t}</strong>,
    },
    {
      title: "Requester",
      dataIndex: ["ticket", "createdBy"],
      key: "createdBy",
      width: "13%",
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
      render: (text: string) =>
        text ? (
          <Tag color="purple">{text}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
      exportValue: (text: string) => text || "-",
    },
    {
      title: "Reason",
      dataIndex: ["item", "reasonForAccess"],
      key: "reasonForAccess",
      width: "14%",
    },
    {
      title: "Approval Stage",
      key: "stage",
      width: "11%",
      render: (_, record) =>
        record.item.status === "PENDING_FOLDER_OWNER" ? (
          <Tag color="purple">Folder Owner</Tag>
        ) : (
          <Tag color="cyan">Dept HOD</Tag>
        ),
      exportValue: (_, record) =>
        record.item.status === "PENDING_FOLDER_OWNER"
          ? "Folder Owner"
          : "Dept HOD",
    },
    {
      title: "Actions",
      key: "actions",
      width: "14%",
      exportable: false,
      render: (_: any, record: PendingItemRecord) => {
        const status = record.item.status;
        const isPending =
          status === "PENDING_DEPT_HOD" || status === "PENDING_FOLDER_OWNER";

        if (!isPending) {
          return renderStatusTag(status);
        }

        const role = status === "PENDING_FOLDER_OWNER" ? "OWNER" : "HOD";
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
  ];

  return (
    <DynamicGrid<PendingItemRecord>
      dataSource={items}
      columns={columns}
      rowKey={(record) => record.item.id.toString()}
      title="HOD Approval Console"
      subTitle="Review and approve access items requested by your department or folder mappings."
      searchPlaceholder="Search pending approvals by ticket, requester, path, reason..."
      customFilter={(record, query) =>
        record.ticket.ticketNumber.toLowerCase().includes(query) ||
        record.ticket.createdBy.toLowerCase().includes(query) ||
        record.item.folderPath.toLowerCase().includes(query) ||
        record.item.reasonForAccess.toLowerCase().includes(query) ||
        record.item.accessType.toLowerCase().includes(query)
      }
      emptyText="No pending HOD approval items"
    />
  );
}
