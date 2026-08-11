import { EditFilled, EyeFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { useMemo, useState } from "react";
import type { FolderMapping, TicketDto, UserDetailsDto } from "../../types";
import { renderStatusTag } from "../../utils/statusTag";
import { DynamicGrid, type DynamicColumnType } from "../DynamicGrid";

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
  const isOperatorOrAdmin =
    currentUser.roles.includes("Operator") ||
    currentUser.roles.includes("Admin");
  const isHod = currentUser.roles.includes("Hod");

  const [activeFilter, setActiveFilter] = useState<string>("All Requests");

  // Pre-calculate counts for HOD capsule buttons
  const counts = useMemo(() => {
    if (!isHod) return { all: 0, mine: 0, dept: 0, folder: 0 };
    
    let all = 0;
    let mine = 0;
    let dept = 0;
    let folder = 0;

    tickets.forEach((t) => {
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

      if (isOwn) {
        mine++;
      }
      if (isDeptMatch && !isOwn) {
        dept++;
      }
      if (hasOwnedFolder && !isOwn) {
        folder++;
      }
      if ((isDeptMatch || hasOwnedFolder) && !isOwn) {
        all++;
      }
    });

    return { all, mine, dept, folder };
  }, [tickets, users, folderMappings, currentUser, isHod]);

  const baseDataSource = useMemo(() => {
    if (isHod) {
      return tickets.filter((t) => {
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

        if (activeFilter === "MyRequests") {
          return isOwn;
        } else if (activeFilter === "Dept Req") {
          return isDeptMatch && !isOwn;
        } else if (activeFilter === "Folder By Req") {
          return hasOwnedFolder && !isOwn;
        } else {
          // Default: "All Requests"
          // Show department or folder-owned requests, excluding those created by this HOD
          return (isDeptMatch || hasOwnedFolder) && !isOwn;
        }
      });
    }

    if (isOperatorOrAdmin) {
      return tickets;
    }

    return tickets.filter(
      (t) =>
        t.createdBy.toLowerCase() === currentUser.userName.toLowerCase(),
    );
  }, [tickets, users, folderMappings, currentUser, isOperatorOrAdmin, isHod, activeFilter]);

  const columns: DynamicColumnType<TicketDto>[] = [
    {
      title: "Ticket #",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
      width: "15%",
      render: (t: string) => <strong style={{ color: "#2563eb" }}>{t}</strong>,
    },
    {
      title: "Request Host",
      dataIndex: "reqTo",
      key: "reqTo",
      width: "15%",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: "18%",
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
      width: "18%",
      render: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
      exportValue: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
    },
    {
      title: "Items Status Summary",
      key: "summary",
      width: "22%",
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
      exportValue: (_: any, record: TicketDto) =>
        Array.from(new Set(record.items?.map((i) => i.status) || [])).join("; "),
    },
    {
      title: "Action",
      key: "action",
      width: "12%",
      exportable: false,
      render: (_: any, record: TicketDto) => {
        const isOwnTicket =
          record.createdBy.toLowerCase() ===
          currentUser.userName.toLowerCase();
        const itemStatuses = record.items?.map((i) => i.status) || [];
        const canEdit =
          itemStatuses.length > 0 &&
          itemStatuses.every((s) => s === "PENDING_DEPT_HOD");
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
              type="primary"
              size="small"
              onClick={() => onViewDetails(record)}
            >
              <EyeFilled />
            </Button>
            {isOwnTicket && canEdit && (
              <Button
                type="primary"
                size="small"
                onClick={() => onEdit(record)}
              >
                <EditFilled />
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
  ];

  return (
    <DynamicGrid<TicketDto>
      dataSource={baseDataSource}
      columns={columns}
      rowKey="id"
      title={
        (isOperatorOrAdmin || isHod)
          ? "All Access Requests"
          : "My Access Requests"
      }
      subTitle={
        (isOperatorOrAdmin || isHod)
          ? "Browse all corporate permission requests in the system."
          : "Track the real-time lifecycle and approval status of your requested folders."
      }
      headerActions={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Create Request
        </Button>
      }
      toolbarExtra={
        isHod ? (
          <div
            className="capsule-filter-container"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(241, 245, 249, 0.85)",
              padding: "3px 4px",
              borderRadius: 9999,
              border: "1px solid rgba(226, 232, 240, 0.8)",
              gap: 4,
            }}
          >
            {[
              { key: "All Requests", label: "All Requests", count: counts.all },
              { key: "MyRequests", label: "MyRequests", count: counts.mine },
              { key: "Dept Req", label: "Dept Req", count: counts.dept },
              { key: "Folder By Req", label: "Folder By Req", count: counts.folder },
            ].map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#2563eb" : "#64748b",
                    background: isActive ? "#ffffff" : "transparent",
                    boxShadow: isActive
                      ? "0 2px 8px rgba(37, 99, 235, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)"
                      : "none",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      marginLeft: 4,
                      padding: "2px 6px",
                      borderRadius: 9999,
                      fontSize: "0.75rem",
                      background: isActive ? "rgba(37, 99, 235, 0.1)" : "rgba(100, 116, 139, 0.1)",
                      color: isActive ? "#2563eb" : "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : undefined
      }
      searchPlaceholder="Search requests by ticket, requester, path, reason..."
      emptyText="No access tickets found"
    />
  );
}
