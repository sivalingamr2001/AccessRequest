import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Tag } from "antd";
import { folderMappingApi } from "../../api/folderMappingApi";
import type { FolderMapping } from "../../types";
import { DynamicGrid, type DynamicColumnType } from "../DynamicGrid";

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

  const columns: DynamicColumnType<FolderMapping>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "8%",
    },
    {
      title: "Folder Path",
      dataIndex: "folderPath",
      key: "folderPath",
      width: "32%",
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: "Primary Owner",
      dataIndex: "primaryFolderOwner",
      key: "primaryFolderOwner",
      width: "20%",
    },
    {
      title: "Secondary Owner",
      dataIndex: "secondaryFolderOwner",
      key: "secondaryFolderOwner",
      width: "20%",
      render: (text: string) => text || "-",
      exportValue: (text: string) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "10%",
      render: (active: number) =>
        active === 1 ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
      exportValue: (active: number) => (active === 1 ? "Active" : "Inactive"),
    },
    {
      title: "Action",
      key: "action",
      width: "10%",
      exportable: false,
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
  ];

  return (
    <DynamicGrid<FolderMapping>
      dataSource={folderMappings}
      columns={columns}
      rowKey="id"
      title="Folder Owner Mappings"
      subTitle="Map physical shared network folders to primary/secondary HODs for approval checks."
      headerActions={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Create Mapping
        </Button>
      }
      searchPlaceholder="Search folder mappings by path or owner..."
      customFilter={(m, query) =>
        m.folderPath.toLowerCase().includes(query) ||
        m.primaryFolderOwner.toLowerCase().includes(query) ||
        Boolean(
          m.secondaryFolderOwner &&
            m.secondaryFolderOwner.toLowerCase().includes(query),
        )
      }
      emptyText="No folder owner mappings configured"
    />
  );
}
