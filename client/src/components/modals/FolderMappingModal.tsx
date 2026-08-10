import { Button, Form, Modal, Select, Space } from "antd";
import { useEffect, useMemo } from "react";
import type {
  FolderMapping,
  ParsedFolderPathDto,
  UserDetailsDto,
} from "../../types";

const { Option } = Select;

interface Props {
  open: boolean;
  mapping: FolderMapping | null;
  allHods: UserDetailsDto[];
  folderPaths: ParsedFolderPathDto[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export default function FolderMappingModal({
  open,
  mapping,
  allHods,
  folderPaths,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mapping) {
        form.setFieldsValue({
          folderPath: mapping.folderPath,
          primaryFolderOwner: mapping.primaryFolderOwner,
          secondaryFolderOwner: mapping.secondaryFolderOwner,
          isActive: mapping.isActive === 1,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mapping, form]);

  const pathOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    folderPaths.forEach((p) => {
      const path = p.parentFolder
        ? p.driveName.endsWith("\\")
          ? `${p.driveName}${p.parentFolder}`
          : `${p.driveName}\\${p.parentFolder}`
        : p.driveName;
      map.set(path, { value: path, label: path });
    });
    return Array.from(map.values());
  }, [folderPaths]);

  return (
    <Modal
      title={mapping ? "Edit Folder Mapping" : "Create Folder Mapping"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Folder Path"
          name="folderPath"
          rules={[{ required: true, message: "Folder path is required" }]}
        >
          <Select
            showSearch
            placeholder="Select folder path"
            disabled={!!mapping}
            optionFilterProp="label"
            options={pathOptions}
          />
        </Form.Item>

        <Form.Item
          label="Primary HOD Owner"
          name="primaryFolderOwner"
          rules={[{ required: true, message: "Primary owner is required" }]}
        >
          <Select
            placeholder="Select primary owner"
            showSearch
            optionFilterProp="children"
          >
            {allHods.map((h) => (
              <Option key={h.userId} value={h.userName}>
                {h.userName} (ID: {h.userId})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Secondary HOD Owner" name="secondaryFolderOwner">
          <Select
            placeholder="Select secondary owner (optional)"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {allHods.map((h) => (
              <Option key={h.userId} value={h.userName}>
                {h.userName} (ID: {h.userId})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active Mapping"
          valuePropName="checked"
          initialValue={true}
        >
          <Select>
            <Option value={true}>Active</Option>
            <Option value={false}>Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item
          style={{ display: "flex", justifyContent: "flex-end", margin: 0 }}
        >
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Mapping
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
