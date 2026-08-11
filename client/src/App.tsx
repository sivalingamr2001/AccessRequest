import {
  AuditOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  TeamOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Layout, message, notification } from "antd";
import { useState } from "react";
import { folderMappingApi } from "./api/folderMappingApi";
import { userApi } from "./api/userApi";
import { workflowApi } from "./api/workflowApi";
import AppHeader from "./components/layout/AppHeader";
import NotificationsDrawer from "./components/layout/NotificationsDrawer";
import DecisionModal from "./components/modals/DecisionModal";
import FolderMappingModal from "./components/modals/FolderMappingModal";
import RequestFormModal from "./components/modals/RequestFormModal";
import RevokeModal from "./components/modals/RevokeModal";
import TicketDetailModal from "./components/modals/TicketDetailModal";
import UserEditModal from "./components/modals/UserEditModal";
import AdminAuditLogsView from "./components/views/AdminAuditLogsView";
import AdminMappingsView from "./components/views/AdminMappingsView";
import AdminUsersView from "./components/views/AdminUsersView";
import HodQueueView from "./components/views/HodQueueView";
import MyRequestsView from "./components/views/MyRequestsView";
import OperatorQueueView from "./components/views/OperatorQueueView";
import LoginPage from "./components/LoginPage";
import { useAppData } from "./hooks/useAppData";
import { useAuth } from "./hooks/useAuth";
import { useDecisionModal } from "./hooks/useDecisionModal";
import { useNotifications } from "./hooks/useNotifications";
import { usePendingItems } from "./hooks/usePendingItems";
import { useRevokeModal } from "./hooks/useRevokeModal";
import { buildMailBody, sendMailLog } from "./utils/mailBuilder";
import type {
  TicketDto,
  UserDetailsDto,
  FolderMapping,
  ApprovalLog,
  AccessItemDto,
} from "./types";

const { Header, Content } = Layout;

export default function App() {
  const { currentUser, handleLogin, handleLogout } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => {
    const saved = localStorage.getItem("fsfa_active_view");
    if (saved) return saved;
    if (currentUser?.roles.includes("Admin")) return "admin-users";
    if (currentUser?.roles.includes("Operator")) return "operator-queue";
    if (currentUser?.roles.includes("Hod")) return "hod-queue";
    return "my-requests";
  });
  const [activeMenuKey, setActiveMenuKey] = useState<string>(() => {
    const saved = localStorage.getItem("fsfa_active_view");
    if (saved) return saved;
    if (currentUser?.roles.includes("Admin")) return "admin-users";
    if (currentUser?.roles.includes("Operator")) return "operator-queue";
    if (currentUser?.roles.includes("Hod")) return "hod-queue";
    return "my-requests";
  });

  const { tickets, users, folderPaths, folderMappings, allHods, loadData } =
    useAppData(currentUser);
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    pushNotification,
  } = useNotifications();
  const { pendingHodItems, pendingOperatorItems, grantedOperatorItems } =
    usePendingItems(tickets, users, folderMappings, currentUser);

  // Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketDto | null>(null);
  const [isResubmitMode, setIsResubmitMode] = useState(false);

  // User / mapping modal state
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsDto | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FolderMapping | null>(
    null,
  );

  // Ticket detail
  const [selectedTicket, setSelectedTicket] = useState<TicketDto | null>(null);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [selectedItemLogs, setSelectedItemLogs] = useState<ApprovalLog[]>([]);

  const decision = useDecisionModal({
    currentUser,
    tickets,
    users,
    folderMappings,
    onSuccess: pushNotification,
    reload: loadData,
  });

  const revoke = useRevokeModal({
    currentUser,
    users,
    onSuccess: pushNotification,
    reload: loadData,
    onAfterRevoke: async (ticketId: number) => {
      const updated = await workflowApi.getAllTickets();
      const refreshed = updated.find((t) => t.id === ticketId);
      if (refreshed) setSelectedTicket(refreshed);
    },
  });

  const goTo = (view: string) => {
    localStorage.setItem("fsfa_active_view", view);
    setCurrentView(view);
    setActiveMenuKey(view);
  };

  const onLoggedIn = (user: UserDetailsDto) => {
    if (user.roles.includes("Admin")) goTo("admin-users");
    else if (user.roles.includes("Operator")) goTo("operator-queue");
    else if (user.roles.includes("Hod")) goTo("hod-queue");
    else goTo("my-requests");
  };

  const getMenuItems = () => {
    if (!currentUser) return [];
    const items: any[] = [];
    const roles = currentUser.roles || [];

    // Requests menu: shown for Users, HODs, Operators, or Admins if they also have User/Operator or can browse requests
    if (
      roles.includes("User") ||
      roles.includes("Hod") ||
      roles.includes("Operator") ||
      roles.includes("Admin")
    ) {
      items.push({
        key: "my-requests",
        icon: <DashboardOutlined />,
        label: roles.includes("Operator") || roles.includes("Admin") || roles.includes("Hod")
          ? "All Requests"
          : "My Requests",
        onClick: () => goTo("my-requests"),
      });
    }

    if (roles.includes("Hod")) {
      items.push({
        key: "hod-queue",
        icon: <AuditOutlined />,
        label: "HOD Approvals",
        onClick: () => goTo("hod-queue"),
      });
    }

    if (roles.includes("Operator")) {
      items.push({
        key: "operator-queue",
        icon: <ToolOutlined />,
        label: "Fulfillment Console",
        onClick: () => goTo("operator-queue"),
      });
    }

    if (roles.includes("Admin")) {
      items.push(
        {
          key: "admin-users",
          icon: <TeamOutlined />,
          label: "Manage Users",
          onClick: () => goTo("admin-users"),
        },
        {
          key: "admin-mappings",
          icon: <DatabaseOutlined />,
          label: "Folder Mappings",
          onClick: () => goTo("admin-mappings"),
        },
        {
          key: "admin-audit-logs",
          icon: <HistoryOutlined />,
          label: "Audit Logs",
          onClick: () => goTo("admin-audit-logs"),
        },
      );
    }

    return items;
  };

  // ── Request create / edit / resubmit ────────────────────────────
  const openCreateModal = () => {
    setEditingTicket(null);
    setIsResubmitMode(false);
    setIsRequestModalOpen(true);
  };
  const openEditModal = (ticket: TicketDto) => {
    setEditingTicket(ticket);
    setIsResubmitMode(false);
    setIsRequestModalOpen(true);
  };
  const openResubmitModal = (ticket: TicketDto) => {
    setEditingTicket(ticket);
    setIsResubmitMode(true);
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = async (values: any) => {
    if (!currentUser) return;
    try {
      const submittedItems = values?.items || [];
      if (
        editingTicket &&
        editingTicket.items &&
        editingTicket.items.length > 0
      ) {
        for (let i = 0; i < submittedItems.length; i++) {
          const formItem = submittedItems[i];
          const existingItem = editingTicket.items[i] || editingTicket.items[0];
          await workflowApi.resubmitItem(
            existingItem.id,
            formItem.folderPath,
            formItem.accessType,
            formItem.reasonForAccess,
            currentUser.userName,
          );
        }

        const actionText = isResubmitMode
          ? "resubmitted"
          : "updated & resubmitted";
        const selectedHod =
          allHods.find((h) => h.userId === values.hodUserId) ??
          allHods.find((h) => h.deptId === currentUser.deptId);

        await sendMailLog({
          mailProgram: "ACCESS_REQUEST_RESUBMITTED",
          mailTo: selectedHod?.email || "",
          mailSubject: `Access request ${editingTicket.ticketNumber} resubmitted for HOD approval`,
          mailBody: buildMailBody({
            title: "Access Request Resubmitted for HOD Approval",
            ticketNo: editingTicket.ticketNumber,
            requester: currentUser.userName,
            approver: selectedHod?.userName || "System HOD",
            stage: "PENDING_DEPT_HOD",
            action: "RESUBMITTED",
            items: submittedItems,
          }),
        });

        notification.success({
          message: `Request ${actionText.toUpperCase()}`,
          description: `Ticket ${editingTicket.ticketNumber} ${actionText} in-place successfully. Audit log created.`,
          placement: "topRight",
        });
        pushNotification(
          `Ticket ${actionText.toUpperCase()}`,
          `Ticket ${editingTicket.ticketNumber} ${actionText} in-place. Sent to HOD.`,
        );
      } else {
        const isHodRequester =
          currentUser.roles.includes("Hod") ||
          currentUser.roles.includes("HOD") ||
          allHods.some(
            (h) =>
              h.userName.toLowerCase() === currentUser.userName.toLowerCase(),
          );

        const selectedHod = isHodRequester
          ? null
          : allHods.find((h) => h.userId === values.hodUserId) ??
            allHods.find((h) => h.deptId === currentUser.deptId);

        const payload = {
          reqTo: isHodRequester ? "Operator" : selectedHod?.userName || "System HOD",
          createdBy: currentUser.userName,
          items: submittedItems.map((item: any) => ({
            folderPath: item.folderPath,
            accessType: item.accessType,
            reasonForAccess: item.reasonForAccess,
          })),
        };

        const ticketNo = await workflowApi.createRequest(payload);
        const operatorUsers = users.filter((u) => u.roles.includes("Operator"));

        if (isHodRequester) {
          await sendMailLog({
            mailProgram: "ACCESS_REQUEST_PENDING_OPERATOR",
            mailTo: operatorUsers.map((u) => u.email).join(";"),
            mailSubject: `Access request ${ticketNo} pending operator action`,
            mailBody: buildMailBody({
              title: "New Access Request Pending Operator Fulfillment",
              ticketNo,
              requester: currentUser.userName,
              approver: "Operator",
              stage: "PENDING_OPERATOR",
              action: "CREATED",
              items: payload.items,
            }),
          });

          notification.success({
            message: "Request CREATED (Direct to Operator)",
            description: `Ticket ${ticketNo} created and routed directly to Operator cart.`,
            placement: "topRight",
          });
          pushNotification(
            "Ticket CREATED",
            `Ticket ${ticketNo} created directly into Operator cart.`,
          );
        } else {
          await sendMailLog({
            mailProgram: "ACCESS_REQUEST_CREATED",
            mailTo: selectedHod?.email || "",
            mailSubject: `Access request ${ticketNo} pending HOD approval`,
            mailBody: buildMailBody({
              title: "New Access Request Pending HOD Approval",
              ticketNo,
              requester: currentUser.userName,
              approver: selectedHod?.userName || "System HOD",
              stage: "PENDING_DEPT_HOD",
              action: "CREATED",
              items: payload.items,
            }),
          });

          notification.success({
            message: "Request CREATED",
            description: `Ticket ${ticketNo} created successfully. Sent to HOD for review.`,
            placement: "topRight",
          });
          pushNotification(
            "Ticket CREATED",
            `Ticket ${ticketNo} created successfully. Sent to HOD.`,
          );
        }
      }

      setIsRequestModalOpen(false);
      setEditingTicket(null);
      setIsResubmitMode(false);
      await loadData();
    } catch (err: any) {
      message.error(err.message || "Failed to submit request");
    }
  };

  // ── User / mapping edits ────────────────────────────────────────
  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;
    try {
      const success = await userApi.updateUserRolesAndLocation(
        selectedUser.userId,
        values.roles,
        values.location,
      );
      if (success) {
        message.success(`User ${selectedUser.userName} updated successfully.`);
        setIsUserEditModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      message.error(err.message || "Failed to update user");
    }
  };

  const handleSaveMapping = async (values: any) => {
    try {
      if (selectedMapping) {
        await folderMappingApi.updateFolderMapping({
          ...selectedMapping,
          folderPath: values.folderPath,
          primaryFolderOwner: values.primaryFolderOwner,
          secondaryFolderOwner: values.secondaryFolderOwner || null,
          isActive: values.isActive ? 1 : 0,
        });
        message.success("Folder mapping updated successfully.");
      } else {
        await folderMappingApi.addFolderMapping({
          folderPath: values.folderPath,
          primaryFolderOwner: values.primaryFolderOwner,
          secondaryFolderOwner: values.secondaryFolderOwner || null,
          isActive: values.isActive ? 1 : 0,
        });
        message.success("Folder mapping created successfully.");
      }
      setIsMappingModalOpen(false);
      await loadData();
    } catch (err: any) {
      message.error(err.message || "Failed to save mapping");
    }
  };

  const viewApprovalLogs = async (item: AccessItemDto) => {
    try {
      const logs = await workflowApi.getApprovalLogs(item.id);
      setSelectedItemLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={(values) => handleLogin(values, onLoggedIn)} />;
  }

  return (
    <Layout style={{ minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      <Header style={{ padding: 0, height: 56, lineHeight: "56px" }}>
        <AppHeader
          currentUser={currentUser}
          activeMenuKey={activeMenuKey}
          menuItems={getMenuItems()}
          unreadCount={unreadCount}
          onOpenNotifications={openDrawer}
          onLogout={() => handleLogout(() => goTo("my-requests"))}
          onLogoClick={() => {
            if (currentUser.roles.includes("Admin")) goTo("admin-users");
            else if (currentUser.roles.includes("Operator"))
              goTo("operator-queue");
            else goTo("my-requests");
          }}
        />
      </Header>

      <Content
        style={{
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          padding: "24px",
          background: "#f8fafc",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%" }}>
          {currentView === "my-requests" && (
            <MyRequestsView
              currentUser={currentUser}
              tickets={tickets}
              users={users}
              folderMappings={folderMappings}
              onCreate={openCreateModal}
              onEdit={openEditModal}
              onResubmit={openResubmitModal}
              onViewDetails={(t) => {
                setSelectedTicket(t);
                setIsTicketDetailOpen(true);
              }}
            />
          )}

          {currentView === "hod-queue" && (
            <HodQueueView
              items={pendingHodItems}
              onApprove={(record, role) =>
                decision.openDecisionModal(record, role, true)
              }
              onReject={(record, role) =>
                decision.openDecisionModal(record, role, false)
              }
            />
          )}

          {currentView === "operator-queue" && (
            <OperatorQueueView
              pendingItems={pendingOperatorItems}
              grantedItems={grantedOperatorItems}
              onGrant={(record) =>
                decision.openDecisionModal(record, "OPERATOR", true)
              }
              onDeny={(record) =>
                decision.openDecisionModal(record, "OPERATOR", false)
              }
              onRevoke={(record) => revoke.openRevokeModal(record)}
            />
          )}

          {currentView === "admin-users" && (
            <AdminUsersView
              users={users}
              onEditUser={(u) => {
                setSelectedUser(u);
                setIsUserEditModalOpen(true);
              }}
            />
          )}

          {currentView === "admin-mappings" && (
            <AdminMappingsView
              folderMappings={folderMappings}
              onCreate={() => {
                setSelectedMapping(null);
                setIsMappingModalOpen(true);
              }}
              onEdit={(m) => {
                setSelectedMapping(m);
                setIsMappingModalOpen(true);
              }}
              onDeleted={loadData}
            />
          )}

          {currentView === "admin-audit-logs" && <AdminAuditLogsView />}
        </div>
      </Content>

      <RequestFormModal
        open={isRequestModalOpen}
        currentUser={currentUser}
        allHods={allHods}
        folderPaths={folderPaths}
        editingTicket={editingTicket}
        isResubmitMode={isResubmitMode}
        onClose={() => {
          setIsRequestModalOpen(false);
          setEditingTicket(null);
          setIsResubmitMode(false);
        }}
        onSubmit={handleCreateRequest}
      />

      <UserEditModal
        open={isUserEditModalOpen}
        user={selectedUser}
        onClose={() => setIsUserEditModalOpen(false)}
        onSubmit={handleUpdateUser}
      />

      <FolderMappingModal
        open={isMappingModalOpen}
        mapping={selectedMapping}
        allHods={allHods}
        folderPaths={folderPaths}
        onClose={() => setIsMappingModalOpen(false)}
        onSubmit={handleSaveMapping}
      />

      <TicketDetailModal
        open={isTicketDetailOpen}
        ticket={selectedTicket}
        currentUser={currentUser}
        approvalLogs={selectedItemLogs}
        onClose={() => {
          setIsTicketDetailOpen(false);
          setSelectedTicket(null);
          setSelectedItemLogs([]);
        }}
        onEdit={(t) => {
          setIsTicketDetailOpen(false);
          openEditModal(t);
        }}
        onResubmit={(t) => {
          setIsTicketDetailOpen(false);
          openResubmitModal(t);
        }}
        onViewLogs={viewApprovalLogs}
        onRevoke={(ticket, item) => revoke.openRevokeModal({ ticket, item })}
      />

      <DecisionModal
        state={decision.state}
        form={decision.decisionForm}
        onClose={decision.closeDecisionModal}
        onSubmit={decision.handleConfirmDecision}
      />

      <RevokeModal
        state={revoke.state}
        form={revoke.revokeForm}
        onClose={revoke.closeRevokeModal}
        onSubmit={revoke.handleRevokeSubmit}
      />

      <NotificationsDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        notifications={notifications}
      />
    </Layout>
  );
}
