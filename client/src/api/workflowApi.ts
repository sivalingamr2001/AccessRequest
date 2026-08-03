import axiosClient from './axiosClient';
import type { RequestCreationPayload, TicketDto, ApprovalLog } from '../types';

export const workflowApi = {
  createRequest: async (payload: RequestCreationPayload): Promise<string> => {
    const res = await axiosClient.post<{ ticketNumber: string }>('/Workflow/requests', payload);
    return res.data.ticketNumber;
  },

  getAllTickets: async (): Promise<TicketDto[]> => {
    const res = await axiosClient.get<TicketDto[]>('/Workflow/tickets');
    return res.data;
  },

  handleHodApproval: async (itemId: number, approver: string, isApproved: boolean): Promise<boolean> => {
    const res = await axiosClient.post(`/Workflow/items/${itemId}/hod-approval`, { approver, isApproved });
    return res.status === 200;
  },

  handleFolderOwnerApproval: async (itemId: number, approver: string, isApproved: boolean): Promise<boolean> => {
    const res = await axiosClient.post(`/Workflow/items/${itemId}/folder-owner-approval`, { approver, isApproved });
    return res.status === 200;
  },

  handleOperatorAction: async (itemId: number, approver: string, isApproved: boolean): Promise<boolean> => {
    const res = await axiosClient.post(`/Workflow/items/${itemId}/operator-action`, { approver, isApproved });
    return res.status === 200;
  },

  getApprovalLogs: async (itemId: number): Promise<ApprovalLog[]> => {
    const res = await axiosClient.get<ApprovalLog[]>(`/Workflow/items/${itemId}/logs`);
    return res.data;
  },

  getParsedFolderPaths: async (): Promise<any[]> => {
    const res = await axiosClient.get<any[]>('/Workflow/folder-paths');
    return res.data;
  }
};
