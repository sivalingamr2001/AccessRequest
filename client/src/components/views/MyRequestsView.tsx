import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Input, Space, Table, Typography } from "antd";
import { useMemo, useState } from "react";
import type { FolderMapping, TicketDto, UserDetailsDto } from "../../types";
import { renderStatusTag } from "../../utils/statusTag";

const { Title, Text } = Typography;

interface Props {
  currentUser: UserDetailsDto;
  tickets: TicketDto[];
  users: UserDetailsDto[];
  folderMappings: FolderMapping[];
  onCreate: () => void;
  onEdit: (t: TicketDto) => void;
  onResubmit: (t: TicketDto) => void;
  onViewDetails: (t: TicketDto) => void;
}

export default function MyRequestsView({
  currentUser,
  tickets,
  users,
  folderMappings,
  onCreate,
  onEdit,
  onResubmit,
  onViewDetails,
}: Props) {
  const [searchText, setSearchText] = useState("");

  const isOperatorOrAdmin =
    currentUser.roles.includes("Operator") ||
    currentUser.roles.includes("Admin");
  const isHod = currentUser.roles.includes("Hod");

  const dataSource = useMemo(() => {
    let baseList = tickets;
    if (!isOperatorOrAdmin) {
      if (isHod) {
        baseList = tickets.filter((t) => {
          const isOwn =
            t.createdBy.toLowerCase() === currentUser.userName.toLowerCase();
          const creatorUser = users.find(
            (u) => u.userName.toLowerCase() === t.createdBy.toLowerCase(),
          );
          const isDeptMatch =
            creatorUser && creatorUser.deptId === currentUser.deptId;
          const hasOwnedFolder = t.items?.some((i) => {
            const mapping = folderMappings.find(
              (m) => m.folderPath.toLowerCase() === i.folderPath.toLowerCase(),
            );
            return (
              mapping &&
              (mapping.primaryFolderOwner.toLowerCase() ===
                currentUser.userName.toLowerCase() ||
                mapping.secondaryFolderOwner?.toLowerCase() ===
                  currentUser.userName.toLowerCase())
            );
          });
          return isOwn || isDeptMatch || hasOwnedFolder;
        });
      } else {
        baseList = tickets.filter(
          (t) =>
            t.createdBy.toLowerCase() === currentUser.userName.toLowerCase(),
        );
      }
    }

    if (!searchText.trim()) return baseList;
    const query = searchText.toLowerCase();
    return baseList.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(query) ||
        t.reqTo.toLowerCase().includes(query) ||
        t.createdBy.toLowerCase().includes(query) ||
        t.items?.some(
          (i) =>
            i.folderPath.toLowerCase().includes(query) ||
            i.reasonForAccess.toLowerCase().includes(query),
        ),
    );
  }, [
    tickets,
    users,
    folderMappings,
    currentUser,
    isOperatorOrAdmin,
    isHod,
    searchText,
  ]);

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
            {isOperatorOrAdmin
              ? "All Access Requests"
              : isHod
                ? "My & Dept Requests"
                : "My Access Requests"}
          </Title>
          <Text type="secondary">
            {isOperatorOrAdmin
              ? "Browse all corporate permission requests in the system."
              : isHod
                ? "Monitor access requests from your department and owned folder mappings."
                : "Track the real-time lifecycle and approval status of your requested folders."}
          </Text>
        </div>
        <Space size="middle" wrap>
          <Input.Search
            placeholder="Search requests by ticket, requester, path..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Create Request
          </Button>
        </Space>
      </div>

      <Card className="premium-card">
        <Table
          dataSource={dataSource}
          rowKey="id"
          columns={[
            {
              title: "Ticket #",
              dataIndex: "ticketNumber",
              key: "ticketNumber",
              width: 140,
              render: (t: string) => (
                <strong style={{ color: "#2563eb" }}>{t}</strong>
              ),
            },
            {
              title: "Request Host",
              dataIndex: "reqTo",
              key: "reqTo",
              width: 140,
            },
            {
              title: "Created By",
              dataIndex: "createdBy",
              key: "createdBy",
              width: 160,
            },
            {
              title: "Created On",
              dataIndex: "createdOn",
              key: "createdOn",
              width: 170,
              render: (d: string) => new Date(d).toLocaleString(),
            },
            {
              title: "Items Status Summary",
              key: "summary",
              render: (_: any, record: TicketDto) => {
                const uniqueStates = Array.from(
                  new Set(record.items?.map((i) => i.status) || []),
                );
                return (
                  <Space wrap>
                    {uniqueStates.map((s) => renderStatusTag(s))}
                  </Space>
                );
              },
            },
            {
              title: "Action",
              key: "action",
              width: 180,
              render: (_: any, record: TicketDto) => {
                const isOwnTicket =
                  record.createdBy.toLowerCase() ===
                  currentUser.userName.toLowerCase();
                const itemStatuses = record.items?.map((i) => i.status) || [];
                const isPending = itemStatuses.some(
                  (s) =>
                    s === "PENDING_DEPT_HOD" || s === "PENDING_FOLDER_OWNER",
                );
                const isRejectedOrExpired = itemStatuses.some(
                  (s) =>
                    s.startsWith("REJECTED") ||
                    s === "EXPIRED" ||
                    s === "REVOKED" ||
                    s === "REVOKED_BY_OPERATOR",
                );
                return (
                  <Space>
                    <Button
                      type="link"
                      style={{ padding: 0 }}
                      onClick={() => onViewDetails(record)}
                    >
                      Details & Logs
                    </Button>
                    {isOwnTicket && isPending && (
                      <Button
                        type="link"
                        style={{
                          color: "#0284c7",
                          fontWeight: 500,
                          padding: 0,
                        }}
                        onClick={() => onEdit(record)}
                      >
                        Edit
                      </Button>
                    )}
                    {isOwnTicket && isRejectedOrExpired && (
                      <Button
                        type="link"
                        style={{
                          color: "#d97706",
                          fontWeight: 600,
                          padding: 0,
                        }}
                        onClick={() => onResubmit(record)}
                      >
                        Resubmit
                      </Button>
                    )}
                  </Space>
                );
              },
            },
          ]}
          locale={{
            emptyText: <Empty description="No access tickets created yet" />,
          }}
        />
      </Card>
    </div>
  );
}
