import { EyeFilled, HistoryOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, Modal, Row, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { workflowApi } from "../../api/workflowApi";
import type { AuditLogDetailDto } from "../../types";
import { renderStatusTag } from "../../utils/statusTag";
import { DynamicGrid, type DynamicColumnType } from "../DynamicGrid";

const { Text } = Typography;

export default function AdminAuditLogsView() {
  const [logs, setLogs] = useState<AuditLogDetailDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogDetailDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await workflowApi.getAllAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getRoleTagColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "hod":
      case "dept hod":
        return "cyan";
      case "owner":
      case "folder owner":
        return "purple";
      case "operator":
        return "orange";
      case "requester":
        return "blue";
      case "admin":
        return "gold";
      default:
        return "default";
    }
  };

  const getActionTag = (action: string) => {
    const act = action?.toUpperCase();
    if (act === "APPROVED" || act === "GRANTED" || act === "ACCESS_GRANTED") {
      return <Tag color="green">Approved</Tag>;
    }
    if (act === "RESUBMITTED") {
      return <Tag color="orange">Resubmitted</Tag>;
    }
    if (act === "REVOKED" || act === "ACCESS_REVOKED") {
      return <Tag color="volcano">Revoked</Tag>;
    }
    return <Tag color="red">{action || "Rejected"}</Tag>;
  };

  const columns: DynamicColumnType<AuditLogDetailDto>[] = [
    {
      title: "Date / Time",
      dataIndex: "actionDate",
      key: "actionDate",
      width: "14%",
      render: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
    },
    {
      title: "Ticket #",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
      width: "11%",
      render: (t: string) => <strong style={{ color: "#2563eb" }}>{t}</strong>,
    },
    {
      title: "Requester",
      dataIndex: "requester",
      key: "requester",
      width: "11%",
    },
    {
      title: "Folder Path",
      dataIndex: "folderPath",
      key: "folderPath",
      width: "20%",
      render: (text: string) => <span className="folder-code-badge">{text}</span>,
    },
    {
      title: "Role Stage",
      dataIndex: "approverRole",
      key: "approverRole",
      width: "10%",
      render: (r: string) => <Tag color={getRoleTagColor(r)}>{r}</Tag>,
    },
    {
      title: "Action Taken",
      dataIndex: "actionTaken",
      key: "actionTaken",
      width: "10%",
      render: (a: string) => getActionTag(a),
    },
    {
      title: "Action By",
      dataIndex: "actionBy",
      key: "actionBy",
      width: "12%",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Item Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      width: "14%",
      render: (s: string) => renderStatusTag(s),
    },
    {
      title: "Action",
      key: "actions",
      width: "8%",
      render: (_: any, record: AuditLogDetailDto) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedLog(record);
            setIsDetailOpen(true);
          }}
        >
          <EyeFilled />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <DynamicGrid<AuditLogDetailDto>
        dataSource={logs}
        columns={columns}
        rowKey="logId"
        loading={loading}
        title="Comprehensive Audit Trail & Logs"
        subTitle="Full governance record of all creation, approval, rejection, and fulfillment actions across the portal."
        searchPlaceholder="Search audit logs by ticket, user, folder path, role, comments..."
        showRefresh={true}
        onRefresh={fetchLogs}
        customFilter={(log, query) =>
          log.ticketNumber.toLowerCase().includes(query) ||
          log.requester.toLowerCase().includes(query) ||
          log.reqTo.toLowerCase().includes(query) ||
          log.folderPath.toLowerCase().includes(query) ||
          log.approverRole.toLowerCase().includes(query) ||
          log.actionBy.toLowerCase().includes(query) ||
          log.actionTaken.toLowerCase().includes(query) ||
          log.currentStatus.toLowerCase().includes(query) ||
          Boolean(log.comments && log.comments.toLowerCase().includes(query))
        }
        emptyText="No audit logs recorded yet"
      />

      {/* Full Audit Log Inspection Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: "#4f46e5" }} />
            <span>Audit Log Details: {selectedLog?.ticketNumber}</span>
          </Space>
        }
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={850}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedLog && (
          <div style={{ marginTop: 12 }}>
            <div className="info-banner-card" style={{ marginBottom: 20 }}>
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
                    Ticket Number
                  </Text>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2563eb", marginTop: 2 }}>
                    {selectedLog.ticketNumber}
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
                    Requester
                  </Text>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
                    {selectedLog.requester}
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
                    Request Date
                  </Text>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#475569", marginTop: 2 }}>
                    {new Date(selectedLog.requestDate).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </div>

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Action Performed By">
                <strong>{selectedLog.actionBy}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Approver Role">
                <Tag color={getRoleTagColor(selectedLog.approverRole)}>{selectedLog.approverRole}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Action Taken">
                {getActionTag(selectedLog.actionTaken)}
              </Descriptions.Item>
              <Descriptions.Item label="Log Timestamp">
                {new Date(selectedLog.actionDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Host Server">
                <Tag color="geekblue">{selectedLog.reqTo}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Current Status">
                {renderStatusTag(selectedLog.currentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Requested Access">
                <Tag color="blue">{selectedLog.requestedAccessType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Confirmed Access">
                <Tag color="purple">{selectedLog.confirmedAccessType || selectedLog.requestedAccessType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Folder Path" span={2}>
                <span className="folder-code-badge">{selectedLog.folderPath}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Reason For Access" span={2}>
                {selectedLog.reasonForAccess}
              </Descriptions.Item>
              {selectedLog.grantedAt && (
                <Descriptions.Item label="Granted At">
                  {new Date(selectedLog.grantedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedLog.expiresAt && (
                <Descriptions.Item label="Expires At">
                  {new Date(selectedLog.expiresAt).toLocaleDateString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div>
              <Text strong style={{ display: "block", marginBottom: 6, color: "#334155" }}>
                Approval / Action Comments:
              </Text>
              <div className="comment-bubble" style={{ width: "100%", boxSizing: "border-box" }}>
                {selectedLog.comments || (
                  <Text type="secondary" italic>
                    No comments entered for this action.
                  </Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
