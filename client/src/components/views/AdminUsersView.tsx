import { Card, Empty, Input, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";
import type { UserDetailsDto } from "../../types";
import { Button } from "antd";

const { Title, Text } = Typography;

interface Props {
  users: UserDetailsDto[];
  onEditUser: (user: UserDetailsDto) => void;
}

export default function AdminUsersView({ users, onEditUser }: Props) {
  const [searchText, setSearchText] = useState("");

  const filtered = users.filter((u) => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      u.userName.toLowerCase().includes(query) ||
      u.empId.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.location && u.location.toLowerCase().includes(query)) ||
      u.roles.some((r) => r.toLowerCase().includes(query))
    );
  });

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
            Manage User Roles & Location
          </Title>
          <Text type="secondary">
            Configure corporate permissions, offices, and HOD statuses for
            portal accounts.
          </Text>
        </div>
        <Input.Search
          placeholder="Search users by name, emp ID..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
        />
      </div>

      <Card className="premium-card">
        <Table
          dataSource={filtered}
          rowKey="userId"
          columns={[
            { title: "User ID", dataIndex: "userId", key: "userId" },
            {
              title: "Username",
              dataIndex: "userName",
              key: "userName",
              render: (text: string) => <strong>{text}</strong>,
            },
            { title: "Emp ID", dataIndex: "empId", key: "empId" },
            { title: "Email", dataIndex: "email", key: "email" },
            {
              title: "Location",
              dataIndex: "location",
              key: "location",
              render: (text: string) =>
                text || <Text type="secondary">Not set</Text>,
            },
            {
              title: "Roles",
              dataIndex: "roles",
              key: "roles",
              render: (roles: string[]) => (
                <Space size={[0, 4]} wrap>
                  {roles.map((r) => (
                    <Tag color="blue" key={r}>
                      {r}
                    </Tag>
                  ))}
                </Space>
              ),
            },
            {
              title: "Action",
              key: "action",
              render: (_: any, record: UserDetailsDto) => (
                <Button type="link" onClick={() => onEditUser(record)}>
                  Edit Roles/Loc
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: <Empty description="No users found" /> }}
        />
      </Card>
    </div>
  );
}
