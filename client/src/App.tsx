import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Card, Table, Form, Input, Select, Space, 
  Tag, Modal, Typography, Dropdown, Avatar, Row, Col, 
  message, notification, Divider, Empty 
} from 'antd';
import { 
  UserOutlined, LogoutOutlined, KeyOutlined, 
  PlusOutlined, AuditOutlined, DashboardOutlined, ToolOutlined, 
  DatabaseOutlined, TeamOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';
import { api } from './api';
import FolderPathSelector from './components/FolderPathSelector';
import type { UserDetailsDto, AccessItemDto, FolderMapping, TicketDto, ApprovalLog, ParsedFolderPathDto } from './types';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserDetailsDto | null>(null);
  const [currentView, setCurrentView] = useState<string>('my-requests');
  const [activeMenuKey, setActiveMenuKey] = useState<string>('my-requests');
  const [apiMode, setApiMode] = useState<string>('');
  
  // App States
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [folderPaths, setFolderPaths] = useState<ParsedFolderPathDto[]>([]);
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
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [selectedItemLogs, setSelectedItemLogs] = useState<ApprovalLog[]>([]);
  
  const [form] = Form.useForm();
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

      if (currentUser?.roles.includes('Admin')) {
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

  const handleCreateRequest = async (values: any) => {
    if (!currentUser) return;
    try {
      const payload = {
        reqTo: values.reqTo,
        createdBy: currentUser.userName,
        items: values.items.map((item: any) => ({
          folderPath: item.folderPath,
          accessType: item.accessType,
          reasonForAccess: item.reasonForAccess
        }))
      };
      
      const ticketNo = await api.createRequest(payload);
      notification.success({
        message: 'Request Created',
        description: `Ticket ${ticketNo} created successfully. Sent to HOD for review.`,
        placement: 'topRight'
      });
      setIsRequestModalOpen(false);
      form.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to create request');
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
    if (currentUser.roles.includes('User') || currentUser.roles.includes('Hod')) {
      items.push({
        key: 'my-requests',
        icon: <DashboardOutlined />,
        label: 'My Requests',
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
    return (
      <div className="login-bg">
        <Card className="premium-card" style={{ width: 440, padding: '24px 12px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="logo" style={{ justifyContent: 'center', fontSize: '2rem' }}>
              <KeyOutlined /> AccessRequest
            </span>
            <Text type="secondary" style={{ fontSize: '0.9rem', marginTop: 8, display: 'block' }}>
              Corporate NTFS Permissions Portal
            </Text>
          </div>

          <Form layout="vertical" onFinish={handleLogin} requiredMark={false}>
            <Form.Item 
              label="Username" 
              name="username" 
              rules={[{ required: true, message: 'Please input username' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="e.g. Sivalingam, ADMIN" size="large" />
            </Form.Item>

            <Form.Item 
              label="Password / Key" 
              name="password" 
              rules={[{ required: true, message: 'Please input credentials' }]}
            >
              <Input.Password placeholder="e.g. 1409, admin123, 123 (bypass)" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block style={{ marginTop: 8 }}>
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '16px 0' }}>Demo Quick Logins</Divider>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <Text type="secondary"><strong>System Admin</strong> (Admin)</Text>
              <Button type="link" size="small" onClick={() => form.setFieldsValue({ username: 'System Admin', password: 'admin123' })}>Use</Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <Text type="secondary"><strong>Sivalingam</strong> (HOD / User)</Text>
              <Button type="link" size="small" onClick={() => form.setFieldsValue({ username: 'Sivalingam', password: '1409' })}>Use</Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <Text type="secondary"><strong>BOOPATHY</strong> (Operator)</Text>
              <Button type="link" size="small" onClick={() => form.setFieldsValue({ username: 'BOOPATHY', password: '19' })}>Use</Button>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Tag color="cyan">{apiMode}</Tag>
          </div>
        </Card>
      </div>
    );
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
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'PENDING_DEPT_HOD') {
          list.push({ ticket: t, item: i });
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
                  <Title level={2} className="gradient-header" style={{ margin: 0 }}>Access Requests</Title>
                  <Text type="secondary">View and manage your NTFS folder access requests.</Text>
                </div>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  Create Request
                </Button>
              </div>

              <Card className="premium-card">
                <Table 
                  dataSource={tickets.filter(t => t.createdBy.toLowerCase() === currentUser.userName.toLowerCase())} 
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
                      render: (_: any, record: TicketDto) => (
                        <Button 
                          type="link" 
                          onClick={() => {
                            setSelectedTicket(record);
                            setIsTicketDetailOpen(true);
                          }}
                        >
                          Details & Logs
                        </Button>
                      )
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

              <Card className="premium-card">
                <Table 
                  dataSource={getPendingHodItems()} 
                  rowKey={(record) => record.item.id.toString()}
                  columns={[
                    { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber' },
                    { title: 'Requester', dataIndex: ['ticket', 'createdBy'], key: 'createdBy' },
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
                            style={{ background: '#22c55e', color: '#fff', borderColor: '#22c55e' }}
                            onClick={() => handleApproveReject(record.item.id, 'HOD', true)}
                          >
                            Approve
                          </Button>
                          <Button 
                            danger 
                            onClick={() => handleApproveReject(record.item.id, 'HOD', false)}
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

              <Card className="premium-card">
                <Table 
                  dataSource={getPendingOperatorItems()} 
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

              <Card className="premium-card">
                <Table 
                  dataSource={users} 
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

              <Card className="premium-card">
                <Table 
                  dataSource={folderMappings} 
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

      {/* ── CREATE REQUEST MODAL ────────────────────────────────────────────── */}
      <Modal
        title="Create New Folder Access Request"
        open={isRequestModalOpen}
        onCancel={() => setIsRequestModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Environment / Server (ReqTo)" 
                name="reqTo" 
                rules={[{ required: true, message: 'Please select target environment' }]}
              >
                <Select placeholder="Select host">
                  <Option value="edp">EDP Production Share</Option>
                  <Option value="dev">Development Sandbox</Option>
                  <Option value="itsr">IT Service Desk Share</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
            <Space>
              <Button onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Submit Request</Button>
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
            <Input placeholder="e.g. edp, \\10.30.50.15\jipl" disabled={!!selectedMapping} />
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

    </Layout>
  );
}
