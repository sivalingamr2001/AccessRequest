// Add to your existing types.ts

export type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export type DecisionModalState = {
  isOpen: boolean;
  item: AccessItemDto | null;
  ticket: TicketDto | null;
  role: "HOD" | "OWNER" | "OPERATOR";
  isApproved: boolean;
};

export type RevokeModalState = {
  isOpen: boolean;
  item: AccessItemDto | null;
  ticket: TicketDto | null;
};

export type PendingItemRecord = { ticket: TicketDto; item: AccessItemDto };

export interface UserDetailsDto {
  userId: number;
  userName: string;
  empId: string;
  phoneNo: string;
  email: string;
  deptId: number;
  roles: string[];
  location: string;
}

export interface AccessItemInput {
  folderPath: string;
  accessType: string;
  reasonForAccess: string;
}

export interface RequestCreationPayload {
  reqTo: string;
  createdBy: string;
  items: AccessItemInput[];
}

export interface AccessItemDto {
  id: number;
  requestId: number;
  folderPath: string;
  accessType: string;
  reasonForAccess: string;
  confirmAccessType?: string | null;
  createdBy: string;
  status: string;
  grantedAt?: string | null;
  expiresAt?: string | null;
  modifiedBy?: string | null;
  modifiedOn?: string | null;
}

export interface FolderMapping {
  id?: number;
  folderPath: string;
  primaryFolderOwner: string;
  secondaryFolderOwner?: string | null;
  isActive: number;
}

export interface ApprovalLog {
  id: number;
  itemId: number;
  approverRole: string;
  approvedBy: string;
  actionTaken: string;
  actionDate: string;
  comments?: string | null;
}

export interface TicketDto {
  id: number;
  reqTo: string;
  ticketNumber: string;
  createdBy: string;
  createdOn: string;
  isActive: number;
  items?: AccessItemDto[];
}

export interface ParsedFolderPathDto {
  fullPath: string;
  driveName: string;
  parentFolder: string;
  childDepth1: string;
  childDepth2: string;
  childDepth3: string;
  childDepth4: string;
}

export interface AuditLogDetailDto {
  logId: number;
  itemId: number;
  requestId: number;
  ticketNumber: string;
  reqTo: string;
  requester: string;
  requestDate: string;
  folderPath: string;
  requestedAccessType: string;
  confirmedAccessType: string;
  reasonForAccess: string;
  currentStatus: string;
  grantedAt?: string | null;
  expiresAt?: string | null;
  approverRole: string;
  actionBy: string;
  actionTaken: string;
  actionDate: string;
  comments?: string | null;
}
