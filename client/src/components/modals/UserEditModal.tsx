import { Button, Form, Input, Modal, Select, Space } from "antd";
import { useEffect } from "react";
import type { UserDetailsDto } from "../../types";

const { Option } = Select;

interface Props {
  open: boolean;
  user: UserDetailsDto | null;
  onClose: () => void;
  onSubmit: (values: { roles: string[]; location: string }) => Promise<void>;
}

export default function UserEditModal({
  open,
  user,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({ roles: user.roles, location: user.location });
    }
  }, [open, user, form]);

  return (
    <Modal
      title={`Edit Roles & Location for User: ${user?.userName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Roles (Multiple)"
          name="roles"
          rules={[{ required: true, message: "Select at least one role" }]}
        >
          <Select mode="multiple" placeholder="Select roles">
            <Option value="Admin">Admin</Option>
            <Option value="Hod">Hod</Option>
            <Option value="Operator">Operator</Option>
            <Option value="User">User</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Location Office" name="location">
          <Input placeholder="e.g. HO, Branch, Unit 1" />
        </Form.Item>

        <Form.Item
          style={{ display: "flex", justifyContent: "flex-end", margin: 0 }}
        >
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
