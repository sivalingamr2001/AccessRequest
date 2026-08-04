import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Card, Table, Form, Input, Select, Space, 
  Tag, Modal, Typography, Dropdown, Avatar, Row, Col, Checkbox,
  message, notification, Divider, Empty, Drawer, List, Badge
} from 'antd';
import { 
  UserOutlined, LogoutOutlined, KeyOutlined, 
  PlusOutlined, AuditOutlined, DashboardOutlined, ToolOutlined, 
  DatabaseOutlined, TeamOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, BellOutlined
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
    items
  }: any) => {
    const rows = items.map((item: any, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.folderPath)}</td>
        <td>${escapeHtml(item.accessType)}</td>
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
          <tr><td><b>Date</b></td><td>${new Date().toLocaleString()}</td></tr>
        </table>

        <h3>Access Request Details</h3>
        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th>#</th>
              <th>Folder Path</th>
              <th>Access Type</th>
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

  const handleApproveReject = async (itemId: number, role: 'HOD' | 'OWNER' | 'OPERATOR', isApproved: boolean) => {
    if (!currentUser) return;
    try {
      let success = false;
      if (role === 'HOD') {
        success = await api.handleHodApproval(itemId, currentUser.userName, isApproved);
      } else if (role === 'OWNER') {
        success = await api.handleFolderOwnerApproval(itemId, currentUser.userName, isApproved);
      } else if (role === 'OPERATOR') {
        success = await api.handleOperatorAction(itemId, currentUser.userName, isApproved);
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
              items: [item]
            }),
            mailCc: requester?.email || ''
          });
        }

        setNotifications(prev => [
          {
            id: Date.now(),
            title: isApproved ? 'Request Approved' : 'Request Rejected',
            description: `Request item #${itemId} was ${isApproved ? 'approved' : 'rejected'}.`,
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>
                    {currentUser.roles.includes('Operator') || currentUser.roles.includes('Admin') ? 'All Access Requests' : currentUser.roles.includes('Hod') ? 'My & Dept Requests' : 'My Access Requests'}
                  </Title>
                  <Text type="secondary">
                    {currentUser.roles.includes('Operator') || currentUser.roles.includes('Admin') ? 'Browse all corporate permission requests in the system.' : currentUser.roles.includes('Hod') ? 'Monitor access requests from your department and owned folder mappings.' : 'Track the real-time lifecycle and approval status of your requested folders.'}
                  </Text>
                </div>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleOpenCreateModal}
                >
                  Create Request
                </Button>
              </div>

              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input.Search 
                  placeholder="Search requests by ticket #, requester, or host..." 
                  allowClear 
                  onChange={(e) => setRequestSearchText(e.target.value)} 
                  style={{ width: 340 }} 
                />
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
                    { title: 'Ticket #', dataIndex: 'ticketNumber', key: 'ticketNumber', render: (text: string) => <strong>{text}</strong> },
                    { title: 'Request Host', dataIndex: 'reqTo', key: 'reqTo' },
                    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
                    { 
                      title: 'Created On', 
                      dataIndex: 'createdOn', 
                      key: 'createdOn',
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
                                style={{ color: '#0284c7', fontWeight: 500 }}
                                onClick={() => handleOpenEditModal(record)}
                              >
                                Edit
                              </Button>
                            )}

                            {isOwnTicket && isRejectedOrExpired && (
                              <Button 
                                type="link" 
                                style={{ color: '#d97706', fontWeight: 600 }}
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
              <div style={{ marginBottom: 24 }}>
                <Title level={2} className="gradient-header" style={{ margin: 0 }}>HOD Approval Console</Title>
                <Text type="secondary">Review and approve access items requested by your department or folder mappings.</Text>
              </div>

              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input.Search 
                  placeholder="Search pending approvals by ticket, requester, or path..." 
                  allowClear 
                  onChange={(e) => setHodSearchText(e.target.value)} 
                  style={{ width: 340 }} 
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
                    { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber' },
                    { title: 'Requester', dataIndex: ['ticket', 'createdBy'], key: 'createdBy' },
                    { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <code>{text}</code> },
                    { title: 'Access Type', dataIndex: ['item', 'accessType'], key: 'accessType', render: (text: string) => <Tag color="blue">{text}</Tag> },
                    { title: 'Reason', dataIndex: ['item', 'reasonForAccess'], key: 'reasonForAccess' },
                    { 
                      title: 'Approval Stage', 
                      key: 'stage', 
                      render: (_, record) => record.item.status === 'PENDING_FOLDER_OWNER' 
                        ? <Tag color="purple">Folder Owner</Tag> 
                        : <Tag color="cyan">Dept HOD</Tag> 
                    },
                    { 
                      title: 'Actions', 
                      key: 'actions', 
                      render: (_: any, record) => (
                        <Space>
                          <Button 
                            type="primary" 
                            style={{ background: '#22c55e', color: '#fff', borderColor: '#22c55e' }}
                            onClick={() => {
                              const role = record.item.status === 'PENDING_FOLDER_OWNER' ? 'OWNER' : 'HOD';
                              handleApproveReject(record.item.id, role, true);
                            }}
                          >
                            Approve
                          </Button>
                          <Button 
                            danger 
                            onClick={() => {
                              const role = record.item.status === 'PENDING_FOLDER_OWNER' ? 'OWNER' : 'HOD';
                              handleApproveReject(record.item.id, role, false);
                            }}
                          >
                            Reject
                          </Button>
                        </Space>
                      ) 
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
              <div style={{ marginBottom: 24 }}>
                <Title level={2} className="gradient-header" style={{ margin: 0 }}>Operator Fulfillment Console</Title>
                <Text type="secondary">Execute folder sharing commands in Active Directory and mark tickets as completed.</Text>
              </div>

              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input.Search 
                  placeholder="Search operator tasks by ticket, user, or path..." 
                  allowClear 
                  onChange={(e) => setOperatorSearchText(e.target.value)} 
                  style={{ width: 340 }} 
                />
              </div>

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
                    { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber' },
                    { title: 'User', dataIndex: ['ticket', 'createdBy'], key: 'createdBy' },
                    { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <code>{text}</code> },
                    { title: 'Access Type', dataIndex: ['item', 'accessType'], key: 'accessType', render: (text: string) => <Tag color="blue">{text}</Tag> },
                    { title: 'Reason', dataIndex: ['item', 'reasonForAccess'], key: 'reasonForAccess' },
                    { 
                      title: 'Actions', 
                      key: 'actions', 
                      render: (_: any, record) => (
                        <Space>
                          <Button 
                            type="primary" 
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                            onClick={() => handleApproveReject(record.item.id, 'OPERATOR', true)}
                          >
                            Grant Access
                          </Button>
                          <Button 
                            danger 
                            onClick={() => handleApproveReject(record.item.id, 'OPERATOR', false)}
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
            </div>
          )}

          {/* 4. ADMIN USER ROLES VIEW */}
          {currentView === 'admin-users' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <Title level={2} className="gradient-header" style={{ margin: 0 }}>Manage User Roles & Location</Title>
                <Text type="secondary">Configure corporate permissions, offices, and HOD statuses for portal accounts.</Text>
              </div>

              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input.Search 
                  placeholder="Search users by name, emp ID, email, or role..." 
                  allowClear 
                  onChange={(e) => setUserSearchText(e.target.value)} 
                  style={{ width: 340 }} 
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>Folder Owner Mappings</Title>
                  <Text type="secondary">Map physical shared network folders to primary/secondary HODs for approval checks.</Text>
                </div>
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
              </div>

              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Input.Search 
                  placeholder="Search folder mappings by path or owner..." 
                  allowClear 
                  onChange={(e) => setMappingSearchText(e.target.value)} 
                  style={{ width: 340 }} 
                />
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
        width={720}
      >
        {selectedTicket && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text type="secondary">Created By: </Text>
                <Text strong>{selectedTicket.createdBy}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Created On: </Text>
                <Text strong>{new Date(selectedTicket.createdOn).toLocaleString()}</Text>
              </Col>
            </Row>

            <Table 
              dataSource={selectedTicket.items} 
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: 'Folder Path', dataIndex: 'folderPath', key: 'folderPath', render: (text: string) => <code>{text}</code> },
                { title: 'Permission', dataIndex: 'accessType', key: 'accessType' },
                { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => renderStatusTag(status) },
                {
                  title: 'Audit Logs',
                  key: 'logs',
                  render: (_: any, record: AccessItemDto) => (
                    <Button type="link" size="small" onClick={() => viewApprovalLogs(record)}>
                      View Approvers
                    </Button>
                  )
                }
              ]}
            />

            {selectedItemLogs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Divider>Approval Audit Trail</Divider>
                <Table
                  dataSource={selectedItemLogs}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: 'Date/Time', dataIndex: 'actionDate', key: 'actionDate', render: (d) => new Date(d).toLocaleString() },
                    { title: 'Role Stage', dataIndex: 'approverRole', key: 'approverRole', render: (r) => <Tag color="cyan">{r}</Tag> },
                    { title: 'Approver', dataIndex: 'approvedBy', key: 'approvedBy', render: (text) => <strong>{text}</strong> },
                    { 
                      title: 'Action', 
                      dataIndex: 'actionTaken', 
                      key: 'actionTaken', 
                      render: (act) => act === 'APPROVED' ? <Tag color="green">Approved</Tag> : <Tag color="red">Rejected</Tag> 
                    }
                  ]}
                />
              </div>
            )}
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
