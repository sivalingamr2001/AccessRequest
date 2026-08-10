import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  type FormInstance,
} from "antd";
import type { DecisionModalState } from "../../types";

const { Text } = Typography;
const { Option } = Select;

interface Props {
  state: DecisionModalState;
  form: FormInstance;
  onClose: () => void;
  onSubmit: (values: {
    comments?: string;
    confirmAccessType?: string;
  }) => Promise<void>;
}

export default function DecisionModal({
  state,
  form,
  onClose,
  onSubmit,
}: Props) {
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

  const roleLabel =
    state.role === "OWNER"
      ? "Folder Owner"
      : state.role === "OPERATOR"
        ? "Operator"
        : "Dept HOD";

  return (
    <Modal
      title={
        <Space align="center">
          {state.isApproved ? (
            <CheckCircleOutlined
              style={{ color: "#22c55e", fontSize: "1.2rem" }}
            />
          ) : (
            <CloseCircleOutlined
              style={{ color: "#ef4444", fontSize: "1.2rem" }}
            />
          )}
          <span style={{ fontFamily: "Outfit", fontWeight: 600 }}>
            {state.isApproved
              ? state.role === "OPERATOR"
                ? "Grant Access Fulfillment"
                : `Approve Access Request (${roleLabel})`
              : `Reject Access Request (${roleLabel})`}
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
          background: "#f8fafc",
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #e2e8f0",
        }}
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.8rem" }}>
              Ticket Number
            </Text>
            <div>
              <strong style={{ color: "#2563eb" }}>
                {state.ticket.ticketNumber}
              </strong>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.8rem" }}>
              Requester
            </Text>
            <div>
              <strong>{state.ticket.createdBy}</strong>
            </div>
          </Col>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: "0.8rem" }}>
              Folder Path
            </Text>
            <div>
              <code>{state.item.folderPath}</code>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.8rem" }}>
              Requested Access Type
            </Text>
            <div>
              <Tag color="blue">{state.item.accessType}</Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: "0.8rem" }}>
              Reason for Access
            </Text>
            <div>
              <Text>{state.item.reasonForAccess}</Text>
            </div>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {state.isApproved && state.role !== "OPERATOR" && (
          <Form.Item
            name="confirmAccessType"
            label={
              <span style={{ fontWeight: 600 }}>
                Confirm Access Type <span style={{ color: "#ef4444" }}>*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: "Please select/confirm the access type to be granted",
              },
            ]}
            extra="Select or confirm the exact permission level to grant for this folder."
          >
            <Select placeholder="Select permission level" size="large">
              <Option value="NotApplicable">Not Applicable</Option>
              <Option value="ReadOnly">Read Only</Option>
              <Option value="ReadAndWrite">Read and Write</Option>
            </Select>
          </Form.Item>
        )}

        {state.isApproved && state.role === "OPERATOR" && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 6,
            }}
          >
            <Text type="secondary" style={{ fontSize: "0.85rem" }}>
              Approved Access Level to Provision:{" "}
            </Text>
            <Tag
              color="purple"
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                padding: "2px 8px",
              }}
            >
              {state.item.confirmAccessType || state.item.accessType}
            </Tag>
          </div>
        )}

        <Form.Item
          name="comments"
          label={
            <span style={{ fontWeight: 600 }}>
              {state.isApproved
                ? "Comments / Notes (Optional)"
                : "Rejection Reason / Comments *"}
            </span>
          }
          rules={[
            {
              required: !state.isApproved,
              message:
                "Please provide a comment explaining the reason for rejection.",
            },
          ]}
          extra="These comments will be recorded in the audit log and visible in the portal and email."
        >
          <Input.TextArea
            rows={3}
            placeholder={
              state.isApproved
                ? "Add any approval comments or instructions for the operator..."
                : "Provide justification for rejecting this request..."
            }
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
              htmlType="submit"
              danger={!state.isApproved}
              style={
                state.isApproved
                  ? { background: "#22c55e", borderColor: "#22c55e" }
                  : undefined
              }
            >
              {state.isApproved
                ? state.role === "OPERATOR"
                  ? "Confirm Grant Access"
                  : "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
