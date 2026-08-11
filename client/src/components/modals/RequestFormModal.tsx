import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Steps,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { TERMS } from "../../constants/terms";
import type {
  ParsedFolderPathDto,
  TicketDto,
  UserDetailsDto,
} from "../../types";
import FolderItemFieldList from "./FolderItemFieldList";

const { Text } = Typography;
const { Option } = Select;

interface Props {
  open: boolean;
  currentUser: UserDetailsDto;
  allHods: UserDetailsDto[];
  folderPaths: ParsedFolderPathDto[];
  editingTicket: TicketDto | null;
  isResubmitMode: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export default function RequestFormModal({
  open,
  currentUser,
  allHods,
  folderPaths,
  editingTicket,
  isResubmitMode,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);

  const isHodRequester =
    currentUser?.roles?.includes("Hod") ||
    currentUser?.roles?.includes("HOD") ||
    allHods.some(
      (h) => h.userName.toLowerCase() === currentUser.userName.toLowerCase(),
    );

  const deptHods = allHods.filter((h) => h.deptId === currentUser.deptId);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    form.resetFields();
    form.setFieldsValue({
      items: editingTicket?.items?.map((i) => ({
        folderPath: i.folderPath,
        accessType: i.accessType,
        reasonForAccess: i.reasonForAccess,
      })) || [
          { folderPath: undefined, accessType: "ReadOnly", reasonForAccess: "" },
        ],
      agreement: false,
      hodUserId: isHodRequester ? undefined : deptHods[0]?.userId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingTicket]);

  const formValues = Form.useWatch([], form);
  const itemsList = formValues?.items || [];
  const isStep1NextDisabled =
    (!isHodRequester && !formValues?.hodUserId) ||
    itemsList.length === 0 ||
    itemsList.some(
      (item: any) =>
        !item ||
        !item.folderPath ||
        !item.accessType ||
        !item.reasonForAccess?.trim(),
    );
  const isStep2SubmitDisabled = !formValues?.agreement;

  const title = isResubmitMode
    ? "Resubmit Access Request"
    : editingTicket
      ? "Edit Access Request"
      : "Create New Folder Access Request";
  const submitLabel = isResubmitMode
    ? "Resubmit Request"
    : editingTicket
      ? "Update & Resubmit"
      : "Submit Request";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} preserve={true}>
        <Steps
          current={step - 1}
          size="small"
          style={{ marginBottom: 24 }}
          items={[
            { title: "Request Details" },
            { title: "Terms & Agreement" },
          ]}
        />

        <div
          style={{
            background: "#f8fafc",
            padding: "18px 22px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            marginBottom: 24,
          }}
        >
          <Row gutter={24} align="middle" justify="space-between">
            <Col
              xs={24}
              sm={12}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Requester User
              </Text>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: "1.1rem",
                  marginBottom: 2,
                }}
              >
                {currentUser.userName}
              </Text>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Text type="secondary" style={{ fontSize: "0.85rem" }}>
                  ID: {currentUser.empId}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: "0.85rem", color: "#cbd5e1" }}
                >
                  |
                </Text>
                <Text type="secondary" style={{ fontSize: "0.85rem" }}>
                  {currentUser.email}
                </Text>
              </div>
            </Col>
            <Col
              xs={24}
              sm={12}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {isHodRequester ? (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    padding: "10px 14px",
                    borderRadius: 8,
                  }}
                >
                  <Text strong style={{ color: "#1d4ed8", display: "block", fontSize: "0.88rem" }}>
                    Direct to Operator (HOD Mode)
                  </Text>
                  <Text type="secondary" style={{ fontSize: "0.78rem", color: "#3b82f6" }}>
                    Your request bypasses HOD approval and routes directly to the Operator fulfillment cart.
                  </Text>
                </div>
              ) : (
                <Form.Item
                  name="hodUserId"
                  label="Department HOD"
                  rules={[
                    { required: true, message: "Select the approving HOD" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Select placeholder="Select HOD" style={{ width: "100%" }}>
                    {deptHods.map((hod) => (
                      <Option key={hod.userId} value={hod.userId}>
                        {hod.userName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </Col>
          </Row>
        </div>

        <div style={{ display: step === 1 ? "block" : "none" }}>
          <Divider style={{ margin: "12px 0 20px 0" }}>
            Access Folder Items
          </Divider>
          <FolderItemFieldList folderPaths={folderPaths} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              paddingTop: "12px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await form.validateFields(["hodUserId", "items"]);
                  setStep(2);
                } catch {
                  // validation errors shown by the form
                }
              }}
              disabled={isStep1NextDisabled}
            >
              Next: Review Terms
            </Button>
          </div>
        </div>

        <div style={{ display: step === 2 ? "block" : "none" }}>
          <Card
            type="inner"
            style={{
              marginBottom: 20,
              background: "#f8fafc",
              borderRadius: 12,
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              Terms & Conditions
            </Text>
            <Space
              direction="vertical"
              size="small"
              style={{ width: "100%" }}
            >
              {TERMS.map((term, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ width: 20, color: "#2563eb", marginTop: 2 }}>
                    •
                  </div>
                  <Text>{term}</Text>
                </div>
              ))}
            </Space>
          </Card>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                      new Error(
                        "You must agree to the terms to submit request",
                      ),
                    ),
              },
            ]}
            style={{ marginBottom: 24 }}
          >
            <Checkbox>
              I declare that the access requested above is required for my
              official tasks and I agree to comply with the company
              information security guidelines.
            </Checkbox>
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              paddingTop: "12px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isStep2SubmitDisabled}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
