import { StopOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  type FormInstance,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import type { RevokeModalState } from "../../types";

const { Text } = Typography;

interface Props {
  state: RevokeModalState;
  form: FormInstance;
  onClose: () => void;
  onSubmit: (values: { comments: string }) => Promise<void>;
}

export default function RevokeModal({ state, form, onClose, onSubmit }: Props) {
  if (!state.item || !state.ticket) {
    return (
      <Modal
        open={state.isOpen}
        onCancel={onClose}
        footer={null}
        destroyOnClose
      />
    );
  }

  return (
    <Modal
      title={
        <Space align="center">
          <StopOutlined style={{ color: "#ef4444", fontSize: "1.25rem" }} />
          <span
            style={{ fontFamily: "Outfit", fontWeight: 700, color: "#b91c1c" }}
          >
            Revoke Granted Access
          </span>
        </Space>
      }
      open={state.isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 18,
        }}
      >
        <Text style={{ color: "#991b1b", fontSize: "0.85rem" }}>
          <strong>Warning:</strong> Revoking access will immediately change the
          status to <strong>ACCESS REVOKED</strong>, remove FSFA permissions,
          and send an email notification to the user with your comments.
        </Text>
      </div>

      <div className="info-banner-card" style={{ marginBottom: 18 }}>
        <Row gutter={[16, 12]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.78rem" }}>
              Ticket Number
            </Text>
            <div>
              <strong style={{ color: "#2563eb" }}>
                {state.ticket.ticketNumber}
              </strong>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.78rem" }}>
              Requester User
            </Text>
            <div>
              <strong>{state.ticket.createdBy}</strong>
            </div>
          </Col>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: "0.78rem" }}>
              Folder Path
            </Text>
            <div>
              <span className="folder-code-badge">{state.item.folderPath}</span>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.78rem" }}>
              Active Permission Level
            </Text>
            <div>
              <Tag color="purple" style={{ fontWeight: 600 }}>
                {state.item.confirmAccessType || state.item.accessType}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.78rem" }}>
              Granted On
            </Text>
            <div>
              <Text>
                {state.item.grantedAt
                  ? new Date(state.item.grantedAt).toLocaleDateString()
                  : "Active"}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="comments"
          label={
            <span style={{ fontWeight: 600, color: "#1e293b" }}>
              Reason for Revoking Access{" "}
              <span style={{ color: "#ef4444" }}>*</span>
            </span>
          }
          rules={[
            {
              required: true,
              message:
                "Please provide a justification for revoking this folder access.",
            },
          ]}
          extra="This reason is mandatory and will be logged in the audit trail and emailed to the requester."
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter reason for revocation (e.g., Project role changed, employee offboarding, compliance review, security incident)..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 0,
            marginTop: 24,
          }}
        >
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              danger
              htmlType="submit"
              icon={<StopOutlined />}
            >
              Confirm & Revoke Access
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
