import axios from 'axios';
import { userApi } from './api/userApi';
import { workflowApi } from './api/workflowApi';
import { folderMappingApi } from './api/folderMappingApi';
import type { 
  UserDetailsDto, 
  RequestCreationPayload, 
  AccessItemDto, 
  FolderMapping, 
  TicketDto, 
  ApprovalLog,
  ParsedFolderPathDto
} from './types';

const API_BASE = 'http://localhost:5082/api';

// ── LOCAL STORAGE MOCK DATA SEED ──────────────────────────────────────────
const SEED_USERS: UserDetailsDto[] = [
  {
    userId: 1,
    userName: "System Admin",
    empId: "EMP001",
    phoneNo: "7339396194",
    email: "admin@yourdomain.com",
    deptId: 101,
    roles: ["Admin"],
    location: "HO"
  },
  {
    userId: 1146,
    userName: "Sivalingam",
    empId: "1409",
    phoneNo: "7339396194",
    email: "it-dev25@janatics.co.in",
    deptId: 101,
    roles: ["User"],
    location: "HO"
  },
  {
    userId: 19,
    userName: "BOOPATHY",
    empId: "1129",
    phoneNo: "7907712980",
    email: "boopathy.k@janatics.co.in",
    deptId: 101,
    roles: ["Operator"],
    location: "HO"
  },
  {
    userId: 24,
    userName: "P6IOKIK",
    empId: "0607",
    phoneNo: "9894866625",
    email: "appl-staff2@janatics.co.in",
    deptId: 107,
    roles: ["Hod"],
    location: "HO"
  },
  {
    userId: 26,
    userName: "Venkatachalapathy C K",
    empId: "0205",
    phoneNo: "9944946077",
    email: "ckv@janatics.co.in",
    deptId: 101,
    roles: ["Hod"],
    location: "HO"
  }
];

const SEED_MAPPINGS: FolderMapping[] = [
  { id: 1, folderPath: "edp", primaryFolderOwner: "Venkatachalapathy C K", secondaryFolderOwner: "P6IOKIK", isActive: 1 },
  { id: 2, folderPath: "\\\\10.30.50.15\\jipl", primaryFolderOwner: "P6IOKIK", secondaryFolderOwner: null, isActive: 1 },
  { id: 3, folderPath: "workspace/finance", primaryFolderOwner: "Karthik", secondaryFolderOwner: null, isActive: 1 }
];

const SEED_TICKETS: TicketDto[] = [
  {
    id: 1,
    reqTo: "edp",
    ticketNumber: "REQ-00000001",
    createdBy: "Sivalingam",
    createdOn: new Date().toISOString(),
    isActive: 1,
    items: [
      {
        id: 1,
        requestId: 1,
        folderPath: "edp",
        accessType: "Read",
        reasonForAccess: "Testing EDP folder permission",
        createdBy: "Sivalingam",
        status: "ACCESS_GRANTED",
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
        modifiedBy: "BOOPATHY",
        modifiedOn: new Date().toISOString()
      }
    ]
  }
];

const SEED_LOGS: ApprovalLog[] = [
  {
    id: 1,
    itemId: 1,
    approverRole: "DEPT_HOD",
    approvedBy: "HOD_User",
    actionTaken: "APPROVED",
    actionDate: new Date().toISOString()
  },
  {
    id: 2,
    itemId: 1,
    approverRole: "OPERATOR",
    approvedBy: "BOOPATHY",
    actionTaken: "APPROVED",
    actionDate: new Date().toISOString()
  }
];

// Initialize Storage if empty
const initStorage = () => {
  if (!localStorage.getItem('users')) localStorage.setItem('users', jsonStr(SEED_USERS));
  if (!localStorage.getItem('mappings')) localStorage.setItem('mappings', jsonStr(SEED_MAPPINGS));
  if (!localStorage.getItem('tickets')) localStorage.setItem('tickets', jsonStr(SEED_TICKETS));
  if (!localStorage.getItem('logs')) localStorage.setItem('logs', jsonStr(SEED_LOGS));
};

const jsonStr = (obj: any) => JSON.stringify(obj);
const parseJson = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');

initStorage();

// Helper to check if backend API is online
let isOnline = true;
const testConnection = async () => {
  try {
    await axios.get(`${API_BASE}/user`, { timeout: 1000 });
    isOnline = true;
  } catch {
    isOnline = false;
  }
};

// Periodic connectivity test
testConnection();
setInterval(testConnection, 10000);

export const api = {
  getMode: () => (isOnline ? 'Online (Real Database)' : 'Offline (Mock LocalStorage)'),
  isOnline: () => isOnline,

  // ── Authentication ────────────────────────────────────────────────────────
  login: async (username: string, password: string): Promise<UserDetailsDto> => {
    if (isOnline) {
      try {
        return await userApi.login(username, password);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          throw new Error(err.response.data || 'Invalid credentials');
        }
        throw err;
      }
    }
    // Mock login fallback
    const users: UserDetailsDto[] = parseJson('users');
    const matched = users.find(u => 
      u.userName.toLowerCase() === username.toLowerCase() && 
      (password === '123' || password === u.empId || password === u.phoneNo || password === u.email)
    );
    if (!matched) {
      throw new Error('Invalid username or password (mock bypass password is "123" or user\'s empId/phone/email)');
    }
    return matched;
  },

  // ── User Management (Admin) ───────────────────────────────────────────────
  getAllUsers: async (): Promise<UserDetailsDto[]> => {
    if (isOnline) {
      return await userApi.getAllUsers();
    }
    return parseJson('users');
  },

  getUserByIdentifier: async (identifier: string): Promise<UserDetailsDto> => {
    if (isOnline) {
      return await userApi.getUserByIdentifier(identifier);
    }
    const users: UserDetailsDto[] = parseJson('users');
    const found = users.find(u => u.userId.toString() === identifier || u.empId === identifier || u.userName === identifier);
    if (!found) throw new Error('User not found');
    return found;
  },

  getAllHods: async (): Promise<UserDetailsDto[]> => {
    if (isOnline) {
      return await userApi.getAllHods();
    }
    const users: UserDetailsDto[] = parseJson('users');
    return users.filter(u => u.roles.includes('Hod'));
  },

  updateUserRolesAndLocation: async (userId: number, roles: string[], location: string): Promise<boolean> => {
    if (isOnline) {
      return await userApi.updateUserRolesAndLocation(userId, roles, location);
    }
    const users: UserDetailsDto[] = parseJson('users');
    const idx = users.findIndex(u => u.userId === userId);
    if (idx !== -1) {
      users[idx].roles = roles;
      users[idx].location = location;
      localStorage.setItem('users', jsonStr(users));
      return true;
    }
    return false;
  },

  // ── Workflow Request Operations ──────────────────────────────────────────
  createRequest: async (payload: RequestCreationPayload): Promise<string> => {
    if (isOnline) {
      return await workflowApi.createRequest(payload);
    }
    const tickets: TicketDto[] = parseJson('tickets');
    const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const ticketNo = `REQ-${newId.toString().padStart(8, '0')}`;
    
    const items: AccessItemDto[] = payload.items.map((item, index) => ({
      id: Date.now() + index,
      requestId: newId,
      folderPath: item.folderPath,
      accessType: item.accessType,
      reasonForAccess: item.reasonForAccess,
      createdBy: payload.createdBy,
      status: 'PENDING_DEPT_HOD'
    }));

    const newTicket: TicketDto = {
      id: newId,
      reqTo: payload.reqTo,
      ticketNumber: ticketNo,
      createdBy: payload.createdBy,
      createdOn: new Date().toISOString(),
      isActive: 1,
      items
    };

    tickets.push(newTicket);
    localStorage.setItem('tickets', jsonStr(tickets));
    return ticketNo;
  },

  getAllTickets: async (): Promise<TicketDto[]> => {
    if (isOnline) {
      try {
        return await workflowApi.getAllTickets();
      } catch {
        // Fallback to local storage if endpoint fails
      }
    }
    return parseJson('tickets');
  },

  // ── Approvals & Fulfillment ──────────────────────────────────────────────
  handleHodApproval: async (itemId: number, approver: string, isApproved: boolean): Promise<boolean> => {
    if (isOnline) {
      return await workflowApi.handleHodApproval(itemId, approver, isApproved);
    }
    const tickets: TicketDto[] = parseJson('tickets');
    const logs: ApprovalLog[] = parseJson('logs');
    
    let targetItem: AccessItemDto | null = null;
    
    for (const t of tickets) {
      const found = t.items?.find(i => i.id === itemId);
      if (found) {
        targetItem = found;
        break;
      }
    }

    if (targetItem) {
      const nextStatus = isApproved 
        ? (targetItem.folderPath.toLowerCase() === 'edp' ? 'PENDING_OPERATOR' : 'PENDING_FOLDER_OWNER')
        : 'REJECTED_BY_DEPT_HOD';
      
      targetItem.status = nextStatus;
      
      const newLog: ApprovalLog = {
        id: Date.now(),
        itemId,
        approverRole: 'DEPT_HOD',
        approvedBy: approver,
        actionTaken: isApproved ? 'APPROVED' : 'REJECTED',
        actionDate: new Date().toISOString()
      };
      
      logs.push(newLog);
      localStorage.setItem('tickets', jsonStr(tickets));
      localStorage.setItem('logs', jsonStr(logs));
      return true;
    }
    return false;
  },

  handleFolderOwnerApproval: async (itemId: number, approver: string, isApproved: boolean): Promise<boolean> => {
    if (isOnline) {
      return await workflowApi.handleFolderOwnerApproval(itemId, approver, isApproved);
    }
    const tickets: TicketDto[] = parseJson('tickets');
    const logs: ApprovalLog[] = parseJson('logs');
    
    let targetItem: AccessItemDto | null = null;
    for (const t of tickets) {
      const found = t.items?.find(i => i.id === itemId);
      if (found) {
        targetItem = found;
        break;
      }
    }

    if (targetItem) {
      targetItem.status = isApproved ? 'PENDING_OPERATOR' : 'REJECTED_BY_FOLDER_OWNER';
      const newLog: ApprovalLog = {
        id: Date.now(),
        itemId,
        approverRole: 'FOLDER_OWNER',
        approvedBy: approver,
        actionTaken: isApproved ? 'APPROVED' : 'REJECTED',
        actionDate: new Date().toISOString()
      };
      
      logs.push(newLog);
      localStorage.setItem('tickets', jsonStr(tickets));
      localStorage.setItem('logs', jsonStr(logs));
      return true;
    }
    return false;
  },

  handleOperatorAction: async (itemId: number, approver: string, isApproved: boolean): Promise<boolean> => {
    if (isOnline) {
      return await workflowApi.handleOperatorAction(itemId, approver, isApproved);
    }
    const tickets: TicketDto[] = parseJson('tickets');
    const logs: ApprovalLog[] = parseJson('logs');
    
    let targetItem: AccessItemDto | null = null;
    for (const t of tickets) {
      const found = t.items?.find(i => i.id === itemId);
      if (found) {
        targetItem = found;
        break;
      }
    }

    if (targetItem) {
      targetItem.status = isApproved ? 'ACCESS_GRANTED' : 'REJECTED_BY_OPERATOR';
      targetItem.modifiedBy = approver;
      targetItem.modifiedOn = new Date().toISOString();
      if (isApproved) {
        targetItem.grantedAt = new Date().toISOString();
        targetItem.expiresAt = new Date(Date.now() + 90*24*60*60*1000).toISOString();
      }
      
      const newLog: ApprovalLog = {
        id: Date.now(),
        itemId,
        approverRole: 'OPERATOR',
        approvedBy: approver,
        actionTaken: isApproved ? 'APPROVED' : 'REJECTED',
        actionDate: new Date().toISOString()
      };
      
      logs.push(newLog);
      localStorage.setItem('tickets', jsonStr(tickets));
      localStorage.setItem('logs', jsonStr(logs));
      return true;
    }
    return false;
  },

  getApprovalLogs: async (itemId: number): Promise<ApprovalLog[]> => {
    if (isOnline) {
      try {
        return await workflowApi.getApprovalLogs(itemId);
      } catch {
        // Fallback
      }
    }
    const logs: ApprovalLog[] = parseJson('logs');
    return logs.filter(l => l.itemId === itemId);
  },

  // ── Folder Mappings Management (Admin only) ──────────────────────────────
  getFolderMappings: async (): Promise<FolderMapping[]> => {
    return await folderMappingApi.getFolderMappings();
  },

  addFolderMapping: async (mapping: FolderMapping): Promise<boolean> => {
    return await folderMappingApi.addFolderMapping(mapping);
  },

  updateFolderMapping: async (mapping: FolderMapping): Promise<boolean> => {
    return await folderMappingApi.updateFolderMapping(mapping);
  },

  deleteFolderMapping: async (id: number): Promise<boolean> => {
    return await folderMappingApi.deleteFolderMapping(id);
  },

  getParsedFolderPaths: async (): Promise<ParsedFolderPathDto[]> => {
    if (isOnline) {
      try {
        return await workflowApi.getParsedFolderPaths();
      } catch {
        // Fallback
      }
    }
    return [
      { fullPath: "edp", driveName: "EDP Root", parentFolder: "edp", childDepth1: "", childDepth2: "", childDepth3: "", childDepth4: "" },
      { fullPath: "\\\\10.30.50.15\\jipl", driveName: "\\\\10.30.50.15\\jipl", parentFolder: "", childDepth1: "", childDepth2: "", childDepth3: "", childDepth4: "" },
      { fullPath: "\\\\10.30.50.15\\jipl\\21", driveName: "\\\\10.30.50.15\\jipl", parentFolder: "21", childDepth1: "", childDepth2: "", childDepth3: "", childDepth4: "" },
      { fullPath: "\\\\10.30.50.15\\jipl\\Accounts\\Finance\\Audit", driveName: "\\\\10.30.50.15\\jipl", parentFolder: "Accounts", childDepth1: "Finance", childDepth2: "Audit", childDepth3: "", childDepth4: "" },
      { fullPath: "\\\\10.30.50.15\\jipl\\CI Projects backup", driveName: "\\\\10.30.50.15\\jipl", parentFolder: "CI Projects backup", childDepth1: "", childDepth2: "", childDepth3: "", childDepth4: "" }
    ];
  }
};
