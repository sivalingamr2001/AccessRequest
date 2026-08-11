import { Button, Space, Tag, Typography } from "antd";
import type { UserDetailsDto } from "../../types";
import { DynamicGrid, type DynamicColumnType } from "../DynamicGrid";
import { EditFilled } from "@ant-design/icons";

const { Text } = Typography;

interface Props {
  users: UserDetailsDto[];
  onEditUser: (user: UserDetailsDto) => void;
}

export default function AdminUsersView({ users, onEditUser }: Props) {
  const columns: DynamicColumnType<UserDetailsDto>[] = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: "10%",
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      width: "16%",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Emp ID",
      dataIndex: "empId",
      key: "empId",
      width: "12%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "22%",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: "14%",
      render: (text: string) => text || <Text type="secondary">Not set</Text>,
      exportValue: (text: string) => text || "Not set",
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      width: "16%",
      render: (roles: string[]) => (
        <Space size={[0, 4]} wrap>
          {roles?.map((r) => (
            <Tag color="blue" key={r}>
              {r}
            </Tag>
          ))}
        </Space>
      ),
      exportValue: (roles: string[]) => roles?.join("; ") || "",
    },
    {
      title: "Action",
      key: "action",
      width: "10%",
      exportable: false,
      render: (_: any, record: UserDetailsDto) => (
        <Button type="primary" onClick={() => onEditUser(record)}>
          <EditFilled />
        </Button>
      ),
    },
  ];

  return (
    <DynamicGrid<UserDetailsDto>
      dataSource={users}
      columns={columns}
      rowKey="userId"
      title="Manage User Roles & Location"
      subTitle="Configure corporate permissions, offices, and HOD statuses for portal accounts."
      searchPlaceholder="Search users by name, emp ID, email, role..."
      customFilter={(u, query) =>
        u.userName.toLowerCase().includes(query) ||
        u.empId.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        Boolean(u.location && u.location.toLowerCase().includes(query)) ||
        u.roles.some((r) => r.toLowerCase().includes(query))
      }
      emptyText="No users found"
    />
  );
}
