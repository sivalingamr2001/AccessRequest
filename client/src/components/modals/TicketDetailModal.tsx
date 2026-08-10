import { StopOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type {
  AccessItemDto,
  ApprovalLog,
  TicketDto,
  UserDetailsDto,
} from "../../types";
import { renderStatusTag } from "../../utils/statusTag";

const { Text } = Typography;

interface Props {
  open: boolean;
  ticket: TicketDto | null;
  currentUser: UserDetailsDto;
  approvalLogs: ApprovalLog[];
  onClose: () => void;
  onEdit: (t: TicketDto) => void;
  onResubmit: (t: TicketDto) => void;
  onViewLogs: (item: AccessItemDto) => void;
  onRevoke: (ticket: TicketDto, item: AccessItemDto) => void;
}

export default function TicketDetailModal({
  open,
  ticket,
  currentUser,
  approvalLogs,
  onClose,
  onEdit,
  onResubmit,
  onViewLogs,
  onRevoke,
}: Props) {
  if (!ticket) return <Modal open={open} onCancel={onClose} footer={null} />;

  const isOwner =
    ticket.createdBy.toLowerCase() === currentUser.userName.toLowerCase();
  const isPending = ticket.items?.some(
    (i) =>
      i.status === "PENDING_DEPT_HOD" || i.status === "PENDING_FOLDER_OWNER",
  );
  const isRejectedOrExpired = ticket.items?.some(
    (i) =>
      i.status.startsWith("REJECTED") ||
      i.status === "EXPIRED" ||
      i.status.startsWith("REVOKED"),
  );
  const isOperatorOrAdmin = currentUser.roles.some(
    (r) => r === "Operator" || r === "Admin",
  );

  return (
    <Modal
      title={`Ticket Details: ${ticket.ticketNumber}`}
      open={open}
      onCancel={onClose}
      width={940}
      footer={[
        isOwner &&
          (isPending ? (
            <Button key="edit" type="primary" onClick={() => onEdit(ticket)}>
              Edit Request
            </Button>
          ) : isRejectedOrExpired ? (
            <Button
              key="resubmit"
              style={{
                background: "#d97706",
                color: "#fff",
                borderColor: "#d97706",
              }}
              onClick={() => onResubmit(ticket)}
            >
              Resubmit Request
            </Button>
          ) : null),
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <div className="info-banner-card">
        <Row gutter={[20, 10]} align="middle">
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Requester
            </Text>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: 2,
              }}
            >
              {ticket.createdBy}
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Request Host
            </Text>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#2563eb",
                marginTop: 2,
              }}
            >
              {ticket.reqTo}
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Created Date
            </Text>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#475569",
                marginTop: 2,
              }}
            >
              {new Date(ticket.createdOn).toLocaleString()}
            </div>
          </Col>
        </Row>
      </div>

      <Table
        dataSource={ticket.items}
        rowKey="id"
        size="middle"
        pagination={false}
        columns={[
          {
            title: "Folder Path",
            dataIndex: "folderPath",
            key: "folderPath",
            render: (text: string) => (
              <span className="folder-code-badge">{text}</span>
            ),
          },
          {
            title: "Requested Access",
            dataIndex: "accessType",
            key: "accessType",
            width: 140,
            render: (text: string) => <Tag color="blue">{text}</Tag>,
          },
          {
            title: "Confirmed Access",
            dataIndex: "confirmAccessType",
            key: "confirmAccessType",
            width: 140,
            render: (cat: string) =>
              cat ? (
                <Tag color="purple">{cat}</Tag>
              ) : (
                <Text type="secondary">-</Text>
              ),
          },
          {
            title: "Reason",
            dataIndex: "reasonForAccess",
            key: "reasonForAccess",
            ellipsis: true,
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 180,
            render: (status: string) => renderStatusTag(status),
          },
          {
            title: "Actions",
            key: "actions",
            width: 190,
            render: (_: any, record: AccessItemDto) => {
              const isGranted = record.status === "ACCESS_GRANTED";
              return (
                <Space>
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    onClick={() => onViewLogs(record)}
                  >
                    Audit Trail
                  </Button>
                  {isGranted && isOperatorOrAdmin && (
                    <Button
                      danger
                      size="small"
                      icon={<StopOutlined />}
                      onClick={() => onRevoke(ticket, record)}
                    >
                      Revoke
                    </Button>
                  )}
                </Space>
              );
            },
          },
        ]}
      />

      {approvalLogs.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Divider>Approval Audit Trail & Comments</Divider>
          <Table
            dataSource={approvalLogs}
            rowKey="id"
            size="middle"
            pagination={false}
            columns={[
              {
                title: "Date / Time",
                dataIndex: "actionDate",
                key: "actionDate",
                width: 170,
                render: (d) => new Date(d).toLocaleString(),
              },
              {
                title: "Role Stage",
                dataIndex: "approverRole",
                key: "approverRole",
                width: 140,
                render: (r) => <Tag color="cyan">{r}</Tag>,
              },
              {
                title: "Approver",
                dataIndex: "approvedBy",
                key: "approvedBy",
                width: 160,
                render: (text) => <strong>{text}</strong>,
              },
              {
                title: "Action",
                dataIndex: "actionTaken",
                key: "actionTaken",
                width: 120,
                render: (act) =>
                  act === "APPROVED" ? (
                    <Tag color="green">Approved</Tag>
                  ) : act === "RESUBMITTED" ? (
                    <Tag color="orange">Resubmitted</Tag>
                  ) : (
                    <Tag color="red">Rejected</Tag>
                  ),
              },
              {
                title: "Comments",
                dataIndex: "comments",
                key: "comments",
                render: (comm: string) =>
                  comm ? (
                    <div className="comment-bubble">{comm}</div>
                  ) : (
                    <Text type="secondary" italic>
                      No comments
                    </Text>
                  ),
              },
            ]}
          />
        </div>
      )}
    </Modal>
  );
}
