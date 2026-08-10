import axiosClient from "./axiosClient";
import type { RequestCreationPayload, TicketDto, ApprovalLog } from "../types";

export const workflowApi = {
  createRequest: async (payload: RequestCreationPayload): Promise<string> => {
    const res = await axiosClient.post<{ ticketNumber: string }>(
      "/Workflow/requests",
      payload,
    );
    return res.data.ticketNumber;
  },

  getAllTickets: async (): Promise<TicketDto[]> => {
    const res = await axiosClient.get<TicketDto[]>("/Workflow/tickets");
    return res.data;
  },

  handleHodApproval: async (
    itemId: number,
    approver: string,
    isApproved: boolean,
    comments?: string,
    confirmAccessType?: string,
  ): Promise<boolean> => {
    const res = await axiosClient.post(
      `/Workflow/items/${itemId}/hod-approval`,
      { approver, isApproved, comments, confirmAccessType },
    );
    return res.status === 200;
  },

  handleFolderOwnerApproval: async (
    itemId: number,
    approver: string,
    isApproved: boolean,
    comments?: string,
    confirmAccessType?: string,
  ): Promise<boolean> => {
    const res = await axiosClient.post(
      `/Workflow/items/${itemId}/folder-owner-approval`,
      { approver, isApproved, comments, confirmAccessType },
    );
    return res.status === 200;
  },

  handleOperatorAction: async (
    itemId: number,
    approver: string,
    isApproved: boolean,
    comments?: string,
  ): Promise<boolean> => {
    const res = await axiosClient.post(
      `/Workflow/items/${itemId}/operator-action`,
      { approver, isApproved, comments },
    );
    return res.status === 200;
  },

  revokeAccess: async (
    itemId: number,
    operatorUser: string,
    comments: string,
  ): Promise<boolean> => {
    const res = await axiosClient.post(`/Workflow/items/${itemId}/revoke`, {
      operatorUser,
      comments,
    });
    return res.status === 200;
  },

  getApprovalLogs: async (itemId: number): Promise<ApprovalLog[]> => {
    const res = await axiosClient.get<ApprovalLog[]>(
      `/Workflow/items/${itemId}/logs`,
    );
    return res.data;
  },

  getParsedFolderPaths: async (): Promise<any[]> => {
    const res = await axiosClient.get<any[]>("/Workflow/folder-paths");
    return res.data;
  },

  resubmitItem: async (
    itemId: number,
    folderPath: string,
    accessType: string,
    reasonForAccess: string,
    username: string,
  ): Promise<boolean> => {
    const res = await axiosClient.post(`/Workflow/items/${itemId}/resubmit`, {
      folderPath,
      accessType,
      reasonForAccess,
      username,
    });
    return res.status === 200;
  },

  insertMailLog: async (payload: any): Promise<boolean> => {
    const res = await axiosClient.post("/Workflow/mail-log", payload);
    return res.status === 200;
  },
};
