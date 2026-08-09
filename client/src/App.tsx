import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Card, Table, Form, Input, Select, Space, 
  Tag, Modal, Typography, Dropdown, Avatar, Row, Col, Checkbox,
  message, notification, Divider, Empty, Drawer, List, Badge, Segmented
} from 'antd';
import { 
  UserOutlined, LogoutOutlined, KeyOutlined, 
  PlusOutlined, AuditOutlined, DashboardOutlined, ToolOutlined, 
  DatabaseOutlined, TeamOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, BellOutlined, StopOutlined
} from '@ant-design/icons';
import { api } from './api';
import FolderPathSelector from './components/FolderPathSelector';
import LoginPage from './components/LoginPage';
import type { UserDetailsDto, AccessItemDto, FolderMapping, TicketDto, ApprovalLog, ParsedFolderPathDto } from './types';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserDetailsDto | null>(null);
  const [currentView, setCurrentView] = useState<string>('admin-users');
  const [activeMenuKey, setActiveMenuKey] = useState<string>('admin-users');
  const [apiMode, setApiMode] = useState<string>('');
  
  // App States
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Access Configured', description: 'Access to folder edp is active. Expiration scheduled in 90 days.', time: '10 mins ago', read: false },
    { id: 2, title: 'HOD Approval Cleared', description: 'Venkatachalapathy C K approved ticket REQ-00000002.', time: '1 hour ago', read: true },
    { id: 3, title: 'Welcome to AccessRequest', description: 'Your profile has been mapped to Department 101.', time: 'Yesterday', read: true }
  ]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [folderPaths, setFolderPaths] = useState<ParsedFolderPathDto[]>([]);

  // Search Bar States
  const [requestSearchText, setRequestSearchText] = useState('');
  const [hodSearchText, setHodSearchText] = useState('');
  const [operatorSearchText, setOperatorSearchText] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [mappingSearchText, setMappingSearchText] = useState('');
  const [folderMappings, setFolderMappings] = useState<FolderMapping[]>([]);
  const [allHods, setAllHods] = useState<UserDetailsDto[]>([]);
  
  // Form / Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  
  // Selected Objects for Editing
  const [selectedUser, setSelectedUser] = useState<UserDetailsDto | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<FolderMapping | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDto | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketDto | null>(null);
  const [isResubmitMode, setIsResubmitMode] = useState<boolean>(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [selectedItemLogs, setSelectedItemLogs] = useState<ApprovalLog[]>([]);
  
  // Decision Modal States (Comments & Confirm Access Type)
  const [decisionModalState, setDecisionModalState] = useState<{
    isOpen: boolean;
    item: AccessItemDto | null;
    ticket: TicketDto | null;
    role: 'HOD' | 'OWNER' | 'OPERATOR';
    isApproved: boolean;
  }>({
    isOpen: false,
    item: null,
    ticket: null,
    role: 'HOD',
    isApproved: true
  });
  const [decisionForm] = Form.useForm();

  // Revoke Access Modal State
  const [revokeModalState, setRevokeModalState] = useState<{
    isOpen: boolean;
    item: AccessItemDto | null;
    ticket: TicketDto | null;
  }>({
    isOpen: false,
    item: null,
    ticket: null
  });
  const [revokeForm] = Form.useForm();
  const [operatorTab, setOperatorTab] = useState<'pending' | 'granted'>('pending');
  
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const itemsList = formValues?.items || [];
  const isSubmitDisabled = 
    !formValues?.agreement || 
    itemsList.length === 0 || 
    itemsList.some((item: any) => !item || !item.folderPath || !item.accessType || !item.reasonForAccess?.trim());

  const [userEditForm] = Form.useForm();
  const [mappingForm] = Form.useForm();

  // Initialize data
  useEffect(() => {
    setApiMode(api.getMode());
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const allTix = await api.getAllTickets();
      setTickets(allTix);

      const paths = await api.getParsedFolderPaths();
      setFolderPaths(paths);

      if (currentUser?.roles.includes('Admin') || currentUser?.roles.includes('Hod')) {
        const u = await api.getAllUsers();
        setUsers(u);
        const m = await api.getFolderMappings();
        setFolderMappings(m);
      }

      if (currentUser?.roles.includes('Admin') || currentUser?.roles.includes('User') || currentUser?.roles.includes('Hod')) {
        const hods = await api.getAllHods();
        setAllHods(hods);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleLogin = async (values: any) => {
    try {
      const user = await api.login(values.username, values.password);
      setCurrentUser(user);
      // Set default view depending on role
      if (user.roles.includes('Admin')) {
        setCurrentView('admin-users');
        setActiveMenuKey('admin-users');
      } else if (user.roles.includes('Operator')) {
        setCurrentView('operator-queue');
        setActiveMenuKey('operator-queue');
      } else if (user.roles.includes('Hod')) {
        setCurrentView('hod-queue');
        setActiveMenuKey('hod-queue');
      } else {
        setCurrentView('my-requests');
        setActiveMenuKey('my-requests');
      }
      message.success(`Logged in successfully as ${user.userName}`);
    } catch (err: any) {
      message.error(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('my-requests');
    message.info('Logged out successfully');
  };

  // Profile Switching Bypass for easy testing
  const switchProfile = async (userId: number) => {
    try {
      const allUsers = await api.getAllUsers();
      const user = allUsers.find(u => u.userId === userId);
      if (user) {
        setCurrentUser(user);
        message.success(`Switched context to ${user.userName} (${user.roles.join(', ')})`);
        
        // Auto navigate
        if (user.roles.includes('Admin')) {
          setCurrentView('admin-users');
          setActiveMenuKey('admin-users');
        } else if (user.roles.includes('Operator')) {
          setCurrentView('operator-queue');
          setActiveMenuKey('operator-queue');
        } else if (user.roles.includes('Hod')) {
          setCurrentView('hod-queue');
          setActiveMenuKey('hod-queue');
        } else {
          setCurrentView('my-requests');
          setActiveMenuKey('my-requests');
        }
      }
    } catch (err) {
      message.error('Failed to switch context');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTicket(null);
    setIsResubmitMode(false);
    form.resetFields();
    form.setFieldsValue({
      items: [{ folderPath: '', accessType: 'Read', reasonForAccess: '' }],
      agreement: false
    });
    setIsRequestModalOpen(true);
  };

  const handleOpenEditModal = (ticket: TicketDto) => {
    setEditingTicket(ticket);
    setIsResubmitMode(false);
    form.setFieldsValue({
      items: ticket.items?.map(i => ({
        folderPath: i.folderPath,
        accessType: i.accessType,
        reasonForAccess: i.reasonForAccess
      })) || [{ folderPath: '', accessType: 'Read', reasonForAccess: '' }],
      agreement: false
    });
    setIsRequestModalOpen(true);
  };

  const handleOpenResubmitModal = (ticket: TicketDto) => {
    setEditingTicket(ticket);
    setIsResubmitMode(true);
    form.setFieldsValue({
      items: ticket.items?.map(i => ({
        folderPath: i.folderPath,
        accessType: i.accessType,
        reasonForAccess: i.reasonForAccess
      })) || [{ folderPath: '', accessType: 'Read', reasonForAccess: '' }],
      agreement: false
    });
    setIsRequestModalOpen(true);
  };

  const escapeHtml = (value: any) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const buildMailBody = ({
    title,
    ticketNo,
    requester,
    approver,
    stage,
    action,
    items,
    comments
  }: any) => {
    const rows = items.map((item: any, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.folderPath)}</td>
        <td>${escapeHtml(item.accessType)}</td>
        <td>${escapeHtml(item.confirmAccessType || '-')}</td>
        <td>${escapeHtml(item.reasonForAccess)}</td>
        <td>${escapeHtml(item.status || stage)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="color:#2563eb;">${escapeHtml(title)}</h2>

        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-bottom:16px;">
          <tr><td><b>Ticket No</b></td><td>${escapeHtml(ticketNo)}</td></tr>
          <tr><td><b>Requester</b></td><td>${escapeHtml(requester)}</td></tr>
          <tr><td><b>Approver / Actor</b></td><td>${escapeHtml(approver)}</td></tr>
          <tr><td><b>Stage</b></td><td>${escapeHtml(stage)}</td></tr>
          <tr><td><b>Action</b></td><td>${escapeHtml(action)}</td></tr>
          ${comments ? `<tr><td><b>Comments</b></td><td style="color:#2563eb;font-weight:500;">${escapeHtml(comments)}</td></tr>` : ''}
          <tr><td><b>Date</b></td><td>${new Date().toLocaleString()}</td></tr>
        </table>

        <h3>Access Request Details</h3>
        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th>#</th>
              <th>Folder Path</th>
              <th>Requested Access</th>
              <th>Confirmed Access</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  };

  const sendMailLog = async ({
    mailProgram,
    mailFrom = 'feedback@janatics.co.in',
    mailTo,
    mailSubject,
    mailBody,
    mailCc = ''
  }: any) => {
    await api.insertMailLog({
      mailDate: new Date().toISOString(),
      mailProgram,
      mailFrom: mailFrom || 'feedback@janatics.co.in',
      mailTo,
      mailSubject,
      mailSent: false,
      mailBody,
      mailCc
    });
  };

  const handleCreateRequest = async (values: any) => {
    if (!currentUser) return;
    try {
      if (editingTicket && editingTicket.items && editingTicket.items.length > 0) {
        // Resubmit / Edit existing ticket in-place without creating new ticket number
        for (let i = 0; i < values.items.length; i++) {
          const formItem = values.items[i];
          const existingItem = editingTicket.items[i] || editingTicket.items[0];
          await api.resubmitItem(
            existingItem.id,
            formItem.folderPath,
            formItem.accessType,
            formItem.reasonForAccess,
            currentUser.userName
          );
        }

        const actionText = isResubmitMode ? 'resubmitted' : 'updated & resubmitted';

        const hodUser = allHods.find(h => h.deptId === currentUser.deptId);
        await sendMailLog({
          mailProgram: 'ACCESS_REQUEST_RESUBMITTED',
          mailFrom: 'feedback@janatics.co.in',
          mailTo: hodUser?.email || '',
          mailSubject: `Access request ${editingTicket.ticketNumber} resubmitted for HOD approval`,
          mailBody: buildMailBody({
            title: 'Access Request Resubmitted for HOD Approval',
            ticketNo: editingTicket.ticketNumber,
            requester: currentUser.userName,
            approver: hodUser?.userName || 'System HOD',
            stage: 'PENDING_DEPT_HOD',
            action: 'RESUBMITTED',
            items: values.items
          })
        });

        notification.success({
          message: `Request ${actionText.toUpperCase()}`,
          description: `Ticket ${editingTicket.ticketNumber} ${actionText} in-place successfully. Audit log created.`,
          placement: 'topRight'
        });
        setNotifications(prev => [
          {
            id: Date.now(),
            title: `Ticket ${actionText.toUpperCase()}`,
            description: `Ticket ${editingTicket.ticketNumber} ${actionText} in-place. Sent to HOD.`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
      } else {
        // Create new ticket
        const payload = {
          reqTo: allHods.find(h => h.deptId === currentUser.deptId)?.userName || 'System HOD',
          createdBy: currentUser.userName,
          items: values.items.map((item: any) => ({
            folderPath: item.folderPath,
            accessType: item.accessType,
            reasonForAccess: item.reasonForAccess
          }))
        };
        
        const ticketNo = await api.createRequest(payload);
        
        const hodUser = allHods.find(h => h.deptId === currentUser.deptId);

        await sendMailLog({
          mailProgram: 'ACCESS_REQUEST_CREATED',
          mailFrom: 'feedback@janatics.co.in',
          mailTo: hodUser?.email || '',
          mailSubject: `Access request ${ticketNo} pending HOD approval`,
          mailBody: buildMailBody({
            title: 'New Access Request Pending HOD Approval',
            ticketNo,
            requester: currentUser.userName,
            approver: hodUser?.userName || 'System HOD',
            stage: 'PENDING_DEPT_HOD',
            action: 'CREATED',
            items: payload.items
          })
        });

        notification.success({
          message: 'Request CREATED',
          description: `Ticket ${ticketNo} created successfully. Sent to HOD for review.`,
          placement: 'topRight'
        });
        setNotifications(prev => [
          {
            id: Date.now(),
            title: 'Ticket CREATED',
            description: `Ticket ${ticketNo} created successfully. Sent to HOD.`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
      }

      setIsRequestModalOpen(false);
      setEditingTicket(null);
      setIsResubmitMode(false);
      form.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit request');
    }
  };

  const openDecisionModal = (record: { ticket: TicketDto; item: AccessItemDto }, role: 'HOD' | 'OWNER' | 'OPERATOR', isApproved: boolean) => {
    setDecisionModalState({
      isOpen: true,
      item: record.item,
      ticket: record.ticket,
      role,
      isApproved
    });
    decisionForm.setFieldsValue({
      confirmAccessType: record.item.confirmAccessType || record.item.accessType || 'Read',
      comments: ''
    });
  };

  const handleConfirmDecision = async (values: { comments?: string; confirmAccessType?: string }) => {
    if (!decisionModalState.item || !currentUser) return;
    const { item, role, isApproved } = decisionModalState;

    await handleApproveReject(
      item.id,
      role,
      isApproved,
      values.comments,
      values.confirmAccessType
    );

    setDecisionModalState({ isOpen: false, item: null, ticket: null, role: 'HOD', isApproved: true });
    decisionForm.resetFields();
  };

  const openRevokeModal = (record: { ticket: TicketDto; item: AccessItemDto }) => {
    setRevokeModalState({
      isOpen: true,
      ticket: record.ticket,
      item: record.item
    });
    revokeForm.resetFields();
  };

  const handleRevokeSubmit = async (values: { comments: string }) => {
    if (!revokeModalState.item || !revokeModalState.ticket || !currentUser) return;
    try {
      const itemId = revokeModalState.item.id;
      const success = await api.revokeAccess(itemId, currentUser.userName, values.comments);
      if (success) {
        message.success(`Access for item #${itemId} was successfully revoked.`);
        const requester = users.find(u => u.userName.toLowerCase() === revokeModalState.ticket!.createdBy.toLowerCase());
        await api.insertMailLog({
          templateCode: 'ACCESS_REQUEST_ACCESS_REVOKED',
          ticketId: revokeModalState.ticket.id,
          mailTo: requester?.email || '',
          mailSubject: `[AccessRequest] Access Revoked - ${revokeModalState.ticket.ticketNumber}`,
          mailBody: `Your access to folder ${revokeModalState.item.folderPath} has been revoked by operator ${currentUser.userName}. Reason: ${values.comments}`,
          mailCc: ''
        });

        setNotifications(prev => [
          {
            id: Date.now(),
            title: 'Access Revoked',
            description: `Access to ${revokeModalState.item!.folderPath} revoked by ${currentUser.userName}. Reason: "${values.comments}"`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);

        setRevokeModalState({ isOpen: false, ticket: null, item: null });
        revokeForm.resetFields();
        await loadData();
        if (selectedTicket) {
          const updatedTickets = await api.getAllTickets();
          const refreshed = updatedTickets.find(t => t.id === selectedTicket.id);
          if (refreshed) {
            setSelectedTicket(refreshed);
          }
        }
      } else {
        message.error('Failed to revoke access.');
      }
    } catch (err: any) {
      message.error(err.message || 'Revocation failed');
    }
  };

  const handleApproveReject = async (
    itemId: number, 
    role: 'HOD' | 'OWNER' | 'OPERATOR', 
    isApproved: boolean,
    comments?: string,
    confirmAccessType?: string
  ) => {
    if (!currentUser) return;
    try {
      let success = false;
      if (role === 'HOD') {
        success = await api.handleHodApproval(itemId, currentUser.userName, isApproved, comments, confirmAccessType);
      } else if (role === 'OWNER') {
        success = await api.handleFolderOwnerApproval(itemId, currentUser.userName, isApproved, comments, confirmAccessType);
      } else if (role === 'OPERATOR') {
        success = await api.handleOperatorAction(itemId, currentUser.userName, isApproved, comments);
      }

      if (success) {
        message.success(`Request item #${itemId} was ${isApproved ? 'Approved' : 'Rejected'} successfully.`);
        
        const ticket = tickets.find(t => t.items?.some(i => i.id === itemId));
        const item = ticket?.items?.find(i => i.id === itemId);

        if (ticket && item) {
          const requester = users.find(u => u.userName.toLowerCase() === ticket.createdBy.toLowerCase());
          const operatorUsers = users.filter(u => u.roles.includes('Operator'));
          const mapping = folderMappings.find(m => m.folderPath.toLowerCase() === item.folderPath.toLowerCase());

          let mailProgram = '';
          let mailTo = '';
          let subject = '';
          let title = '';

          if (!isApproved) {
            mailProgram = `ACCESS_REQUEST_REJECTED_BY_${role}`;
            mailTo = requester?.email || '';
            subject = `Access request ${ticket.ticketNumber} rejected by ${role}`;
            title = `Access Request Rejected by ${role}`;
          } else if (role === 'HOD') {
            const owner = users.find(u =>
              u.userName.toLowerCase() === mapping?.primaryFolderOwner?.toLowerCase()
            );

            mailProgram = 'ACCESS_REQUEST_PENDING_FOLDER_OWNER';
            mailTo = owner?.email || '';
            subject = `Access request ${ticket.ticketNumber} pending folder owner approval`;
            title = 'Access Request Pending Folder Owner Approval';
          } else if (role === 'OWNER') {
            mailProgram = 'ACCESS_REQUEST_PENDING_OPERATOR';
            mailTo = operatorUsers.map(u => u.email).join(';');
            subject = `Access request ${ticket.ticketNumber} pending operator action`;
            title = 'Access Request Pending Operator Fulfillment';
          } else if (role === 'OPERATOR') {
            mailProgram = 'ACCESS_REQUEST_ACCESS_GRANTED';
            mailTo = requester?.email || '';
            subject = `Access granted for request ${ticket.ticketNumber}`;
            title = 'Access Request Completed';
          }

          const updatedItem = {
            ...item,
            confirmAccessType: confirmAccessType || item.confirmAccessType || item.accessType
          };

          await sendMailLog({
            mailProgram,
            mailFrom: 'feedback@janatics.co.in',
            mailTo,
            mailSubject: subject,
            mailBody: buildMailBody({
              title,
              ticketNo: ticket.ticketNumber,
              requester: ticket.createdBy,
              approver: currentUser.userName,
              stage: role,
              action: isApproved ? 'APPROVED' : 'REJECTED',
              items: [updatedItem],
              comments
            }),
            mailCc: requester?.email || ''
          });
        }

        setNotifications(prev => [
          {
            id: Date.now(),
            title: isApproved ? 'Request Approved' : 'Request Rejected',
            description: `Request item #${itemId} was ${isApproved ? 'approved' : 'rejected'}.${comments ? ` Comments: "${comments}"` : ''}`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
        loadData();
      } else {
        message.error('Operation failed.');
      }
    } catch (err: any) {
      message.error(err.message || 'Operation failed');
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;
    try {
      const success = await api.updateUserRolesAndLocation(selectedUser.userId, values.roles, values.location);
      if (success) {
        message.success(`User ${selectedUser.userName} updated successfully.`);
        setIsUserEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to update user');
    }
  };

  const handleSaveMapping = async (values: any) => {
    try {
      if (selectedMapping) {
        // Edit mode
        const updated = {
          ...selectedMapping,
          folderPath: values.folderPath,
          primaryFolderOwner: values.primaryFolderOwner,
          secondaryFolderOwner: values.secondaryFolderOwner || null,
          isActive: values.isActive ? 1 : 0
        };
        await api.updateFolderMapping(updated);
        message.success('Folder mapping updated successfully.');
      } else {
        // Add mode
        const newMapping = {
          folderPath: values.folderPath,
          primaryFolderOwner: values.primaryFolderOwner,
          secondaryFolderOwner: values.secondaryFolderOwner || null,
          isActive: values.isActive ? 1 : 0
        };
        await api.addFolderMapping(newMapping);
        message.success('Folder mapping created successfully.');
      }
      setIsMappingModalOpen(false);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to save mapping');
    }
  };

  const viewApprovalLogs = async (item: AccessItemDto) => {
    try {
      const logs = await api.getApprovalLogs(item.id);
      setSelectedItemLogs(logs);
      // Trigger modal or popup
    } catch (err) {
      console.error(err);
    }
  };

  // Nav menu items mapping depending on roles
  const getMenuItems = () => {
    if (!currentUser) return [];

    const items = [];

    // General options
    if (currentUser.roles.includes('User') || currentUser.roles.includes('Hod') || currentUser.roles.includes('Operator')) {
      items.push({
        key: 'my-requests',
        icon: <DashboardOutlined />,
        label: currentUser.roles.includes('Operator') ? 'All Requests' : 'My Requests',
        onClick: () => { setCurrentView('my-requests'); setActiveMenuKey('my-requests'); }
      });
    }

    if (currentUser.roles.includes('Hod')) {
      items.push({
        key: 'hod-queue',
        icon: <AuditOutlined />,
        label: 'HOD Approvals',
        onClick: () => { setCurrentView('hod-queue'); setActiveMenuKey('hod-queue'); }
      });
    }

    if (currentUser.roles.includes('Operator')) {
      items.push({
        key: 'operator-queue',
        icon: <ToolOutlined />,
        label: 'Fulfillment Console',
        onClick: () => { setCurrentView('operator-queue'); setActiveMenuKey('operator-queue'); }
      });
    }

    if (currentUser.roles.includes('Admin')) {
      items.push({
        key: 'admin-users',
        icon: <TeamOutlined />,
        label: 'Manage Users',
        onClick: () => { setCurrentView('admin-users'); setActiveMenuKey('admin-users'); }
      }, {
        key: 'admin-mappings',
        icon: <DatabaseOutlined />,
        label: 'Folder Mappings',
        onClick: () => { setCurrentView('admin-mappings'); setActiveMenuKey('admin-mappings'); }
      });
    }

    return items;
  };

  // Rendering Helper for status tags
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING_DEPT_HOD':
        return <Tag color="blue" icon={<ExclamationCircleOutlined />}>PENDING HOD</Tag>;
      case 'PENDING_FOLDER_OWNER':
        return <Tag color="purple" icon={<ExclamationCircleOutlined />}>PENDING OWNER</Tag>;
      case 'PENDING_OPERATOR':
        return <Tag color="orange" icon={<ExclamationCircleOutlined />}>PENDING OPERATOR</Tag>;
      case 'ACCESS_GRANTED':
        return <Tag color="success" icon={<CheckCircleOutlined />}>ACCESS GRANTED</Tag>;
      case 'ACCESS_EXPIRED':
        return <Tag color="default">EXPIRED</Tag>;
      case 'REJECTED_BY_DEPT_HOD':
        return <Tag color="error" icon={<CloseCircleOutlined />}>REJECTED BY HOD</Tag>;
      case 'REJECTED_BY_FOLDER_OWNER':
        return <Tag color="error" icon={<CloseCircleOutlined />}>REJECTED BY OWNER</Tag>;
      case 'REJECTED_BY_OPERATOR':
        return <Tag color="error" icon={<CloseCircleOutlined />}>REJECTED BY OPERATOR</Tag>;
      case 'ACCESS_REVOKED':
      case 'REVOKED_BY_OPERATOR':
        return <Tag color="volcano" icon={<CloseCircleOutlined />}>ACCESS REVOKED</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onQuickLogin={switchProfile} apiMode={apiMode} />;
  }

  // Define User Table columns
  const userColumns = [
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Username', dataIndex: 'userName', key: 'userName', render: (text: string) => <strong>{text}</strong> },
    { title: 'Emp ID', dataIndex: 'empId', key: 'empId' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Location', dataIndex: 'location', key: 'location', render: (text: string) => text || <Text type="secondary">Not set</Text> },
    { 
      title: 'Roles', 
      dataIndex: 'roles', 
      key: 'roles', 
      render: (roles: string[]) => (
        <Space size={[0, 4]} wrap>
          {roles.map(r => <Tag color="blue" key={r}>{r}</Tag>)}
        </Space>
      ) 
    },
    { 
      title: 'Action', 
      key: 'action', 
      render: (_: any, record: UserDetailsDto) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedUser(record);
            userEditForm.setFieldsValue({
              roles: record.roles,
              location: record.location
            });
            setIsUserEditModalOpen(true);
          }}
        >
          Edit Roles/Loc
        </Button>
      ) 
    }
  ];

  // Define Folder Mapping columns
  const mappingColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Folder Path', dataIndex: 'folderPath', key: 'folderPath', render: (text: string) => <code>{text}</code> },
    { title: 'Primary Owner', dataIndex: 'primaryFolderOwner', key: 'primaryFolderOwner' },
    { title: 'Secondary Owner', dataIndex: 'secondaryFolderOwner', key: 'secondaryFolderOwner', render: (text: string) => text || '-' },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive', 
      render: (active: number) => active === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> 
    },
    { 
      title: 'Action', 
      key: 'action', 
      render: (_: any, record: FolderMapping) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedMapping(record);
              mappingForm.setFieldsValue({
                folderPath: record.folderPath,
                primaryFolderOwner: record.primaryFolderOwner,
                secondaryFolderOwner: record.secondaryFolderOwner,
                isActive: record.isActive === 1
              });
              setIsMappingModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => {
              Modal.confirm({
                title: 'Delete Mapping',
                content: `Are you sure you want to delete folder mapping for: ${record.folderPath}?`,
                okText: 'Yes, Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                  if (record.id) {
                    await api.deleteFolderMapping(record.id);
                    message.success('Mapping deleted successfully');
                    loadData();
                  }
                }
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ) 
    }
  ];

  // Extract all pending items for HOD approval
  const getPendingHodItems = () => {
    const list: { ticket: TicketDto; item: AccessItemDto }[] = [];
    if (!currentUser) return list;
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'PENDING_DEPT_HOD') {
          // Check if this HOD is the department HOD of the creator
          const creatorUser = users.find(u => u.userName.toLowerCase() === t.createdBy.toLowerCase());
          const isDeptMatch = creatorUser && creatorUser.deptId === currentUser.deptId;
          const isReqToMatch = t.reqTo.toLowerCase() === currentUser.userName.toLowerCase();
          
          if (isDeptMatch || isReqToMatch) {
            list.push({ ticket: t, item: i });
          }
        } else if (i.status === 'PENDING_FOLDER_OWNER') {
          const mapping = folderMappings.find(m => m.folderPath.toLowerCase() === i.folderPath.toLowerCase());
          const isOwner = mapping && (
            mapping.primaryFolderOwner.toLowerCase() === currentUser.userName.toLowerCase() ||
            mapping.secondaryFolderOwner?.toLowerCase() === currentUser.userName.toLowerCase()
          );
          
          if (isOwner) {
            list.push({ ticket: t, item: i });
          }
        }
      });
    });
    return list;
  };

  // Extract all pending items for Operator console
  const getPendingOperatorItems = () => {
    const list: { ticket: TicketDto; item: AccessItemDto }[] = [];
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'PENDING_OPERATOR') {
          list.push({ ticket: t, item: i });
        }
      });
    });
    return list;
  };

  // Extract all active granted items for Operator revocation/management
  const getGrantedOperatorItems = () => {
    const list: { ticket: TicketDto; item: AccessItemDto }[] = [];
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'ACCESS_GRANTED') {
          list.push({ ticket: t, item: i });
        }
      });
    });
    return list;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="top-navbar" style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div className="logo" onClick={() => {
            if (currentUser.roles.includes('Admin')) {
              setCurrentView('admin-users');
              setActiveMenuKey('admin-users');
            } else if (currentUser.roles.includes('Operator')) {
              setCurrentView('operator-queue');
              setActiveMenuKey('operator-queue');
            } else {
              setCurrentView('my-requests');
              setActiveMenuKey('my-requests');
            }
          }}>
            <KeyOutlined /> AccessRequest
          </div>
          
          <Menu 
            mode="horizontal" 
            selectedKeys={[activeMenuKey]}
            items={getMenuItems()}
            style={{ border: 'none', background: 'transparent', width: 450, fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* User Switching Demo Control */}
          <div className="role-switcher-container">
            <span>Actor Switch:</span>
            <Select 
              value={currentUser.userId} 
              onChange={switchProfile}
              style={{ width: 180 }}
              size="small"
              bordered={false}
              dropdownStyle={{ minWidth: 200 }}
            >
              <Option value={1}>System Admin (Admin)</Option>
              <Option value={1146}>Sivalingam (User/101)</Option>
              <Option value={19}>BOOPATHY (Operator)</Option>
              <Option value={24}>P6IOKIK (HOD/107)</Option>
              <Option value={26}>Venkatachalapathy (HOD/101)</Option>
            </Select>
          </div>

          <Tag color="cyan" style={{ border: '1px solid rgba(0, 180, 216, 0.2)' }}>{api.isOnline() ? 'Connected DB' : 'LocalStorage Mode'}</Tag>
          
          <Badge count={notifications.filter(n => !n.read).length} size="small">
            <Button 
              type="text" 
              icon={<BellOutlined style={{ fontSize: '1.25rem', color: '#475569' }} />} 
              onClick={() => {
                setIsNotificationDrawerOpen(true);
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Badge>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: `${currentUser.userName} (${currentUser.roles.join(', ')})`
                },
                {
                  type: 'divider'
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  danger: true,
                  onClick: handleLogout
                }
              ]
            }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#4f46e5' }} icon={<UserOutlined />} />
              <Text strong style={{ fontSize: '0.85rem' }}>{currentUser.userName}</Text>
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: '24px 50px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* 1. MY REQUESTS VIEW (Users / HODs) */}
          {currentView === 'my-requests' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>
                    {currentUser.roles.includes('Operator') || currentUser.roles.includes('Admin') ? 'All Access Requests' : currentUser.roles.includes('Hod') ? 'My & Dept Requests' : 'My Access Requests'}
                  </Title>
                  <Text type="secondary">
                    {currentUser.roles.includes('Operator') || currentUser.roles.includes('Admin') ? 'Browse all corporate permission requests in the system.' : currentUser.roles.includes('Hod') ? 'Monitor access requests from your department and owned folder mappings.' : 'Track the real-time lifecycle and approval status of your requested folders.'}
                  </Text>
                </div>
                <Space size="middle" wrap>
                  <Input.Search 
                    placeholder="Search requests by ticket, requester, path..." 
                    allowClear 
                    onChange={(e) => setRequestSearchText(e.target.value)} 
                    style={{ width: 300 }} 
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleOpenCreateModal}
                  >
                    Create Request
                  </Button>
                </Space>
              </div>

              <Card className="premium-card">
                <Table 
                  dataSource={(() => {
                    let baseList = tickets;
                    if (!currentUser.roles.includes('Admin') && !currentUser.roles.includes('Operator')) {
                      if (currentUser.roles.includes('Hod')) {
                        baseList = tickets.filter(t => {
                          const isOwn = t.createdBy.toLowerCase() === currentUser.userName.toLowerCase();
                          const creatorUser = users.find(u => u.userName.toLowerCase() === t.createdBy.toLowerCase());
                          const isDeptMatch = creatorUser && creatorUser.deptId === currentUser.deptId;
                          const hasOwnedFolder = t.items?.some(i => {
                            const mapping = folderMappings.find(m => m.folderPath.toLowerCase() === i.folderPath.toLowerCase());
                            return mapping && (
                              mapping.primaryFolderOwner.toLowerCase() === currentUser.userName.toLowerCase() ||
                              mapping.secondaryFolderOwner?.toLowerCase() === currentUser.userName.toLowerCase()
                            );
                          });
                          return isOwn || isDeptMatch || hasOwnedFolder;
                        });
                      } else {
                        baseList = tickets.filter(t => t.createdBy.toLowerCase() === currentUser.userName.toLowerCase());
                      }
                    }

                    if (!requestSearchText.trim()) return baseList;
                    const query = requestSearchText.toLowerCase();
                    return baseList.filter(t => 
                      t.ticketNumber.toLowerCase().includes(query) ||
                      t.reqTo.toLowerCase().includes(query) ||
                      t.createdBy.toLowerCase().includes(query) ||
                      t.items?.some(i => i.folderPath.toLowerCase().includes(query) || i.reasonForAccess.toLowerCase().includes(query))
                    );
                  })()}
                  rowKey="id"
                  columns={[
                    { title: 'Ticket #', dataIndex: 'ticketNumber', key: 'ticketNumber', width: 140, render: (text: string) => <strong style={{ color: '#2563eb' }}>{text}</strong> },
                    { title: 'Request Host', dataIndex: 'reqTo', key: 'reqTo', width: 140 },
                    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', width: 160 },
                    { 
                      title: 'Created On', 
                      dataIndex: 'createdOn', 
                      key: 'createdOn',
                      width: 170,
                      render: (date: string) => new Date(date).toLocaleString()
                    },
                    {
                      title: 'Items Status Summary',
                      key: 'summary',
                      render: (_: any, record: TicketDto) => {
                        const states = record.items?.map(i => i.status) || [];
                        const uniqueStates = Array.from(new Set(states));
                        return (
                          <Space wrap>
                            {uniqueStates.map(s => renderStatusTag(s))}
                          </Space>
                        );
                      }
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      width: 180,
                      render: (_: any, record: TicketDto) => {
                        const isOwnTicket = record.createdBy.toLowerCase() === currentUser.userName.toLowerCase();
                        const itemStatuses = record.items?.map(i => i.status) || [];
                        const isPending = itemStatuses.some(s => s === 'PENDING_DEPT_HOD' || s === 'PENDING_FOLDER_OWNER');
                        const isRejectedOrExpired = itemStatuses.some(s => 
                          s.startsWith('REJECTED') || s === 'EXPIRED' || s === 'REVOKED' || s === 'REVOKED_BY_OPERATOR'
                        );

                        return (
                          <Space>
                            <Button 
                              type="link" 
                              style={{ padding: 0 }}
                              onClick={() => {
                                setSelectedTicket(record);
                                setIsTicketDetailOpen(true);
                              }}
                            >
                              Details & Logs
                            </Button>

                            {isOwnTicket && isPending && (
                              <Button 
                                type="link" 
                                style={{ color: '#0284c7', fontWeight: 500, padding: 0 }}
                                onClick={() => handleOpenEditModal(record)}
                              >
                                Edit
                              </Button>
                            )}

                            {isOwnTicket && isRejectedOrExpired && (
                              <Button 
                                type="link" 
                                style={{ color: '#d97706', fontWeight: 600, padding: 0 }}
                                onClick={() => handleOpenResubmitModal(record)}
                              >
                                Resubmit
                              </Button>
                            )}
                          </Space>
                        );
                      }
                    }
                  ]}
                  locale={{ emptyText: <Empty description="No access tickets created yet" /> }}
                />
              </Card>
            </div>
          )}

          {/* 2. HOD APPROVALS VIEW */}
          {currentView === 'hod-queue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>HOD Approval Console</Title>
                  <Text type="secondary">Review and approve access items requested by your department or folder mappings.</Text>
                </div>
                <Input.Search 
                  placeholder="Search pending approvals..." 
                  allowClear 
                  onChange={(e) => setHodSearchText(e.target.value)} 
                  style={{ width: 320 }} 
                />
              </div>

              <Card className="premium-card">
                <Table 
                  dataSource={getPendingHodItems().filter(record => {
                    if (!hodSearchText.trim()) return true;
                    const query = hodSearchText.toLowerCase();
                    return (
                      record.ticket.ticketNumber.toLowerCase().includes(query) ||
                      record.ticket.createdBy.toLowerCase().includes(query) ||
                      record.item.folderPath.toLowerCase().includes(query) ||
                      record.item.reasonForAccess.toLowerCase().includes(query) ||
                      record.item.accessType.toLowerCase().includes(query)
                    );
                  })} 
                  rowKey={(record) => record.item.id.toString()}
                  columns={[
                    { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber', width: 140, render: (t) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
                    { title: 'Requester', dataIndex: ['ticket', 'createdBy'], key: 'createdBy', width: 150 },
                    { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
                    { title: 'Requested Access', dataIndex: ['item', 'accessType'], key: 'accessType', width: 130, render: (text: string) => <Tag color="blue">{text}</Tag> },
                    { 
                      title: 'Confirmed Access', 
                      dataIndex: ['item', 'confirmAccessType'], 
                      key: 'confirmAccessType', 
                      width: 130,
                      render: (text: string) => text ? <Tag color="purple">{text}</Tag> : <Text type="secondary">-</Text> 
                    },
                    { title: 'Reason', dataIndex: ['item', 'reasonForAccess'], key: 'reasonForAccess' },
                    { 
                      title: 'Approval Stage', 
                      key: 'stage', 
                      width: 130,
                      render: (_, record) => record.item.status === 'PENDING_FOLDER_OWNER' 
                        ? <Tag color="purple">Folder Owner</Tag> 
                        : <Tag color="cyan">Dept HOD</Tag> 
                    },
                    { 
                      title: 'Actions', 
                      key: 'actions', 
                      width: 180,
                      render: (_: any, record) => {
                        const role = record.item.status === 'PENDING_FOLDER_OWNER' ? 'OWNER' : 'HOD';
                        return (
                          <Space>
                            <Button 
                              type="primary" 
                              style={{ background: '#22c55e', color: '#fff', borderColor: '#22c55e' }}
                              onClick={() => openDecisionModal(record, role, true)}
                            >
                              Approve
                            </Button>
                            <Button 
                              danger 
                              onClick={() => openDecisionModal(record, role, false)}
                            >
                              Reject
                            </Button>
                          </Space>
                        );
                      } 
                    }
                  ]}
                  locale={{ emptyText: <Empty description="No pending HOD approval items" /> }}
                />
              </Card>
            </div>
          )}

          {/* 3. OPERATOR FULFILLMENT VIEW */}
          {currentView === 'operator-queue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>Operator Fulfillment Console</Title>
                  <Text type="secondary">Execute folder sharing commands in Active Directory, grant permissions, and revoke access when required.</Text>
                </div>
                <Input.Search 
                  placeholder="Search operator tasks by ticket, user, or path..." 
                  allowClear 
                  onChange={(e) => setOperatorSearchText(e.target.value)} 
                  style={{ width: 320 }} 
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Segmented
                  value={operatorTab}
                  onChange={(val: any) => setOperatorTab(val as 'pending' | 'granted')}
                  options={[
                    {
                      label: (
                        <Space>
                          <ToolOutlined />
                          <span>Pending Tasks</span>
                          <Tag color="orange" style={{ marginLeft: 4 }}>{getPendingOperatorItems().length}</Tag>
                        </Space>
                      ),
                      value: 'pending'
                    },
                    {
                      label: (
                        <Space>
                          <CheckCircleOutlined />
                          <span>Active Granted Access</span>
                          <Tag color="green" style={{ marginLeft: 4 }}>{getGrantedOperatorItems().length}</Tag>
                        </Space>
                      ),
                      value: 'granted'
                    }
                  ]}
                  size="large"
                />
              </div>

              {operatorTab === 'pending' ? (
                <Card className="premium-card">
                  <Table 
                    dataSource={getPendingOperatorItems().filter(record => {
                      if (!operatorSearchText.trim()) return true;
                      const query = operatorSearchText.toLowerCase();
                      return (
                        record.ticket.ticketNumber.toLowerCase().includes(query) ||
                        record.ticket.createdBy.toLowerCase().includes(query) ||
                        record.item.folderPath.toLowerCase().includes(query) ||
                        record.item.reasonForAccess.toLowerCase().includes(query) ||
                        record.item.accessType.toLowerCase().includes(query)
                      );
                    })} 
                    rowKey={(record) => record.item.id.toString()}
                    columns={[
                      { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber', width: 140, render: (t) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
                      { title: 'User', dataIndex: ['ticket', 'createdBy'], key: 'createdBy', width: 150 },
                      { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
                      { title: 'Requested Access', dataIndex: ['item', 'accessType'], key: 'accessType', width: 130, render: (text: string) => <Tag color="blue">{text}</Tag> },
                      { 
                        title: 'Confirmed Access', 
                        dataIndex: ['item', 'confirmAccessType'], 
                        key: 'confirmAccessType', 
                        width: 140,
                        render: (text: string, record) => (
                          <Tag color="purple" style={{ fontWeight: 600 }}>
                            {text || record.item.accessType}
                          </Tag>
                        ) 
                      },
                      { title: 'Reason', dataIndex: ['item', 'reasonForAccess'], key: 'reasonForAccess' },
                      { 
                        title: 'Actions', 
                        key: 'actions', 
                        width: 230,
                        render: (_: any, record) => (
                          <Space>
                            <Button 
                              type="primary" 
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                              onClick={() => openDecisionModal(record, 'OPERATOR', true)}
                            >
                              Grant Access
                            </Button>
                            <Button 
                              danger 
                              onClick={() => openDecisionModal(record, 'OPERATOR', false)}
                            >
                              Deny Request
                            </Button>
                          </Space>
                        ) 
                      }
                    ]}
                    locale={{ emptyText: <Empty description="No pending Operator actions" /> }}
                  />
                </Card>
              ) : (
                <Card className="premium-card">
                  <Table 
                    dataSource={getGrantedOperatorItems().filter(record => {
                      if (!operatorSearchText.trim()) return true;
                      const query = operatorSearchText.toLowerCase();
                      return (
                        record.ticket.ticketNumber.toLowerCase().includes(query) ||
                        record.ticket.createdBy.toLowerCase().includes(query) ||
                        record.item.folderPath.toLowerCase().includes(query) ||
                        record.item.reasonForAccess.toLowerCase().includes(query) ||
                        record.item.accessType.toLowerCase().includes(query)
                      );
                    })} 
                    rowKey={(record) => record.item.id.toString()}
                    columns={[
                      { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber', width: 140, render: (t) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
                      { title: 'User', dataIndex: ['ticket', 'createdBy'], key: 'createdBy', width: 150 },
                      { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
                      { 
                        title: 'Confirmed Access', 
                        dataIndex: ['item', 'confirmAccessType'], 
                        key: 'confirmAccessType', 
                        width: 140,
                        render: (text: string, record) => (
                          <Tag color="purple" style={{ fontWeight: 600 }}>
                            {text || record.item.accessType}
                          </Tag>
                        ) 
                      },
                      { 
                        title: 'Granted On', 
                        dataIndex: ['item', 'grantedAt'], 
                        key: 'grantedAt', 
                        width: 170,
                        render: (d: string) => d ? new Date(d).toLocaleString() : '-' 
                      },
                      { 
                        title: 'Expires On', 
                        dataIndex: ['item', 'expiresAt'], 
                        key: 'expiresAt', 
                        width: 130,
                        render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' 
                      },
                      { 
                        title: 'Action', 
                        key: 'action', 
                        width: 160,
                        render: (_: any, record) => (
                          <Button 
                            danger 
                            type="primary"
                            ghost
                            icon={<StopOutlined />}
                            onClick={() => openRevokeModal(record)}
                          >
                            Revoke Access
                          </Button>
                        ) 
                      }
                    ]}
                    locale={{ emptyText: <Empty description="No active granted access items found" /> }}
                  />
                </Card>
              )}
            </div>
          )}

          {/* 4. ADMIN USER ROLES VIEW */}
          {currentView === 'admin-users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>Manage User Roles & Location</Title>
                  <Text type="secondary">Configure corporate permissions, offices, and HOD statuses for portal accounts.</Text>
                </div>
                <Input.Search 
                  placeholder="Search users by name, emp ID..." 
                  allowClear 
                  onChange={(e) => setUserSearchText(e.target.value)} 
                  style={{ width: 320 }} 
                />
              </div>

              <Card className="premium-card">
                <Table 
                  dataSource={users.filter(u => {
                    if (!userSearchText.trim()) return true;
                    const query = userSearchText.toLowerCase();
                    return (
                      u.userName.toLowerCase().includes(query) ||
                      u.empId.toLowerCase().includes(query) ||
                      u.email.toLowerCase().includes(query) ||
                      (u.location && u.location.toLowerCase().includes(query)) ||
                      u.roles.some(r => r.toLowerCase().includes(query))
                    );
                  })} 
                  rowKey="userId" 
                  columns={userColumns} 
                  locale={{ emptyText: <Empty description="No users found" /> }}
                />
              </Card>
            </div>
          )}

          {/* 5. ADMIN FOLDER MAPPINGS VIEW */}
          {currentView === 'admin-mappings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>Folder Owner Mappings</Title>
                  <Text type="secondary">Map physical shared network folders to primary/secondary HODs for approval checks.</Text>
                </div>
                <Space size="middle" wrap>
                  <Input.Search 
                    placeholder="Search folder mappings..." 
                    allowClear 
                    onChange={(e) => setMappingSearchText(e.target.value)} 
                    style={{ width: 300 }} 
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                      setSelectedMapping(null);
                      mappingForm.resetFields();
                      setIsMappingModalOpen(true);
                    }}
                  >
                    Create Mapping
                  </Button>
                </Space>
              </div>

              <Card className="premium-card">
                <Table 
                  dataSource={folderMappings.filter(m => {
                    if (!mappingSearchText.trim()) return true;
                    const query = mappingSearchText.toLowerCase();
                    return (
                      m.folderPath.toLowerCase().includes(query) ||
                      m.primaryFolderOwner.toLowerCase().includes(query) ||
                      (m.secondaryFolderOwner && m.secondaryFolderOwner.toLowerCase().includes(query))
                    );
                  })} 
                  rowKey="id" 
                  columns={mappingColumns} 
                  locale={{ emptyText: <Empty description="No folder owner mappings configured" /> }}
                />
              </Card>
            </div>
          )}

        </div>
      </Content>

      <Footer style={{ textAlign: 'center', color: '#94a3b8', background: '#f8fafc', padding: 24 }}>
        AccessRequest Portal ©2026 Crafted for NTFS Permission Workflows
      </Footer>

      {/* ── CREATE / EDIT / RESUBMIT REQUEST MODAL ─────────────────────────── */}
      <Modal
        title={isResubmitMode ? "Resubmit Access Request" : editingTicket ? "Edit Access Request" : "Create New Folder Access Request"}
        open={isRequestModalOpen}
        onCancel={() => {
          setIsRequestModalOpen(false);
          setEditingTicket(null);
          setIsResubmitMode(false);
        }}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest}>
          {(() => {
            const userHod = allHods.find(h => h.deptId === currentUser.deptId);
            return (
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block' }}>Requester User</Text>
                    <Text strong>{currentUser.userName}</Text> <Text type="secondary" style={{ fontSize: '0.85rem' }}>(Dept: {currentUser.deptId})</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block' }}>Approving Department HOD</Text>
                    <Text strong style={{ color: '#4f46e5' }}>{userHod?.userName || 'System HOD'}</Text>
                  </Col>
                </Row>
              </div>
            );
          })()}


          <Divider style={{ margin: '12px 0' }}>Access Folder Items</Divider>

          <Form.List 
            name="items"
            initialValue={[{ folderPath: '', accessType: 'Read', reasonForAccess: '' }]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'folderPath']}
                      label="Folder Network Path"
                      rules={[{ required: true, message: 'Missing folder path' }]}
                    >
                      <FolderPathSelector folderPaths={folderPaths} />
                    </Form.Item>
                    
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'accessType']}
                          label="Access Permissions"
                          rules={[{ required: true, message: 'Missing access type' }]}
                        >
                          <Select>
                            <Option value="Read">Read Only</Option>
                            <Option value="Modify">Modify / Write</Option>
                            <Option value="FullControl">Full Control</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'reasonForAccess']}
                          label="Justification Reason"
                          rules={[{ required: true, message: 'Missing justification' }]}
                        >
                          <Input placeholder="Describe why this folder access is required" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {fields.length > 1 && (
                      <Button type="link" danger onClick={() => remove(name)} style={{ padding: 0 }}>
                        Remove Item
                      </Button>
                    )}
                  </div>
                ))}
                
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Another Folder
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms to submit request')),
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Checkbox>
              I declare that the access requested above is required for my official tasks and I agree to comply with the company information security guidelines.
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
            <Space>
              <Button onClick={() => {
                setIsRequestModalOpen(false);
                setEditingTicket(null);
                setIsResubmitMode(false);
              }}>Cancel</Button>
              <Button type="primary" htmlType="submit" disabled={isSubmitDisabled}>
                {isResubmitMode ? "Resubmit Request" : editingTicket ? "Update & Resubmit" : "Submit Request"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── USER EDIT MODAL ────────────────────────────────────────────────── */}
      <Modal
        title={`Edit Roles & Location for User: ${selectedUser?.userName}`}
        open={isUserEditModalOpen}
        onCancel={() => setIsUserEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={userEditForm} layout="vertical" onFinish={handleUpdateUser}>
          <Form.Item 
            label="Roles (Multiple)" 
            name="roles" 
            rules={[{ required: true, message: 'Select at least one role' }]}
          >
            <Select mode="multiple" placeholder="Select roles">
              <Option value="Admin">Admin</Option>
              <Option value="Hod">Hod</Option>
              <Option value="Operator">Operator</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Location Office" 
            name="location"
          >
            <Input placeholder="e.g. HO, Branch, Unit 1" />
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
            <Space>
              <Button onClick={() => setIsUserEditModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Changes</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── FOLDER MAPPING EDIT MODAL ───────────────────────────────────────── */}
      <Modal
        title={selectedMapping ? "Edit Folder Mapping" : "Create Folder Mapping"}
        open={isMappingModalOpen}
        onCancel={() => setIsMappingModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={mappingForm} layout="vertical" onFinish={handleSaveMapping}>
          <Form.Item 
            label="Folder Path" 
            name="folderPath" 
            rules={[{ required: true, message: 'Folder path is required' }]}
          >
            <Select 
              showSearch 
              placeholder="Select folder path"
              disabled={!!selectedMapping}
              optionFilterProp="label"
              options={Array.from(
                new Map(
                  folderPaths.map(p => {
                    const path = p.parentFolder 
                      ? (p.driveName.endsWith('\\') ? `${p.driveName}${p.parentFolder}` : `${p.driveName}\\${p.parentFolder}`)
                      : p.driveName;
                    return [path, { value: path, label: path }];
                  })
                ).values()
              )}
            />
          </Form.Item>

          <Form.Item 
            label="Primary HOD Owner" 
            name="primaryFolderOwner" 
            rules={[{ required: true, message: 'Primary owner is required' }]}
          >
            <Select placeholder="Select primary owner">
              {allHods.map(h => <Option key={h.userId} value={h.userName}>{h.userName} (ID: {h.userId})</Option>)}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Secondary HOD Owner" 
            name="secondaryFolderOwner"
          >
            <Select placeholder="Select secondary owner (optional)" allowClear>
              {allHods.map(h => <Option key={h.userId} value={h.userName}>{h.userName} (ID: {h.userId})</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active Mapping" valuePropName="checked" initialValue={true}>
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
            <Space>
              <Button onClick={() => setIsMappingModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Mapping</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── TICKET DETAIL MODAL WITH APPROVAL LOGS ──────────────────────────── */}
      <Modal
        title={`Ticket Details: ${selectedTicket?.ticketNumber}`}
        open={isTicketDetailOpen}
        onCancel={() => {
          setIsTicketDetailOpen(false);
          setSelectedTicket(null);
          setSelectedItemLogs([]);
        }}
        footer={[
          selectedTicket && selectedTicket.createdBy.toLowerCase() === currentUser?.userName.toLowerCase() && (
            selectedTicket.items?.some(i => i.status === 'PENDING_DEPT_HOD' || i.status === 'PENDING_FOLDER_OWNER') ? (
              <Button key="edit" type="primary" onClick={() => {
                const t = selectedTicket;
                setIsTicketDetailOpen(false);
                handleOpenEditModal(t);
              }}>
                Edit Request
              </Button>
            ) : selectedTicket.items?.some(i => i.status.startsWith('REJECTED') || i.status === 'EXPIRED' || i.status.startsWith('REVOKED')) ? (
              <Button key="resubmit" style={{ background: '#d97706', color: '#fff', borderColor: '#d97706' }} onClick={() => {
                const t = selectedTicket;
                setIsTicketDetailOpen(false);
                handleOpenResubmitModal(t);
              }}>
                Resubmit Request
              </Button>
            ) : null
          ),
          <Button key="close" onClick={() => {
            setIsTicketDetailOpen(false);
            setSelectedTicket(null);
            setSelectedItemLogs([]);
          }}>
            Close
          </Button>
        ]}
        width={940}
      >
        {selectedTicket && (
          <div>
            <div className="info-banner-card">
              <Row gutter={[20, 10]} align="middle">
                <Col xs={24} sm={8}>
                  <Text type="secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Requester</Text>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{selectedTicket.createdBy}</div>
                </Col>
                <Col xs={24} sm={8}>
                  <Text type="secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Request Host</Text>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb', marginTop: 2 }}>{selectedTicket.reqTo}</div>
                </Col>
                <Col xs={24} sm={8}>
                  <Text type="secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Created Date</Text>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginTop: 2 }}>{new Date(selectedTicket.createdOn).toLocaleString()}</div>
                </Col>
              </Row>
            </div>

            <Table 
              dataSource={selectedTicket.items} 
              rowKey="id"
              size="middle"
              pagination={false}
              columns={[
                { 
                  title: 'Folder Path', 
                  dataIndex: 'folderPath', 
                  key: 'folderPath', 
                  render: (text: string) => <span className="folder-code-badge">{text}</span> 
                },
                { 
                  title: 'Requested Access', 
                  dataIndex: 'accessType', 
                  key: 'accessType', 
                  width: 140,
                  render: (text: string) => <Tag color="blue">{text}</Tag> 
                },
                { 
                  title: 'Confirmed Access', 
                  dataIndex: 'confirmAccessType', 
                  key: 'confirmAccessType', 
                  width: 140,
                  render: (cat: string) => cat ? <Tag color="purple">{cat}</Tag> : <Text type="secondary">-</Text> 
                },
                { 
                  title: 'Reason', 
                  dataIndex: 'reasonForAccess', 
                  key: 'reasonForAccess',
                  ellipsis: true 
                },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status', 
                  width: 180,
                  render: (status: string) => renderStatusTag(status) 
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 190,
                  render: (_: any, record: AccessItemDto) => {
                    const isOperatorOrAdmin = currentUser.roles.some(r => r === 'Operator' || r === 'Admin');
                    const isGranted = record.status === 'ACCESS_GRANTED';
                    return (
                      <Space>
                        <Button type="primary" ghost size="small" onClick={() => viewApprovalLogs(record)}>
                          Audit Trail
                        </Button>
                        {isGranted && isOperatorOrAdmin && (
                          <Button 
                            danger 
                            size="small" 
                            icon={<StopOutlined />}
                            onClick={() => openRevokeModal({ ticket: selectedTicket, item: record })}
                          >
                            Revoke
                          </Button>
                        )}
                      </Space>
                    );
                  }
                }
              ]}
            />

            {selectedItemLogs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Divider>Approval Audit Trail & Comments</Divider>
                <Table
                  dataSource={selectedItemLogs}
                  rowKey="id"
                  size="middle"
                  pagination={false}
                  columns={[
                    { title: 'Date / Time', dataIndex: 'actionDate', key: 'actionDate', width: 170, render: (d) => new Date(d).toLocaleString() },
                    { title: 'Role Stage', dataIndex: 'approverRole', key: 'approverRole', width: 140, render: (r) => <Tag color="cyan">{r}</Tag> },
                    { title: 'Approver', dataIndex: 'approvedBy', key: 'approvedBy', width: 160, render: (text) => <strong>{text}</strong> },
                    { 
                      title: 'Action', 
                      dataIndex: 'actionTaken', 
                      key: 'actionTaken', 
                      width: 120,
                      render: (act) => act === 'APPROVED' ? <Tag color="green">Approved</Tag> : act === 'RESUBMITTED' ? <Tag color="orange">Resubmitted</Tag> : <Tag color="red">Rejected</Tag> 
                    },
                    {
                      title: 'Comments',
                      dataIndex: 'comments',
                      key: 'comments',
                      render: (comm: string) => comm ? (
                        <div className="comment-bubble">{comm}</div>
                      ) : (
                        <Text type="secondary" italic>No comments</Text>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── APPROVAL / REJECTION DECISION MODAL WITH COMMENTS & CONFIRM ACCESS TYPE ── */}
      <Modal
        title={
          <Space align="center">
            {decisionModalState.isApproved ? (
              <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '1.2rem' }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ef4444', fontSize: '1.2rem' }} />
            )}
            <span style={{ fontFamily: 'Outfit', fontWeight: 600 }}>
              {decisionModalState.isApproved 
                ? (decisionModalState.role === 'OPERATOR' ? 'Grant Access Fulfillment' : `Approve Access Request (${decisionModalState.role === 'OWNER' ? 'Folder Owner' : 'Dept HOD'})`)
                : `Reject Access Request (${decisionModalState.role === 'OWNER' ? 'Folder Owner' : decisionModalState.role === 'OPERATOR' ? 'Operator' : 'Dept HOD'})`
              }
            </span>
          </Space>
        }
        open={decisionModalState.isOpen}
        onCancel={() => {
          setDecisionModalState(prev => ({ ...prev, isOpen: false }));
          decisionForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={600}
      >
        {decisionModalState.item && decisionModalState.ticket && (
          <div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Ticket Number</Text>
                  <div><strong style={{ color: '#2563eb' }}>{decisionModalState.ticket.ticketNumber}</strong></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Requester</Text>
                  <div><strong>{decisionModalState.ticket.createdBy}</strong></div>
                </Col>
                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Folder Path</Text>
                  <div><code>{decisionModalState.item.folderPath}</code></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Requested Access Type</Text>
                  <div><Tag color="blue">{decisionModalState.item.accessType}</Tag></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Reason for Access</Text>
                  <div><Text>{decisionModalState.item.reasonForAccess}</Text></div>
                </Col>
              </Row>
            </div>

            <Form
              form={decisionForm}
              layout="vertical"
              onFinish={async (values) => {
                await handleConfirmDecision(values);
              }}
            >
              {/* Confirmed Access Type selector for HOD & Folder Owner during Approval */}
              {decisionModalState.isApproved && decisionModalState.role !== 'OPERATOR' && (
                <Form.Item
                  name="confirmAccessType"
                  label={
                    <span style={{ fontWeight: 600 }}>
                      Confirm Access Type <span style={{ color: '#ef4444' }}>*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select/confirm the access type to be granted' }]}
                  extra="Select or confirm the exact permission level to grant for this folder."
                >
                  <Select placeholder="Select permission level" size="large">
                    <Option value="Read">Read (Read-only access)</Option>
                    <Option value="Write">Write (Upload / Modify files)</Option>
                    <Option value="Read & Write">Read & Write (Full edit & read)</Option>
                    <Option value="Modify">Modify (Read, Write, Delete)</Option>
                    <Option value="Full Control">Full Control (Complete administrative control)</Option>
                  </Select>
                </Form.Item>
              )}

              {/* Operator info: shows the confirmed access type that was approved */}
              {decisionModalState.isApproved && decisionModalState.role === 'OPERATOR' && (
                <div style={{ marginBottom: 16, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
                  <Text type="secondary" style={{ fontSize: '0.85rem' }}>Approved Access Level to Provision: </Text>
                  <Tag color="purple" style={{ fontSize: '0.9rem', fontWeight: 600, padding: '2px 8px' }}>
                    {decisionModalState.item.confirmAccessType || decisionModalState.item.accessType}
                  </Tag>
                </div>
              )}

              {/* Comments input field */}
              <Form.Item
                name="comments"
                label={
                  <span style={{ fontWeight: 600 }}>
                    {decisionModalState.isApproved ? 'Comments / Notes (Optional)' : 'Rejection Reason / Comments *'}
                  </span>
                }
                rules={[
                  { 
                    required: !decisionModalState.isApproved, 
                    message: 'Please provide a comment explaining the reason for rejection.' 
                  }
                ]}
                extra="These comments will be recorded in the audit log and visible in the portal and email."
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder={
                    decisionModalState.isApproved 
                      ? 'Add any approval comments or instructions for the operator...' 
                      : 'Provide justification for rejecting this request...'
                  }
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0, marginTop: 24 }}>
                <Space>
                  <Button 
                    onClick={() => {
                      setDecisionModalState(prev => ({ ...prev, isOpen: false }));
                      decisionForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    danger={!decisionModalState.isApproved}
                    style={decisionModalState.isApproved ? { background: '#22c55e', borderColor: '#22c55e' } : undefined}
                  >
                    {decisionModalState.isApproved 
                      ? (decisionModalState.role === 'OPERATOR' ? 'Confirm Grant Access' : 'Confirm Approval')
                      : 'Confirm Rejection'
                    }
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* ── REVOKE ACCESS CONFIRMATION MODAL WITH COMMENTS ── */}
      <Modal
        title={
          <Space align="center">
            <StopOutlined style={{ color: '#ef4444', fontSize: '1.25rem' }} />
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#b91c1c' }}>
              Revoke Granted Access
            </span>
          </Space>
        }
        open={revokeModalState.isOpen}
        onCancel={() => {
          setRevokeModalState({ isOpen: false, ticket: null, item: null });
          revokeForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={600}
      >
        {revokeModalState.item && revokeModalState.ticket && (
          <div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 18 }}>
              <Text style={{ color: '#991b1b', fontSize: '0.85rem' }}>
                <strong>Warning:</strong> Revoking access will immediately change the status to <strong>ACCESS REVOKED</strong>, remove NTFS permissions, and send an email notification to the user with your comments.
              </Text>
            </div>

            <div className="info-banner-card" style={{ marginBottom: 18 }}>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.78rem' }}>Ticket Number</Text>
                  <div><strong style={{ color: '#2563eb' }}>{revokeModalState.ticket.ticketNumber}</strong></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.78rem' }}>Requester User</Text>
                  <div><strong>{revokeModalState.ticket.createdBy}</strong></div>
                </Col>
                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: '0.78rem' }}>Folder Path</Text>
                  <div><span className="folder-code-badge">{revokeModalState.item.folderPath}</span></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.78rem' }}>Active Permission Level</Text>
                  <div>
                    <Tag color="purple" style={{ fontWeight: 600 }}>
                      {revokeModalState.item.confirmAccessType || revokeModalState.item.accessType}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.78rem' }}>Granted On</Text>
                  <div>
                    <Text>{revokeModalState.item.grantedAt ? new Date(revokeModalState.item.grantedAt).toLocaleDateString() : 'Active'}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Form
              form={revokeForm}
              layout="vertical"
              onFinish={handleRevokeSubmit}
            >
              <Form.Item
                name="comments"
                label={
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    Reason for Revoking Access <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                rules={[
                  { 
                    required: true, 
                    message: 'Please provide a justification for revoking this folder access.' 
                  }
                ]}
                extra="This reason is mandatory and will be logged in the audit trail and emailed to the requester."
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Enter reason for revocation (e.g., Project role changed, employee offboarding, compliance review, security incident)..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0, marginTop: 24 }}>
                <Space>
                  <Button 
                    onClick={() => {
                      setRevokeModalState({ isOpen: false, ticket: null, item: null });
                      revokeForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    danger 
                    htmlType="submit"
                    icon={<StopOutlined />}
                  >
                    Confirm & Revoke Access
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Drawer
        title={<span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Notifications Center</span>}
        placement="right"
        onClose={() => setIsNotificationDrawerOpen(false)}
        open={isNotificationDrawerOpen}
        width={360}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={item => (
            <List.Item style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: item.read ? '#cbd5e1' : '#4f46e5' }} icon={<BellOutlined />} />}
                title={<strong>{item.title}</strong>}
                description={
                  <div>
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{item.description}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>{item.time}</div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="No notifications" /> }}
        />
      </Drawer>

    </Layout>
  );
}
