import { Form, message } from "antd";
import { useState } from "react";
import { workflowApi } from "../api/workflowApi";
import type {
  AccessItemDto,
  RevokeModalState,
  TicketDto,
  UserDetailsDto,
} from "../types";

interface Deps {
  currentUser: UserDetailsDto | null;
  users: UserDetailsDto[];
  onSuccess: (notifTitle: string, notifDesc: string) => void;
  reload: () => Promise<void>;
  onAfterRevoke?: (ticketId: number) => Promise<void>;
}

export function useRevokeModal({
  currentUser,
  users,
  onSuccess,
  reload,
  onAfterRevoke,
}: Deps) {
  const [revokeForm] = Form.useForm();
  const [state, setState] = useState<RevokeModalState>({
    isOpen: false,
    item: null,
    ticket: null,
  });

  const openRevokeModal = (record: {
    ticket: TicketDto;
    item: AccessItemDto;
  }) => {
    setState({ isOpen: true, ticket: record.ticket, item: record.item });
    revokeForm.resetFields();
  };

  const closeRevokeModal = () => {
    setState({ isOpen: false, ticket: null, item: null });
    revokeForm.resetFields();
  };

  const handleRevokeSubmit = async (values: { comments: string }) => {
    if (!state.item || !state.ticket || !currentUser) return;
    try {
      const itemId = state.item.id;
      const success = await workflowApi.revokeAccess(
        itemId,
        currentUser.userName,
        values.comments,
      );
      if (!success) {
        message.error("Failed to revoke access.");
        return;
      }

      message.success(`Access for item #${itemId} was successfully revoked.`);
      const requester = users.find(
        (u) =>
          u.userName.toLowerCase() === state.ticket!.createdBy.toLowerCase(),
      );

      await workflowApi.insertMailLog({
        templateCode: "ACCESS_REQUEST_ACCESS_REVOKED",
        ticketId: state.ticket.id,
        mailTo: requester?.email || "",
        mailSubject: `[AccessRequest] Access Revoked - ${state.ticket.ticketNumber}`,
        mailBody: `Your access to folder ${state.item.folderPath} has been revoked by operator ${currentUser.userName}. Reason: ${values.comments}`,
        mailCc: "",
      });

      onSuccess(
        "Access Revoked",
        `Access to ${state.item.folderPath} revoked by ${currentUser.userName}. Reason: "${values.comments}"`,
      );

      const ticketId = state.ticket.id;
      closeRevokeModal();
      await reload();
      if (onAfterRevoke) await onAfterRevoke(ticketId);
    } catch (err: any) {
      message.error(err.message || "Revocation failed");
    }
  };

  return {
    revokeForm,
    state,
    openRevokeModal,
    closeRevokeModal,
    handleRevokeSubmit,
  };
}
