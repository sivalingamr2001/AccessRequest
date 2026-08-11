import { Form, message } from "antd";
import { useState } from "react";
import { workflowApi } from "../api/workflowApi";
import { buildMailBody, sendMailLog } from "../utils/mailBuilder";
import type {
  AccessItemDto,
  DecisionModalState,
  FolderMapping,
  TicketDto,
  UserDetailsDto,
} from "../types";

interface Deps {
  currentUser: UserDetailsDto | null;
  tickets: TicketDto[];
  users: UserDetailsDto[];
  folderMappings: FolderMapping[];
  onSuccess: (notifTitle: string, notifDesc: string) => void;
  reload: () => Promise<void>;
}

export function useDecisionModal({
  currentUser,
  tickets,
  users,
  folderMappings,
  onSuccess,
  reload,
}: Deps) {
  const [decisionForm] = Form.useForm();
  const [state, setState] = useState<DecisionModalState>({
    isOpen: false,
    item: null,
    ticket: null,
    role: "HOD",
    isApproved: true,
  });

  const openDecisionModal = (
    record: { ticket: TicketDto; item: AccessItemDto },
    role: DecisionModalState["role"],
    isApproved: boolean,
  ) => {
    setState({
      isOpen: true,
      item: record.item,
      ticket: record.ticket,
      role,
      isApproved,
    });
    decisionForm.setFieldsValue({
      confirmAccessType:
        record.item.confirmAccessType || record.item.accessType || "Read",
      comments: "",
    });
  };

  const closeDecisionModal = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    decisionForm.resetFields();
  };

  const handleApproveReject = async (
    itemId: number,
    role: DecisionModalState["role"],
    isApproved: boolean,
    comments?: string,
    confirmAccessType?: string,
  ) => {
    if (!currentUser) return;
    try {
      let success = false;
      if (role === "HOD") {
        success = await workflowApi.handleHodApproval(
          itemId,
          currentUser.userName,
          isApproved,
          comments,
          confirmAccessType,
        );
      } else if (role === "OWNER") {
        success = await workflowApi.handleFolderOwnerApproval(
          itemId,
          currentUser.userName,
          isApproved,
          comments,
          confirmAccessType,
        );
      } else if (role === "OPERATOR") {
        success = await workflowApi.handleOperatorAction(
          itemId,
          currentUser.userName,
          isApproved,
          comments,
        );
      }

      if (!success) {
        message.error("Operation failed.");
        return;
      }

      message.success(
        `Request item #${itemId} was ${isApproved ? "Approved" : "Rejected"} successfully.`,
      );

      const ticket = tickets.find((t) => t.items?.some((i) => i.id === itemId));
      const item = ticket?.items?.find((i) => i.id === itemId);

      if (ticket && item) {
        const requester = users.find(
          (u) => u.userName.toLowerCase() === ticket.createdBy.toLowerCase(),
        );
        const operatorUsers = users.filter((u) => u.roles.includes("Operator"));
        const normItemPath = item.folderPath.replace(/\//g, "\\").trim().toLowerCase();
        const mapping = folderMappings.find((m) => {
          const normMapPath = m.folderPath.replace(/\//g, "\\").trim().toLowerCase();
          return (
            normItemPath === normMapPath ||
            normItemPath.startsWith(normMapPath + "\\")
          );
        });

        let mailProgram = "";
        let mailTo = "";
        let subject = "";
        let title = "";

        if (!isApproved) {
          mailProgram = `ACCESS_REQUEST_REJECTED_BY_${role}`;
          mailTo = requester?.email || "";
          subject = `Access request ${ticket.ticketNumber} rejected by ${role}`;
          title = `Access Request Rejected by ${role}`;
        } else if (role === "HOD") {
          const isOwnerSameAsHod =
            mapping &&
            ((mapping.primaryFolderOwner &&
              mapping.primaryFolderOwner.toLowerCase() ===
                currentUser.userName.toLowerCase()) ||
              (mapping.secondaryFolderOwner &&
                mapping.secondaryFolderOwner.toLowerCase() ===
                  currentUser.userName.toLowerCase()));

          const owner = users.find(
            (u) =>
              u.userName.toLowerCase() ===
              mapping?.primaryFolderOwner?.toLowerCase(),
          );
          const isSameDept =
            owner && currentUser.deptId && owner.deptId === currentUser.deptId;

          if (isOwnerSameAsHod || isSameDept || !mapping?.primaryFolderOwner) {
            mailProgram = "ACCESS_REQUEST_PENDING_OPERATOR";
            mailTo = operatorUsers.map((u) => u.email).join(";");
            subject = `Access request ${ticket.ticketNumber} pending operator action`;
            title = "Access Request Pending Operator Fulfillment";
          } else {
            mailProgram = "ACCESS_REQUEST_PENDING_FOLDER_OWNER";
            mailTo = owner?.email || "";
            subject = `Access request ${ticket.ticketNumber} pending folder owner approval`;
            title = "Access Request Pending Folder Owner Approval";
          }
        } else if (role === "OWNER") {
          mailProgram = "ACCESS_REQUEST_PENDING_OPERATOR";
          mailTo = operatorUsers.map((u) => u.email).join(";");
          subject = `Access request ${ticket.ticketNumber} pending operator action`;
          title = "Access Request Pending Operator Fulfillment";
        } else if (role === "OPERATOR") {
          mailProgram = "ACCESS_REQUEST_ACCESS_GRANTED";
          mailTo = requester?.email || "";
          subject = `Access granted for request ${ticket.ticketNumber}`;
          title = "Access Request Completed";
        }

        const updatedItem = {
          ...item,
          confirmAccessType:
            confirmAccessType || item.confirmAccessType || item.accessType,
        };

        await sendMailLog({
          mailProgram,
          mailTo,
          mailSubject: subject,
          mailBody: buildMailBody({
            title,
            ticketNo: ticket.ticketNumber,
            requester: ticket.createdBy,
            approver: currentUser.userName,
            stage: role,
            action: isApproved ? "APPROVED" : "REJECTED",
            items: [updatedItem],
            comments,
          }),
          mailCc: requester?.email || "",
        });
      }

      onSuccess(
        isApproved ? "Request Approved" : "Request Rejected",
        `Request item #${itemId} was ${isApproved ? "approved" : "rejected"}.${comments ? ` Comments: "${comments}"` : ""}`,
      );
      await reload();
    } catch (err: any) {
      message.error(err.message || "Operation failed");
    }
  };

  const handleConfirmDecision = async (values: {
    comments?: string;
    confirmAccessType?: string;
  }) => {
    if (!state.item) return;
    await handleApproveReject(
      state.item.id,
      state.role,
      state.isApproved,
      values.comments,
      values.confirmAccessType,
    );
    closeDecisionModal();
  };

  return {
    decisionForm,
    state,
    openDecisionModal,
    closeDecisionModal,
    handleConfirmDecision,
  };
}
