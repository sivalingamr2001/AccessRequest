import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { folderMappingApi } from "../../api/folderMappingApi";
import type { FolderMapping } from "../../types";

const { Title, Text } = Typography;

interface Props {
  folderMappings: FolderMapping[];
  onCreate: () => void;
  onEdit: (mapping: FolderMapping) => void;
  onDeleted: () => void;
}

export default function AdminMappingsView({
  folderMappings,
  onCreate,
  onEdit,
  onDeleted,
}: Props) {
  const [searchText, setSearchText] = useState("");

  const filtered = folderMappings.filter((m) => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      m.folderPath.toLowerCase().includes(query) ||
      m.primaryFolderOwner.toLowerCase().includes(query) ||
      (m.secondaryFolderOwner &&
        m.secondaryFolderOwner.toLowerCase().includes(query))
    );
  });

  const handleDelete = (record: FolderMapping) => {
    Modal.confirm({
      title: "Delete Mapping",
      content: `Are you sure you want to delete folder mapping for: ${record.folderPath}?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        if (record.id) {
          await folderMappingApi.deleteFolderMapping(record.id);
          Modal.destroyAll();
          onDeleted();
        }
      },
    });
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
            Folder Owner Mappings
          </Title>
          <Text type="secondary">
            Map physical shared network folders to primary/secondary HODs for
            approval checks.
          </Text>
        </div>
        <Space size="middle" wrap>
          <Input.Search
            placeholder="Search folder mappings..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Create Mapping
          </Button>
        </Space>
      </div>

      <Card className="premium-card">
        <Table
          dataSource={filtered}
          rowKey="id"
          columns={[
            { title: "ID", dataIndex: "id", key: "id" },
            {
              title: "Folder Path",
              dataIndex: "folderPath",
              key: "folderPath",
              render: (text: string) => <code>{text}</code>,
            },
            {
              title: "Primary Owner",
              dataIndex: "primaryFolderOwner",
              key: "primaryFolderOwner",
            },
            {
              title: "Secondary Owner",
              dataIndex: "secondaryFolderOwner",
              key: "secondaryFolderOwner",
              render: (text: string) => text || "-",
            },
            {
              title: "Status",
              dataIndex: "isActive",
              key: "isActive",
              render: (active: number) =>
                active === 1 ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Inactive</Tag>
                ),
            },
            {
              title: "Action",
              key: "action",
              render: (_: any, record: FolderMapping) => (
                <Space>
                  <Button type="link" onClick={() => onEdit(record)}>
                    Edit
                  </Button>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDelete(record)}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          locale={{
            emptyText: (
              <Empty description="No folder owner mappings configured" />
            ),
          }}
        />
      </Card>
    </div>
  );
}
