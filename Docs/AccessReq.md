# AccessRequest Portal — Split Component Implementation

This document contains the full refactor: the monolithic `App.tsx` is split into
hooks, views, modals, and shared components, and the folder picker is rebuilt as a
**cascading step selector** (Drive → Parent → Child1 → Child2 → Child3 → Child4)
where the user can stop at any level (starting from Parent) and click
**"Select this folder"** to lock in that path as their requested folder — they are
not forced to drill all the way down to a leaf.

Copy each section into the matching file path in your project.

---

## File tree

```
src/
├── App.tsx
├── types.ts                              (existing — extended below)
├── constants/
│   └── terms.ts
├── utils/
│   ├── mailBuilder.ts
│   ├── statusTag.tsx
│   └── folderPathTree.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAppData.ts
│   ├── useNotifications.ts
│   ├── usePendingItems.ts
│   ├── useDecisionModal.ts
│   └── useRevokeModal.ts
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   └── NotificationsDrawer.tsx
│   ├── shared/
│   │   └── FolderPathBadge.tsx
│   ├── FolderPathSelector.tsx           (rebuilt — cascading picker)
│   ├── views/
│   │   ├── MyRequestsView.tsx
│   │   ├── HodQueueView.tsx
│   │   ├── OperatorQueueView.tsx
│   │   ├── AdminUsersView.tsx
│   │   └── AdminMappingsView.tsx
│   └── modals/
│       ├── RequestFormModal.tsx
│       ├── FolderItemFieldList.tsx
│       ├── UserEditModal.tsx
│       ├── FolderMappingModal.tsx
│       ├── TicketDetailModal.tsx
│       ├── DecisionModal.tsx
│       └── RevokeModal.tsx
```

---

## `types.ts` (additions)

```ts
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
  role: 'HOD' | 'OWNER' | 'OPERATOR';
  isApproved: boolean;
};

export type RevokeModalState = {
  isOpen: boolean;
  item: AccessItemDto | null;
  ticket: TicketDto | null;
};

export type PendingItemRecord = { ticket: TicketDto; item: AccessItemDto };
```

*(Assumes `AccessItemDto`, `ApprovalLog`, `FolderMapping`, `ParsedFolderPathDto`, `TicketDto`, `UserDetailsDto` already exist from your original `types.ts`.)*

---

## `constants/terms.ts`

```ts
export const TERMS: string[] = [
  'Access requests are reviewed by the designated HOD and must align with organizational security policies.',
  'Requests should only include folders that are required for job duties and approved by your manager.',
  'Use of sensitive or restricted data must comply with company data protection and retention standards.',
  'Access is granted on a least-privileged basis and is subject to periodic review and revocation.',
  'Shared credentials and unauthorized access sharing are prohibited by corporate governance rules.',
  'All requests are audited; false or abusive access requests may result in disciplinary action.'
];
```

---

## `utils/mailBuilder.ts`

```ts
import { workflowApi } from '../api/workflowApi';

export const escapeHtml = (value: any) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const buildMailBody = ({
  title,
  ticketNo,
  requester,
  approver,
  stage,
  action,
  items,
  comments
}: {
  title: string;
  ticketNo: string;
  requester: string;
  approver: string;
  stage: string;
  action: string;
  items: any[];
  comments?: string;
}) => {
  const rows = items
    .map(
      (item: any, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.folderPath)}</td>
        <td>${escapeHtml(item.accessType)}</td>
        <td>${escapeHtml(item.confirmAccessType || '-')}</td>
        <td>${escapeHtml(item.reasonForAccess)}</td>
        <td>${escapeHtml(item.status || stage)}</td>
      </tr>
    `
    )
    .join('');

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
            <th>#</th><th>Folder Path</th><th>Requested Access</th>
            <th>Confirmed Access</th><th>Reason</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

export const sendMailLog = async ({
  mailProgram,
  mailFrom = 'feedback@janatics.co.in',
  mailTo,
  mailSubject,
  mailBody,
  mailCc = ''
}: {
  mailProgram: string;
  mailFrom?: string;
  mailTo: string;
  mailSubject: string;
  mailBody: string;
  mailCc?: string;
}) => {
  await workflowApi.insertMailLog({
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
```

---

## `utils/statusTag.tsx`

```tsx
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export const renderStatusTag = (status: string) => {
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
```

---

## `utils/folderPathTree.ts`

Pure helpers used by the cascading `FolderPathSelector`. No React, no state — just
functions that filter `ParsedFolderPathDto[]` down to the options available at each
step, given the selections made so far.

```ts
import type { ParsedFolderPathDto } from '../types';

const norm = (value: unknown) => String(value ?? '').trim();

export type FolderLevel = 'drive' | 'parent' | 'child1' | 'child2' | 'child3' | 'child4';

/** Unique, sorted list of drive names available. */
export function getDriveOptions(paths: ParsedFolderPathDto[]): string[] {
  const set = new Set<string>();
  for (const p of paths) {
    const d = norm(p.driveName);
    if (d) set.add(d);
  }
  return Array.from(set).sort();
}

/** Unique parent folders under a chosen drive. */
export function getParentOptions(paths: ParsedFolderPathDto[], drive: string): string[] {
  const set = new Set<string>();
  for (const p of paths) {
    if (norm(p.driveName) !== drive) continue;
    const parent = norm(p.parentFolder);
    if (parent) set.add(parent);
  }
  return Array.from(set).sort();
}

/**
 * Unique options at a given child depth (1-4), given all selections made so far.
 * Returns [] if no rows go that deep — meaning the caller is at a leaf and should
 * only offer "Select this folder", not another dropdown level.
 */
export function getChildOptions(
  paths: ParsedFolderPathDto[],
  selections: { drive: string; parent: string; child1?: string; child2?: string; child3?: string }
): { key: 'childDepth1' | 'childDepth2' | 'childDepth3' | 'childDepth4'; options: string[] } | null {
  const depth = !selections.child1 ? 1 : !selections.child2 ? 2 : !selections.child3 ? 3 : 4;
  const key = (`childDepth${depth}` as unknown) as 'childDepth1' | 'childDepth2' | 'childDepth3' | 'childDepth4';

  const matches = paths.filter(p => {
    if (norm(p.driveName) !== selections.drive) return false;
    if (norm(p.parentFolder) !== selections.parent) return false;
    if (selections.child1 && norm(p.childDepth1) !== selections.child1) return false;
    if (selections.child2 && norm(p.childDepth2) !== selections.child2) return false;
    if (selections.child3 && norm(p.childDepth3) !== selections.child3) return false;
    return true;
  });

  const set = new Set<string>();
  for (const p of matches) {
    const v = norm((p as any)[key]);
    if (v) set.add(v);
  }

  if (set.size === 0) return null;
  return { key, options: Array.from(set).sort() };
}

/** Builds the backslash-joined full path string from whatever has been selected. */
export function buildFullPath(selections: {
  drive: string;
  parent?: string;
  child1?: string;
  child2?: string;
  child3?: string;
  child4?: string;
}): string {
  const segments = [selections.drive, selections.parent, selections.child1, selections.child2, selections.child3, selections.child4].filter(
    Boolean
  );
  return segments.join('\\');
}

/**
 * Parses an existing full path string (e.g. from editing/resubmitting a ticket)
 * back into level selections, so the selector can be pre-populated.
 */
export function parseFullPath(
  fullPath: string,
  paths: ParsedFolderPathDto[]
): { drive: string; parent: string; child1?: string; child2?: string; child3?: string; child4?: string } | null {
  if (!fullPath) return null;
  const match = paths.find(p => {
    const built = buildFullPath({
      drive: norm(p.driveName),
      parent: norm(p.parentFolder),
      child1: norm(p.childDepth1) || undefined,
      child2: norm(p.childDepth2) || undefined,
      child3: norm(p.childDepth3) || undefined,
      child4: norm(p.childDepth4) || undefined
    });
    return built === fullPath || built.startsWith(fullPath + '\\') || fullPath.startsWith(built);
  });
  if (!match) {
    // Fallback: best-effort split so the UI isn't blank on unmapped legacy paths
    const parts = fullPath.split('\\').filter(Boolean);
    return {
      drive: parts[0] || '',
      parent: parts[1] || '',
      child1: parts[2],
      child2: parts[3],
      child3: parts[4],
      child4: parts[5]
    };
  }
  return {
    drive: norm(match.driveName),
    parent: norm(match.parentFolder),
    child1: norm(match.childDepth1) || undefined,
    child2: norm(match.childDepth2) || undefined,
    child3: norm(match.childDepth3) || undefined,
    child4: norm(match.childDepth4) || undefined
  };
}
```

---

## `components/FolderPathSelector.tsx` — the cascading picker

**Behavior:**
1. User picks a **Drive** first.
2. Then a **Parent** folder under that drive.
3. Once a Parent is chosen, a **"Select this folder"** button appears — the user
   can stop here and request the parent folder itself.
4. If child folders exist under the current selection, a **Child 1** dropdown
   appears as an additional *optional* step. Selecting it again reveals
   "Select this folder" for that deeper level, and so on through Child 4.
5. At any step the user can click **"Select this folder"** to lock in the
   currently-built path — they are never forced to go deeper than Parent.
6. The confirmed full path is shown in a highlighted box with a **Change** action.

```tsx
import { CheckCircleFilled, EditOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import { Alert, Button, Select, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ParsedFolderPathDto } from '../types';
import { buildFullPath, getChildOptions, getDriveOptions, getParentOptions, parseFullPath } from '../utils/folderPathTree';

const { Text } = Typography;

interface FolderPathSelectorProps {
  folderPaths: ParsedFolderPathDto[];
  value?: string;
  onChange?: (fullPath: string | undefined) => void;
}

type Selections = {
  drive?: string;
  parent?: string;
  child1?: string;
  child2?: string;
  child3?: string;
  child4?: string;
};

export default function FolderPathSelector({ folderPaths, value, onChange }: FolderPathSelectorProps) {
  const [selections, setSelections] = useState<Selections>({});
  const [confirmedPath, setConfirmedPath] = useState<string | undefined>(value);

  // Sync external value (e.g. when editing an existing ticket item) into internal state
  useEffect(() => {
    if (value && value !== confirmedPath) {
      const parsed = parseFullPath(value, folderPaths);
      if (parsed) {
        setSelections(parsed);
        setConfirmedPath(value);
      }
    }
    if (!value) {
      setConfirmedPath(undefined);
      setSelections({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const driveOptions = useMemo(() => getDriveOptions(folderPaths), [folderPaths]);

  const parentOptions = useMemo(
    () => (selections.drive ? getParentOptions(folderPaths, selections.drive) : []),
    [folderPaths, selections.drive]
  );

  const childLevel = useMemo(() => {
    if (!selections.drive || !selections.parent) return null;
    return getChildOptions(folderPaths, {
      drive: selections.drive,
      parent: selections.parent,
      child1: selections.child1,
      child2: selections.child2,
      child3: selections.child3
    });
  }, [folderPaths, selections]);

  const currentPathPreview = useMemo(() => {
    if (!selections.drive || !selections.parent) return '';
    return buildFullPath(selections as Required<Pick<Selections, 'drive'>> & Selections);
  }, [selections]);

  const handleDriveChange = (drive: string) => {
    setSelections({ drive });
  };

  const handleParentChange = (parent: string) => {
    setSelections(prev => ({ drive: prev.drive, parent }));
  };

  const handleChildChange = (depthKey: 'child1' | 'child2' | 'child3' | 'child4', val: string) => {
    setSelections(prev => {
      const next: Selections = { drive: prev.drive, parent: prev.parent };
      const order: ('child1' | 'child2' | 'child3' | 'child4')[] = ['child1', 'child2', 'child3', 'child4'];
      for (const k of order) {
        if (k === depthKey) {
          next[k] = val;
          break;
        }
        next[k] = prev[k];
      }
      return next;
    });
  };

  const handleSelectThisFolder = () => {
    const fullPath = buildFullPath(selections as any);
    setConfirmedPath(fullPath);
    onChange?.(fullPath);
  };

  const handleChangeSelection = () => {
    setConfirmedPath(undefined);
    onChange?.(undefined);
    // keep dropdown selections as-is so user can quickly re-pick a sibling/child
  };

  // ── CONFIRMED STATE ──────────────────────────────────────────────
  if (confirmedPath) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 14px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8
        }}
      >
        <Space align="start">
          <CheckCircleFilled style={{ color: '#22c55e', fontSize: '1.1rem', marginTop: 2 }} />
          <div>
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
              Selected Folder Path
            </Text>
            <Text strong style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {confirmedPath}
            </Text>
          </div>
        </Space>
        <Button size="small" icon={<EditOutlined />} onClick={handleChangeSelection}>
          Change
        </Button>
      </div>
    );
  }

  // ── STEP-BY-STEP CASCADING STATE ─────────────────────────────────
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, background: '#fafbfc' }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Step 1: Drive */}
        <div>
          <Text type="secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>
            1. Select Drive
          </Text>
          <Select
            showSearch
            placeholder="Choose a drive / share"
            style={{ width: '100%' }}
            value={selections.drive}
            onChange={handleDriveChange}
            options={driveOptions.map(d => ({ value: d, label: d }))}
            suffixIcon={<FolderOutlined />}
          />
        </div>

        {/* Step 2: Parent */}
        {selections.drive && (
          <div>
            <Text type="secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>
              2. Select Parent Folder
            </Text>
            <Select
              showSearch
              placeholder="Choose a parent folder"
              style={{ width: '100%' }}
              value={selections.parent}
              onChange={handleParentChange}
              options={parentOptions.map(p => ({ value: p, label: p }))}
              suffixIcon={<FolderOpenOutlined />}
            />
          </div>
        )}

        {/* Once Parent is picked, user may stop here */}
        {selections.drive && selections.parent && (
          <Alert
            type="info"
            showIcon={false}
            style={{ padding: '8px 12px' }}
            message={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem' }}>
                  Current path:{' '}
                  <code style={{ background: '#eef2ff', padding: '2px 6px', borderRadius: 4 }}>{currentPathPreview}</code>
                </span>
                <Button type="primary" size="small" onClick={handleSelectThisFolder}>
                  Select this folder
                </Button>
              </div>
            }
          />
        )}

        {/* Step 3+: optional deeper child levels, one at a time */}
        {selections.drive && selections.parent && childLevel && (
          <div>
            <Text type="secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>
              {childLevel.key === 'childDepth1' && '3. (Optional) Select Sub-folder'}
              {childLevel.key === 'childDepth2' && '4. (Optional) Select Sub-folder'}
              {childLevel.key === 'childDepth3' && '5. (Optional) Select Sub-folder'}
              {childLevel.key === 'childDepth4' && '6. (Optional) Select Sub-folder'}
            </Text>
            <Select
              showSearch
              allowClear
              placeholder="Narrow down further, or use the button above to stop here"
              style={{ width: '100%' }}
              value={
                childLevel.key === 'childDepth1'
                  ? selections.child1
                  : childLevel.key === 'childDepth2'
                  ? selections.child2
                  : childLevel.key === 'childDepth3'
                  ? selections.child3
                  : selections.child4
              }
              onChange={val => {
                const depthKey =
                  childLevel.key === 'childDepth1'
                    ? 'child1'
                    : childLevel.key === 'childDepth2'
                    ? 'child2'
                    : childLevel.key === 'childDepth3'
                    ? 'child3'
                    : 'child4';
                handleChildChange(depthKey as any, val);
              }}
              options={childLevel.options.map(c => ({ value: c, label: c }))}
              suffixIcon={<FolderOutlined />}
            />
          </div>
        )}

        {/* Confirm button again once a deeper child level is chosen */}
        {(selections.child1 || selections.child2 || selections.child3 || selections.child4) && (
          <Alert
            type="success"
            showIcon={false}
            style={{ padding: '8px 12px' }}
            message={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem' }}>
                  Current path:{' '}
                  <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>{buildFullPath(selections as any)}</code>
                </span>
                <Button type="primary" size="small" onClick={handleSelectThisFolder}>
                  Select this folder
                </Button>
              </div>
            }
          />
        )}
      </Space>
    </div>
  );
}
```

**Notes on the picker:**
- The "Select this folder" action is available as soon as a **Parent** is chosen — the user is never forced into `Child1`. This satisfies "user can request parent only after select parent folder."
- Deeper child dropdowns only render if the underlying `folderPaths` data actually has rows at that depth (`getChildOptions` returns `null` when there's nothing deeper) — so a plain two-level `Drive\Parent` share won't show a phantom "Child 1" step.
- Once confirmed, the component collapses to a clean "Selected Folder Path" summary with a **Change** button, matching typical stepper/wizard UX.

---

## `components/shared/FolderPathBadge.tsx`

```tsx
export default function FolderPathBadge({ text }: { text: string }) {
  return <span className="folder-code-badge">{text}</span>;
}
```

---

## `hooks/useAuth.ts`

```ts
import { message } from 'antd';
import { useState } from 'react';
import { userApi } from '../api/userApi';
import type { UserDetailsDto } from '../types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserDetailsDto | null>(null);

  const handleLogin = async (
    values: any,
    onLoggedIn: (user: UserDetailsDto) => void
  ) => {
    try {
      const user = await userApi.login(values.username, values.password);
      setCurrentUser(user);
      onLoggedIn(user);
      message.success(`Logged in successfully as ${user.userName}`);
    } catch (err: any) {
      message.error(err.message || 'Login failed');
    }
  };

  const handleLogout = (onLoggedOut: () => void) => {
    setCurrentUser(null);
    onLoggedOut();
    message.info('Logged out successfully');
  };

  return { currentUser, setCurrentUser, handleLogin, handleLogout };
}
```

---

## `hooks/useAppData.ts`

```ts
import { useCallback, useEffect, useState } from 'react';
import { folderMappingApi } from '../api/folderMappingApi';
import { userApi } from '../api/userApi';
import { workflowApi } from '../api/workflowApi';
import type { FolderMapping, ParsedFolderPathDto, TicketDto, UserDetailsDto } from '../types';

export function useAppData(currentUser: UserDetailsDto | null) {
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [folderPaths, setFolderPaths] = useState<ParsedFolderPathDto[]>([]);
  const [folderMappings, setFolderMappings] = useState<FolderMapping[]>([]);
  const [allHods, setAllHods] = useState<UserDetailsDto[]>([]);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const allTix = await workflowApi.getAllTickets();
      setTickets(allTix);

      const paths = await workflowApi.getParsedFolderPaths();
      setFolderPaths(paths);

      if (currentUser.roles.includes('Admin') || currentUser.roles.includes('Hod')) {
        const u = await userApi.getAllUsers();
        setUsers(u);
        const m = await folderMappingApi.getFolderMappings();
        setFolderMappings(m);
      }

      if (
        currentUser.roles.includes('Admin') ||
        currentUser.roles.includes('User') ||
        currentUser.roles.includes('Hod')
      ) {
        const hods = await userApi.getAllHods();
        setAllHods(hods);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { tickets, users, folderPaths, folderMappings, allHods, loadData };
}
```

---

## `hooks/useNotifications.ts`

```ts
import { useState } from 'react';
import type { NotificationItem } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pushNotification = (title: string, description: string) => {
    setNotifications(prev => [
      { id: Date.now(), title, description, time: 'Just now', read: false },
      ...prev
    ]);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    pushNotification
  };
}
```

---

## `hooks/usePendingItems.ts`

```ts
import { useMemo } from 'react';
import type { FolderMapping, PendingItemRecord, TicketDto, UserDetailsDto } from '../types';

export function usePendingItems(
  tickets: TicketDto[],
  users: UserDetailsDto[],
  folderMappings: FolderMapping[],
  currentUser: UserDetailsDto | null
) {
  const pendingHodItems = useMemo<PendingItemRecord[]>(() => {
    const list: PendingItemRecord[] = [];
    if (!currentUser) return list;
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'PENDING_DEPT_HOD') {
          const creatorUser = users.find(u => u.userName.toLowerCase() === t.createdBy.toLowerCase());
          const isDeptMatch = creatorUser && creatorUser.deptId === currentUser.deptId;
          const isReqToMatch = t.reqTo.toLowerCase() === currentUser.userName.toLowerCase();
          if (isDeptMatch || isReqToMatch) list.push({ ticket: t, item: i });
        } else if (i.status === 'PENDING_FOLDER_OWNER') {
          const mapping = folderMappings.find(m => m.folderPath.toLowerCase() === i.folderPath.toLowerCase());
          const isOwner =
            mapping &&
            (mapping.primaryFolderOwner.toLowerCase() === currentUser.userName.toLowerCase() ||
              mapping.secondaryFolderOwner?.toLowerCase() === currentUser.userName.toLowerCase());
          if (isOwner) list.push({ ticket: t, item: i });
        }
      });
    });
    return list;
  }, [tickets, users, folderMappings, currentUser]);

  const pendingOperatorItems = useMemo<PendingItemRecord[]>(() => {
    const list: PendingItemRecord[] = [];
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'PENDING_OPERATOR') list.push({ ticket: t, item: i });
      });
    });
    return list;
  }, [tickets]);

  const grantedOperatorItems = useMemo<PendingItemRecord[]>(() => {
    const list: PendingItemRecord[] = [];
    tickets.forEach(t => {
      t.items?.forEach(i => {
        if (i.status === 'ACCESS_GRANTED') list.push({ ticket: t, item: i });
      });
    });
    return list;
  }, [tickets]);

  return { pendingHodItems, pendingOperatorItems, grantedOperatorItems };
}
```

---

## `hooks/useDecisionModal.ts`

```ts
import { Form, message } from 'antd';
import { useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import { buildMailBody, sendMailLog } from '../utils/mailBuilder';
import type {
  AccessItemDto,
  DecisionModalState,
  FolderMapping,
  TicketDto,
  UserDetailsDto
} from '../types';

interface Deps {
  currentUser: UserDetailsDto | null;
  tickets: TicketDto[];
  users: UserDetailsDto[];
  folderMappings: FolderMapping[];
  onSuccess: (notifTitle: string, notifDesc: string) => void;
  reload: () => Promise<void>;
}

export function useDecisionModal({ currentUser, tickets, users, folderMappings, onSuccess, reload }: Deps) {
  const [decisionForm] = Form.useForm();
  const [state, setState] = useState<DecisionModalState>({
    isOpen: false,
    item: null,
    ticket: null,
    role: 'HOD',
    isApproved: true
  });

  const openDecisionModal = (record: { ticket: TicketDto; item: AccessItemDto }, role: DecisionModalState['role'], isApproved: boolean) => {
    setState({ isOpen: true, item: record.item, ticket: record.ticket, role, isApproved });
    decisionForm.setFieldsValue({
      confirmAccessType: record.item.confirmAccessType || record.item.accessType || 'Read',
      comments: ''
    });
  };

  const closeDecisionModal = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    decisionForm.resetFields();
  };

  const handleApproveReject = async (
    itemId: number,
    role: DecisionModalState['role'],
    isApproved: boolean,
    comments?: string,
    confirmAccessType?: string
  ) => {
    if (!currentUser) return;
    try {
      let success = false;
      if (role === 'HOD') {
        success = await workflowApi.handleHodApproval(itemId, currentUser.userName, isApproved, comments, confirmAccessType);
      } else if (role === 'OWNER') {
        success = await workflowApi.handleFolderOwnerApproval(itemId, currentUser.userName, isApproved, comments, confirmAccessType);
      } else if (role === 'OPERATOR') {
        success = await workflowApi.handleOperatorAction(itemId, currentUser.userName, isApproved, comments);
      }

      if (!success) {
        message.error('Operation failed.');
        return;
      }

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
          const owner = users.find(u => u.userName.toLowerCase() === mapping?.primaryFolderOwner?.toLowerCase());
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

        const updatedItem = { ...item, confirmAccessType: confirmAccessType || item.confirmAccessType || item.accessType };

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
            action: isApproved ? 'APPROVED' : 'REJECTED',
            items: [updatedItem],
            comments
          }),
          mailCc: requester?.email || ''
        });
      }

      onSuccess(
        isApproved ? 'Request Approved' : 'Request Rejected',
        `Request item #${itemId} was ${isApproved ? 'approved' : 'rejected'}.${comments ? ` Comments: "${comments}"` : ''}`
      );
      await reload();
    } catch (err: any) {
      message.error(err.message || 'Operation failed');
    }
  };

  const handleConfirmDecision = async (values: { comments?: string; confirmAccessType?: string }) => {
    if (!state.item) return;
    await handleApproveReject(state.item.id, state.role, state.isApproved, values.comments, values.confirmAccessType);
    closeDecisionModal();
  };

  return { decisionForm, state, openDecisionModal, closeDecisionModal, handleConfirmDecision };
}
```

---

## `hooks/useRevokeModal.ts`

```ts
import { Form, message } from 'antd';
import { useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import type { AccessItemDto, RevokeModalState, TicketDto, UserDetailsDto } from '../types';

interface Deps {
  currentUser: UserDetailsDto | null;
  users: UserDetailsDto[];
  onSuccess: (notifTitle: string, notifDesc: string) => void;
  reload: () => Promise<void>;
  onAfterRevoke?: (ticketId: number) => Promise<void>;
}

export function useRevokeModal({ currentUser, users, onSuccess, reload, onAfterRevoke }: Deps) {
  const [revokeForm] = Form.useForm();
  const [state, setState] = useState<RevokeModalState>({ isOpen: false, item: null, ticket: null });

  const openRevokeModal = (record: { ticket: TicketDto; item: AccessItemDto }) => {
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
      const success = await workflowApi.revokeAccess(itemId, currentUser.userName, values.comments);
      if (!success) {
        message.error('Failed to revoke access.');
        return;
      }

      message.success(`Access for item #${itemId} was successfully revoked.`);
      const requester = users.find(u => u.userName.toLowerCase() === state.ticket!.createdBy.toLowerCase());

      await workflowApi.insertMailLog({
        templateCode: 'ACCESS_REQUEST_ACCESS_REVOKED',
        ticketId: state.ticket.id,
        mailTo: requester?.email || '',
        mailSubject: `[AccessRequest] Access Revoked - ${state.ticket.ticketNumber}`,
        mailBody: `Your access to folder ${state.item.folderPath} has been revoked by operator ${currentUser.userName}. Reason: ${values.comments}`,
        mailCc: ''
      });

      onSuccess('Access Revoked', `Access to ${state.item.folderPath} revoked by ${currentUser.userName}. Reason: "${values.comments}"`);

      const ticketId = state.ticket.id;
      closeRevokeModal();
      await reload();
      if (onAfterRevoke) await onAfterRevoke(ticketId);
    } catch (err: any) {
      message.error(err.message || 'Revocation failed');
    }
  };

  return { revokeForm, state, openRevokeModal, closeRevokeModal, handleRevokeSubmit };
}
```

---

## `components/layout/AppHeader.tsx`

```tsx
import { BellOutlined, KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Menu, Space, Typography } from 'antd';
import type { UserDetailsDto } from '../../types';

const { Text } = Typography;

interface AppHeaderProps {
  currentUser: UserDetailsDto;
  activeMenuKey: string;
  menuItems: any[];
  unreadCount: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
}

export default function AppHeader({
  currentUser,
  activeMenuKey,
  menuItems,
  unreadCount,
  onOpenNotifications,
  onLogout,
  onLogoClick
}: AppHeaderProps) {
  return (
    <div
      className="top-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div className="logo" onClick={onLogoClick}>
          <KeyOutlined /> AccessRequest
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[activeMenuKey]}
          items={menuItems}
          style={{ border: 'none', background: 'transparent', width: 450, fontSize: '0.9rem' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '1.25rem', color: '#475569' }} />}
            onClick={onOpenNotifications}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Badge>

        <Dropdown
          menu={{
            items: [
              { key: 'profile', icon: <UserOutlined />, label: `${currentUser.userName} (${currentUser.roles.join(', ')})` },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: onLogout }
            ]
          }}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar style={{ backgroundColor: '#4f46e5' }} icon={<UserOutlined />} />
            <Text strong style={{ fontSize: '0.85rem' }}>
              {currentUser.userName}
            </Text>
          </Space>
        </Dropdown>
      </div>
    </div>
  );
}
```

---

## `components/layout/NotificationsDrawer.tsx`

```tsx
import { BellOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Empty, List } from 'antd';
import type { NotificationItem } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export default function NotificationsDrawer({ open, onClose, notifications }: Props) {
  return (
    <Drawer
      title={<span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Notifications Center</span>}
      placement="right"
      onClose={onClose}
      open={open}
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
  );
}
```

---

## `components/views/MyRequestsView.tsx`

```tsx
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Input, Space, Table, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { FolderMapping, TicketDto, UserDetailsDto } from '../../types';
import { renderStatusTag } from '../../utils/statusTag';

const { Title, Text } = Typography;

interface Props {
  currentUser: UserDetailsDto;
  tickets: TicketDto[];
  users: UserDetailsDto[];
  folderMappings: FolderMapping[];
  onCreate: () => void;
  onEdit: (t: TicketDto) => void;
  onResubmit: (t: TicketDto) => void;
  onViewDetails: (t: TicketDto) => void;
}

export default function MyRequestsView({ currentUser, tickets, users, folderMappings, onCreate, onEdit, onResubmit, onViewDetails }: Props) {
  const [searchText, setSearchText] = useState('');

  const isOperatorOrAdmin = currentUser.roles.includes('Operator') || currentUser.roles.includes('Admin');
  const isHod = currentUser.roles.includes('Hod');

  const dataSource = useMemo(() => {
    let baseList = tickets;
    if (!isOperatorOrAdmin) {
      if (isHod) {
        baseList = tickets.filter(t => {
          const isOwn = t.createdBy.toLowerCase() === currentUser.userName.toLowerCase();
          const creatorUser = users.find(u => u.userName.toLowerCase() === t.createdBy.toLowerCase());
          const isDeptMatch = creatorUser && creatorUser.deptId === currentUser.deptId;
          const hasOwnedFolder = t.items?.some(i => {
            const mapping = folderMappings.find(m => m.folderPath.toLowerCase() === i.folderPath.toLowerCase());
            return (
              mapping &&
              (mapping.primaryFolderOwner.toLowerCase() === currentUser.userName.toLowerCase() ||
                mapping.secondaryFolderOwner?.toLowerCase() === currentUser.userName.toLowerCase())
            );
          });
          return isOwn || isDeptMatch || hasOwnedFolder;
        });
      } else {
        baseList = tickets.filter(t => t.createdBy.toLowerCase() === currentUser.userName.toLowerCase());
      }
    }

    if (!searchText.trim()) return baseList;
    const query = searchText.toLowerCase();
    return baseList.filter(
      t =>
        t.ticketNumber.toLowerCase().includes(query) ||
        t.reqTo.toLowerCase().includes(query) ||
        t.createdBy.toLowerCase().includes(query) ||
        t.items?.some(i => i.folderPath.toLowerCase().includes(query) || i.reasonForAccess.toLowerCase().includes(query))
    );
  }, [tickets, users, folderMappings, currentUser, isOperatorOrAdmin, isHod, searchText]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} className="gradient-header" style={{ margin: 0 }}>
            {isOperatorOrAdmin ? 'All Access Requests' : isHod ? 'My & Dept Requests' : 'My Access Requests'}
          </Title>
          <Text type="secondary">
            {isOperatorOrAdmin
              ? 'Browse all corporate permission requests in the system.'
              : isHod
              ? 'Monitor access requests from your department and owned folder mappings.'
              : 'Track the real-time lifecycle and approval status of your requested folders.'}
          </Text>
        </div>
        <Space size="middle" wrap>
          <Input.Search
            placeholder="Search requests by ticket, requester, path..."
            allowClear
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Create Request
          </Button>
        </Space>
      </div>

      <Card className="premium-card">
        <Table
          dataSource={dataSource}
          rowKey="id"
          columns={[
            { title: 'Ticket #', dataIndex: 'ticketNumber', key: 'ticketNumber', width: 140, render: (t: string) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
            { title: 'Request Host', dataIndex: 'reqTo', key: 'reqTo', width: 140 },
            { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', width: 160 },
            { title: 'Created On', dataIndex: 'createdOn', key: 'createdOn', width: 170, render: (d: string) => new Date(d).toLocaleString() },
            {
              title: 'Items Status Summary',
              key: 'summary',
              render: (_: any, record: TicketDto) => {
                const uniqueStates = Array.from(new Set(record.items?.map(i => i.status) || []));
                return <Space wrap>{uniqueStates.map(s => renderStatusTag(s))}</Space>;
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
                const isRejectedOrExpired = itemStatuses.some(
                  s => s.startsWith('REJECTED') || s === 'EXPIRED' || s === 'REVOKED' || s === 'REVOKED_BY_OPERATOR'
                );
                return (
                  <Space>
                    <Button type="link" style={{ padding: 0 }} onClick={() => onViewDetails(record)}>
                      Details & Logs
                    </Button>
                    {isOwnTicket && isPending && (
                      <Button type="link" style={{ color: '#0284c7', fontWeight: 500, padding: 0 }} onClick={() => onEdit(record)}>
                        Edit
                      </Button>
                    )}
                    {isOwnTicket && isRejectedOrExpired && (
                      <Button type="link" style={{ color: '#d97706', fontWeight: 600, padding: 0 }} onClick={() => onResubmit(record)}>
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
  );
}
```

---

## `components/views/HodQueueView.tsx`

```tsx
import { Button, Card, Empty, Input, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import type { PendingItemRecord } from '../../types';

const { Title, Text } = Typography;

interface Props {
  items: PendingItemRecord[];
  onApprove: (record: PendingItemRecord, role: 'HOD' | 'OWNER') => void;
  onReject: (record: PendingItemRecord, role: 'HOD' | 'OWNER') => void;
}

export default function HodQueueView({ items, onApprove, onReject }: Props) {
  const [searchText, setSearchText] = useState('');

  const filtered = items.filter(record => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      record.ticket.ticketNumber.toLowerCase().includes(query) ||
      record.ticket.createdBy.toLowerCase().includes(query) ||
      record.item.folderPath.toLowerCase().includes(query) ||
      record.item.reasonForAccess.toLowerCase().includes(query) ||
      record.item.accessType.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} className="gradient-header" style={{ margin: 0 }}>
            HOD Approval Console
          </Title>
          <Text type="secondary">Review and approve access items requested by your department or folder mappings.</Text>
        </div>
        <Input.Search placeholder="Search pending approvals..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 320 }} />
      </div>

      <Card className="premium-card">
        <Table
          dataSource={filtered}
          rowKey={record => record.item.id.toString()}
          columns={[
            { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber', width: 140, render: (t: string) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
            { title: 'Requester', dataIndex: ['ticket', 'createdBy'], key: 'createdBy', width: 150 },
            { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
            { title: 'Requested Access', dataIndex: ['item', 'accessType'], key: 'accessType', width: 130, render: (text: string) => <Tag color="blue">{text}</Tag> },
            {
              title: 'Confirmed Access',
              dataIndex: ['item', 'confirmAccessType'],
              key: 'confirmAccessType',
              width: 130,
              render: (text: string) => (text ? <Tag color="purple">{text}</Tag> : <Text type="secondary">-</Text>)
            },
            { title: 'Reason', dataIndex: ['item', 'reasonForAccess'], key: 'reasonForAccess' },
            {
              title: 'Approval Stage',
              key: 'stage',
              width: 130,
              render: (_, record) => (record.item.status === 'PENDING_FOLDER_OWNER' ? <Tag color="purple">Folder Owner</Tag> : <Tag color="cyan">Dept HOD</Tag>)
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 180,
              render: (_: any, record: PendingItemRecord) => {
                const role = record.item.status === 'PENDING_FOLDER_OWNER' ? 'OWNER' : 'HOD';
                return (
                  <Space>
                    <Button type="primary" style={{ background: '#22c55e', color: '#fff', borderColor: '#22c55e' }} onClick={() => onApprove(record, role)}>
                      Approve
                    </Button>
                    <Button danger onClick={() => onReject(record, role)}>
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
  );
}
```

---

## `components/views/OperatorQueueView.tsx`

```tsx
import { CheckCircleOutlined, StopOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Input, Segmented, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import type { PendingItemRecord } from '../../types';

const { Title, Text } = Typography;

interface Props {
  pendingItems: PendingItemRecord[];
  grantedItems: PendingItemRecord[];
  onGrant: (record: PendingItemRecord) => void;
  onDeny: (record: PendingItemRecord) => void;
  onRevoke: (record: PendingItemRecord) => void;
}

export default function OperatorQueueView({ pendingItems, grantedItems, onGrant, onDeny, onRevoke }: Props) {
  const [searchText, setSearchText] = useState('');
  const [tab, setTab] = useState<'pending' | 'granted'>('pending');

  const matches = (record: PendingItemRecord) => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      record.ticket.ticketNumber.toLowerCase().includes(query) ||
      record.ticket.createdBy.toLowerCase().includes(query) ||
      record.item.folderPath.toLowerCase().includes(query) ||
      record.item.reasonForAccess.toLowerCase().includes(query) ||
      record.item.accessType.toLowerCase().includes(query)
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} className="gradient-header" style={{ margin: 0 }}>
            Operator Fulfillment Console
          </Title>
          <Text type="secondary">Execute folder sharing commands in Active Directory, grant permissions, and revoke access when required.</Text>
        </div>
        <Input.Search placeholder="Search operator tasks by ticket, user, or path..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 320 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={tab}
          onChange={val => setTab(val as 'pending' | 'granted')}
          size="large"
          options={[
            {
              label: (
                <Space>
                  <ToolOutlined />
                  <span>Pending Tasks</span>
                  <Tag color="orange" style={{ marginLeft: 4 }}>{pendingItems.length}</Tag>
                </Space>
              ),
              value: 'pending'
            },
            {
              label: (
                <Space>
                  <CheckCircleOutlined />
                  <span>Active Granted Access</span>
                  <Tag color="green" style={{ marginLeft: 4 }}>{grantedItems.length}</Tag>
                </Space>
              ),
              value: 'granted'
            }
          ]}
        />
      </div>

      {tab === 'pending' ? (
        <Card className="premium-card">
          <Table
            dataSource={pendingItems.filter(matches)}
            rowKey={record => record.item.id.toString()}
            columns={[
              { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber', width: 140, render: (t: string) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
              { title: 'User', dataIndex: ['ticket', 'createdBy'], key: 'createdBy', width: 150 },
              { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
              { title: 'Requested Access', dataIndex: ['item', 'accessType'], key: 'accessType', width: 130, render: (text: string) => <Tag color="blue">{text}</Tag> },
              {
                title: 'Confirmed Access',
                dataIndex: ['item', 'confirmAccessType'],
                key: 'confirmAccessType',
                width: 140,
                render: (text: string, record) => <Tag color="purple" style={{ fontWeight: 600 }}>{text || record.item.accessType}</Tag>
              },
              { title: 'Reason', dataIndex: ['item', 'reasonForAccess'], key: 'reasonForAccess' },
              {
                title: 'Actions',
                key: 'actions',
                width: 230,
                render: (_: any, record: PendingItemRecord) => (
                  <Space>
                    <Button type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => onGrant(record)}>
                      Grant Access
                    </Button>
                    <Button danger onClick={() => onDeny(record)}>
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
            dataSource={grantedItems.filter(matches)}
            rowKey={record => record.item.id.toString()}
            columns={[
              { title: 'Ticket #', dataIndex: ['ticket', 'ticketNumber'], key: 'ticketNumber', width: 140, render: (t: string) => <strong style={{ color: '#2563eb' }}>{t}</strong> },
              { title: 'User', dataIndex: ['ticket', 'createdBy'], key: 'createdBy', width: 150 },
              { title: 'Folder Path', dataIndex: ['item', 'folderPath'], key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
              {
                title: 'Confirmed Access',
                dataIndex: ['item', 'confirmAccessType'],
                key: 'confirmAccessType',
                width: 140,
                render: (text: string, record) => <Tag color="purple" style={{ fontWeight: 600 }}>{text || record.item.accessType}</Tag>
              },
              { title: 'Granted On', dataIndex: ['item', 'grantedAt'], key: 'grantedAt', width: 170, render: (d: string) => (d ? new Date(d).toLocaleString() : '-') },
              { title: 'Expires On', dataIndex: ['item', 'expiresAt'], key: 'expiresAt', width: 130, render: (d: string) => (d ? new Date(d).toLocaleDateString() : '-') },
              {
                title: 'Action',
                key: 'action',
                width: 160,
                render: (_: any, record: PendingItemRecord) => (
                  <Button danger type="primary" ghost icon={<StopOutlined />} onClick={() => onRevoke(record)}>
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
  );
}
```

---

## `components/views/AdminUsersView.tsx`

```tsx
import { Card, Empty, Input, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import type { UserDetailsDto } from '../../types';
import { Button } from 'antd';

const { Title, Text } = Typography;

interface Props {
  users: UserDetailsDto[];
  onEditUser: (user: UserDetailsDto) => void;
}

export default function AdminUsersView({ users, onEditUser }: Props) {
  const [searchText, setSearchText] = useState('');

  const filtered = users.filter(u => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      u.userName.toLowerCase().includes(query) ||
      u.empId.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.location && u.location.toLowerCase().includes(query)) ||
      u.roles.some(r => r.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} className="gradient-header" style={{ margin: 0 }}>
            Manage User Roles & Location
          </Title>
          <Text type="secondary">Configure corporate permissions, offices, and HOD statuses for portal accounts.</Text>
        </div>
        <Input.Search placeholder="Search users by name, emp ID..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 320 }} />
      </div>

      <Card className="premium-card">
        <Table
          dataSource={filtered}
          rowKey="userId"
          columns={[
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
                  {roles.map(r => (
                    <Tag color="blue" key={r}>{r}</Tag>
                  ))}
                </Space>
              )
            },
            {
              title: 'Action',
              key: 'action',
              render: (_: any, record: UserDetailsDto) => (
                <Button type="link" onClick={() => onEditUser(record)}>
                  Edit Roles/Loc
                </Button>
              )
            }
          ]}
          locale={{ emptyText: <Empty description="No users found" /> }}
        />
      </Card>
    </div>
  );
}
```

---

## `components/views/AdminMappingsView.tsx`

```tsx
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { folderMappingApi } from '../../api/folderMappingApi';
import type { FolderMapping } from '../../types';

const { Title, Text } = Typography;

interface Props {
  folderMappings: FolderMapping[];
  onCreate: () => void;
  onEdit: (mapping: FolderMapping) => void;
  onDeleted: () => void;
}

export default function AdminMappingsView({ folderMappings, onCreate, onEdit, onDeleted }: Props) {
  const [searchText, setSearchText] = useState('');

  const filtered = folderMappings.filter(m => {
    if (!searchText.trim()) return true;
    const query = searchText.toLowerCase();
    return (
      m.folderPath.toLowerCase().includes(query) ||
      m.primaryFolderOwner.toLowerCase().includes(query) ||
      (m.secondaryFolderOwner && m.secondaryFolderOwner.toLowerCase().includes(query))
    );
  });

  const handleDelete = (record: FolderMapping) => {
    Modal.confirm({
      title: 'Delete Mapping',
      content: `Are you sure you want to delete folder mapping for: ${record.folderPath}?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        if (record.id) {
          await folderMappingApi.deleteFolderMapping(record.id);
          Modal.destroyAll();
          onDeleted();
        }
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} className="gradient-header" style={{ margin: 0 }}>
            Folder Owner Mappings
          </Title>
          <Text type="secondary">Map physical shared network folders to primary/secondary HODs for approval checks.</Text>
        </div>
        <Space size="middle" wrap>
          <Input.Search placeholder="Search folder mappings..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Create Mapping
          </Button>
        </Space>
      </div>

      <Card className="premium-card">
        <Table
          dataSource={filtered}
          rowKey="id"
          columns={[
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: 'Folder Path', dataIndex: 'folderPath', key: 'folderPath', render: (text: string) => <code>{text}</code> },
            { title: 'Primary Owner', dataIndex: 'primaryFolderOwner', key: 'primaryFolderOwner' },
            { title: 'Secondary Owner', dataIndex: 'secondaryFolderOwner', key: 'secondaryFolderOwner', render: (text: string) => text || '-' },
            {
              title: 'Status',
              dataIndex: 'isActive',
              key: 'isActive',
              render: (active: number) => (active === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>)
            },
            {
              title: 'Action',
              key: 'action',
              render: (_: any, record: FolderMapping) => (
                <Space>
                  <Button type="link" onClick={() => onEdit(record)}>
                    Edit
                  </Button>
                  <Button type="link" danger onClick={() => handleDelete(record)}>
                    Delete
                  </Button>
                </Space>
              )
            }
          ]}
          locale={{ emptyText: <Empty description="No folder owner mappings configured" /> }}
        />
      </Card>
    </div>
  );
}
```

---

## `components/modals/FolderItemFieldList.tsx`

Uses the new `FolderPathSelector` in place of the old `TreeSelect`.

```tsx
import { DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import FolderPathSelector from '../FolderPathSelector';
import type { ParsedFolderPathDto } from '../../types';

const { Text } = Typography;
const { Option } = Select;

interface Props {
  folderPaths: ParsedFolderPathDto[];
}

export default function FolderItemFieldList({ folderPaths }: Props) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  return (
    <Form.List name="items" initialValue={[{ folderPath: undefined, accessType: 'ReadOnly', reasonForAccess: '' }]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => {
            const isExpanded = expandedItems[key] ?? true;
            return (
              <div key={key} style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isExpanded ? 16 : 0 }}
                  onClick={() => setExpandedItems(prev => ({ ...prev, [key]: !isExpanded }))}
                >
                  <Text strong>Folder Item {name + 1}</Text>
                  <Space>
                    <Text type="secondary">{isExpanded ? 'Collapse' : 'Expand'}</Text>
                    {isExpanded ? <UpOutlined /> : <DownOutlined />}
                  </Space>
                </div>

                {isExpanded && (
                  <>
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
                            <Option value="NotApplicable">Not Applicable</Option>
                            <Option value="ReadOnly">Read Only</Option>
                            <Option value="ReadAndWrite">Read and Write</Option>
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
                      <Button type="link" danger onClick={() => remove(name)} style={{ padding: 0, marginTop: 8 }}>
                        Remove Item
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              Add Another Folder
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}
```

---

## `components/modals/RequestFormModal.tsx`

```tsx
import { Button, Card, Checkbox, Col, Divider, Form, Modal, Row, Select, Space, Steps, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { TERMS } from '../../constants/terms';
import type { ParsedFolderPathDto, TicketDto, UserDetailsDto } from '../../types';
import FolderItemFieldList from './FolderItemFieldList';

const { Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface Props {
  open: boolean;
  currentUser: UserDetailsDto;
  allHods: UserDetailsDto[];
  folderPaths: ParsedFolderPathDto[];
  editingTicket: TicketDto | null;
  isResubmitMode: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export default function RequestFormModal({ open, currentUser, allHods, folderPaths, editingTicket, isResubmitMode, onClose, onSubmit }: Props) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);

  const deptHods = allHods.filter(h => h.deptId === currentUser.deptId);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    form.resetFields();
    form.setFieldsValue({
      items: editingTicket?.items?.map(i => ({
        folderPath: i.folderPath,
        accessType: i.accessType,
        reasonForAccess: i.reasonForAccess
      })) || [{ folderPath: undefined, accessType: 'ReadOnly', reasonForAccess: '' }],
      agreement: false,
      hodUserId: deptHods[0]?.userId
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingTicket]);

  const formValues = Form.useWatch([], form);
  const itemsList = formValues?.items || [];
  const isStep1NextDisabled =
    !formValues?.hodUserId ||
    itemsList.length === 0 ||
    itemsList.some((item: any) => !item || !item.folderPath || !item.accessType || !item.reasonForAccess?.trim());
  const isStep2SubmitDisabled = !formValues?.agreement;

  const title = isResubmitMode ? 'Resubmit Access Request' : editingTicket ? 'Edit Access Request' : 'Create New Folder Access Request';
  const submitLabel = isResubmitMode ? 'Resubmit Request' : editingTicket ? 'Update & Resubmit' : 'Submit Request';

  return (
    <Modal title={title} open={open} onCancel={onClose} footer={null} width={1000} centered destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Steps current={step - 1} size="small" style={{ marginBottom: 24 }}>
          <Step title="Request Details" />
          <Step title="Terms & Agreement" />
        </Steps>

        <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <Row gutter={24} align="middle" justify="space-between">
            <Col xs={24} sm={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>
                Requester User
              </Text>
              <Text strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: 2 }}>
                {currentUser.userName}
              </Text>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: '0.85rem' }}>ID: {currentUser.empId}</Text>
                <Text type="secondary" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>|</Text>
                <Text type="secondary" style={{ fontSize: '0.85rem' }}>{currentUser.email}</Text>
              </div>
            </Col>
            <Col xs={24} sm={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Form.Item name="hodUserId" label="Department HOD" rules={[{ required: true, message: 'Select the approving HOD' }]} style={{ marginBottom: 0 }}>
                <Select placeholder="Select HOD" style={{ width: '100%' }}>
                  {deptHods.map(hod => (
                    <Option key={hod.userId} value={hod.userId}>
                      {hod.userName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {step === 1 && (
          <>
            <Divider style={{ margin: '12px 0 20px 0' }}>Access Folder Items</Divider>
            <FolderItemFieldList folderPaths={folderPaths} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    await form.validateFields(['hodUserId', 'items']);
                    setStep(2);
                  } catch {
                    // validation errors shown by the form
                  }
                }}
                disabled={isStep1NextDisabled}
              >
                Next: Review Terms
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Card type="inner" style={{ marginBottom: 20, background: '#f8fafc', borderRadius: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Terms & Conditions</Text>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {TERMS.map((term, index) => (
                  <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, color: '#2563eb', marginTop: 2 }}>•</div>
                    <Text>{term}</Text>
                  </div>
                ))}
              </Space>
            </Card>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[{ validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms to submit request'))) }]}
              style={{ marginBottom: 24 }}
            >
              <Checkbox>
                I declare that the access requested above is required for my official tasks and I agree to comply with the company information security guidelines.
              </Checkbox>
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button type="primary" htmlType="submit" disabled={isStep2SubmitDisabled}>
                {submitLabel}
              </Button>
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
}
```

---

## `components/modals/UserEditModal.tsx`

```tsx
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import { useEffect } from 'react';
import type { UserDetailsDto } from '../../types';

const { Option } = Select;

interface Props {
  open: boolean;
  user: UserDetailsDto | null;
  onClose: () => void;
  onSubmit: (values: { roles: string[]; location: string }) => Promise<void>;
}

export default function UserEditModal({ open, user, onClose, onSubmit }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({ roles: user.roles, location: user.location });
    }
  }, [open, user, form]);

  return (
    <Modal title={`Edit Roles & Location for User: ${user?.userName}`} open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="Roles (Multiple)" name="roles" rules={[{ required: true, message: 'Select at least one role' }]}>
          <Select mode="multiple" placeholder="Select roles">
            <Option value="Admin">Admin</Option>
            <Option value="Hod">Hod</Option>
            <Option value="Operator">Operator</Option>
            <Option value="User">User</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Location Office" name="location">
          <Input placeholder="e.g. HO, Branch, Unit 1" />
        </Form.Item>

        <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save Changes</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

---

## `components/modals/FolderMappingModal.tsx`

```tsx
import { Button, Form, Modal, Select, Space } from 'antd';
import { useEffect, useMemo } from 'react';
import type { FolderMapping, ParsedFolderPathDto, UserDetailsDto } from '../../types';

const { Option } = Select;

interface Props {
  open: boolean;
  mapping: FolderMapping | null;
  allHods: UserDetailsDto[];
  folderPaths: ParsedFolderPathDto[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export default function FolderMappingModal({ open, mapping, allHods, folderPaths, onClose, onSubmit }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mapping) {
        form.setFieldsValue({
          folderPath: mapping.folderPath,
          primaryFolderOwner: mapping.primaryFolderOwner,
          secondaryFolderOwner: mapping.secondaryFolderOwner,
          isActive: mapping.isActive === 1
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mapping, form]);

  const pathOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    folderPaths.forEach(p => {
      const path = p.parentFolder ? (p.driveName.endsWith('\\') ? `${p.driveName}${p.parentFolder}` : `${p.driveName}\\${p.parentFolder}`) : p.driveName;
      map.set(path, { value: path, label: path });
    });
    return Array.from(map.values());
  }, [folderPaths]);

  return (
    <Modal title={mapping ? 'Edit Folder Mapping' : 'Create Folder Mapping'} open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="Folder Path" name="folderPath" rules={[{ required: true, message: 'Folder path is required' }]}>
          <Select showSearch placeholder="Select folder path" disabled={!!mapping} optionFilterProp="label" options={pathOptions} />
        </Form.Item>

        <Form.Item label="Primary HOD Owner" name="primaryFolderOwner" rules={[{ required: true, message: 'Primary owner is required' }]}>
          <Select placeholder="Select primary owner" showSearch optionFilterProp="children">
            {allHods.map(h => (
              <Option key={h.userId} value={h.userName}>
                {h.userName} (ID: {h.userId})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Secondary HOD Owner" name="secondaryFolderOwner">
          <Select placeholder="Select secondary owner (optional)" allowClear showSearch optionFilterProp="children">
            {allHods.map(h => (
              <Option key={h.userId} value={h.userName}>
                {h.userName} (ID: {h.userId})
              </Option>
            ))}
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
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save Mapping</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

---

## `components/modals/TicketDetailModal.tsx`

```tsx
import { StopOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Modal, Row, Space, Table, Tag, Typography } from 'antd';
import type { AccessItemDto, ApprovalLog, TicketDto, UserDetailsDto } from '../../types';
import { renderStatusTag } from '../../utils/statusTag';

const { Text } = Typography;

interface Props {
  open: boolean;
  ticket: TicketDto | null;
  currentUser: UserDetailsDto;
  approvalLogs: ApprovalLog[];
  onClose: () => void;
  onEdit: (t: TicketDto) => void;
  onResubmit: (t: TicketDto) => void;
  onViewLogs: (item: AccessItemDto) => void;
  onRevoke: (ticket: TicketDto, item: AccessItemDto) => void;
}

export default function TicketDetailModal({ open, ticket, currentUser, approvalLogs, onClose, onEdit, onResubmit, onViewLogs, onRevoke }: Props) {
  if (!ticket) return <Modal open={open} onCancel={onClose} footer={null} />;

  const isOwner = ticket.createdBy.toLowerCase() === currentUser.userName.toLowerCase();
  const isPending = ticket.items?.some(i => i.status === 'PENDING_DEPT_HOD' || i.status === 'PENDING_FOLDER_OWNER');
  const isRejectedOrExpired = ticket.items?.some(i => i.status.startsWith('REJECTED') || i.status === 'EXPIRED' || i.status.startsWith('REVOKED'));
  const isOperatorOrAdmin = currentUser.roles.some(r => r === 'Operator' || r === 'Admin');

  return (
    <Modal
      title={`Ticket Details: ${ticket.ticketNumber}`}
      open={open}
      onCancel={onClose}
      width={940}
      footer={[
        isOwner &&
          (isPending ? (
            <Button key="edit" type="primary" onClick={() => onEdit(ticket)}>
              Edit Request
            </Button>
          ) : isRejectedOrExpired ? (
            <Button key="resubmit" style={{ background: '#d97706', color: '#fff', borderColor: '#d97706' }} onClick={() => onResubmit(ticket)}>
              Resubmit Request
            </Button>
          ) : null),
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div className="info-banner-card">
        <Row gutter={[20, 10]} align="middle">
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Requester</Text>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{ticket.createdBy}</div>
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Request Host</Text>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb', marginTop: 2 }}>{ticket.reqTo}</div>
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Created Date</Text>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginTop: 2 }}>{new Date(ticket.createdOn).toLocaleString()}</div>
          </Col>
        </Row>
      </div>

      <Table
        dataSource={ticket.items}
        rowKey="id"
        size="middle"
        pagination={false}
        columns={[
          { title: 'Folder Path', dataIndex: 'folderPath', key: 'folderPath', render: (text: string) => <span className="folder-code-badge">{text}</span> },
          { title: 'Requested Access', dataIndex: 'accessType', key: 'accessType', width: 140, render: (text: string) => <Tag color="blue">{text}</Tag> },
          { title: 'Confirmed Access', dataIndex: 'confirmAccessType', key: 'confirmAccessType', width: 140, render: (cat: string) => (cat ? <Tag color="purple">{cat}</Tag> : <Text type="secondary">-</Text>) },
          { title: 'Reason', dataIndex: 'reasonForAccess', key: 'reasonForAccess', ellipsis: true },
          { title: 'Status', dataIndex: 'status', key: 'status', width: 180, render: (status: string) => renderStatusTag(status) },
          {
            title: 'Actions',
            key: 'actions',
            width: 190,
            render: (_: any, record: AccessItemDto) => {
              const isGranted = record.status === 'ACCESS_GRANTED';
              return (
                <Space>
                  <Button type="primary" ghost size="small" onClick={() => onViewLogs(record)}>
                    Audit Trail
                  </Button>
                  {isGranted && isOperatorOrAdmin && (
                    <Button danger size="small" icon={<StopOutlined />} onClick={() => onRevoke(ticket, record)}>
                      Revoke
                    </Button>
                  )}
                </Space>
              );
            }
          }
        ]}
      />

      {approvalLogs.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Divider>Approval Audit Trail & Comments</Divider>
          <Table
            dataSource={approvalLogs}
            rowKey="id"
            size="middle"
            pagination={false}
            columns={[
              { title: 'Date / Time', dataIndex: 'actionDate', key: 'actionDate', width: 170, render: d => new Date(d).toLocaleString() },
              { title: 'Role Stage', dataIndex: 'approverRole', key: 'approverRole', width: 140, render: r => <Tag color="cyan">{r}</Tag> },
              { title: 'Approver', dataIndex: 'approvedBy', key: 'approvedBy', width: 160, render: text => <strong>{text}</strong> },
              {
                title: 'Action',
                dataIndex: 'actionTaken',
                key: 'actionTaken',
                width: 120,
                render: act => (act === 'APPROVED' ? <Tag color="green">Approved</Tag> : act === 'RESUBMITTED' ? <Tag color="orange">Resubmitted</Tag> : <Tag color="red">Rejected</Tag>)
              },
              {
                title: 'Comments',
                dataIndex: 'comments',
                key: 'comments',
                render: (comm: string) => (comm ? <div className="comment-bubble">{comm}</div> : <Text type="secondary" italic>No comments</Text>)
              }
            ]}
          />
        </div>
      )}
    </Modal>
  );
}
```

---

## `components/modals/DecisionModal.tsx`

```tsx
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, FormInstance, Input, Modal, Row, Select, Space, Tag, Typography } from 'antd';
import type { DecisionModalState } from '../../types';

const { Text } = Typography;
const { Option } = Select;

interface Props {
  state: DecisionModalState;
  form: FormInstance;
  onClose: () => void;
  onSubmit: (values: { comments?: string; confirmAccessType?: string }) => Promise<void>;
}

export default function DecisionModal({ state, form, onClose, onSubmit }: Props) {
  if (!state.item || !state.ticket) {
    return <Modal open={state.isOpen} onCancel={onClose} footer={null} destroyOnClose />;
  }

  const roleLabel = state.role === 'OWNER' ? 'Folder Owner' : state.role === 'OPERATOR' ? 'Operator' : 'Dept HOD';

  return (
    <Modal
      title={
        <Space align="center">
          {state.isApproved ? (
            <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '1.2rem' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ef4444', fontSize: '1.2rem' }} />
          )}
          <span style={{ fontFamily: 'Outfit', fontWeight: 600 }}>
            {state.isApproved
              ? state.role === 'OPERATOR'
                ? 'Grant Access Fulfillment'
                : `Approve Access Request (${roleLabel})`
              : `Reject Access Request (${roleLabel})`}
          </span>
        </Space>
      }
      open={state.isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Ticket Number</Text>
            <div><strong style={{ color: '#2563eb' }}>{state.ticket.ticketNumber}</strong></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Requester</Text>
            <div><strong>{state.ticket.createdBy}</strong></div>
          </Col>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Folder Path</Text>
            <div><code>{state.item.folderPath}</code></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Requested Access Type</Text>
            <div><Tag color="blue">{state.item.accessType}</Tag></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Reason for Access</Text>
            <div><Text>{state.item.reasonForAccess}</Text></div>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {state.isApproved && state.role !== 'OPERATOR' && (
          <Form.Item
            name="confirmAccessType"
            label={<span style={{ fontWeight: 600 }}>Confirm Access Type <span style={{ color: '#ef4444' }}>*</span></span>}
            rules={[{ required: true, message: 'Please select/confirm the access type to be granted' }]}
            extra="Select or confirm the exact permission level to grant for this folder."
          >
            <Select placeholder="Select permission level" size="large">
              <Option value="NotApplicable">Not Applicable</Option>
              <Option value="ReadOnly">Read Only</Option>
              <Option value="ReadAndWrite">Read and Write</Option>
            </Select>
          </Form.Item>
        )}

        {state.isApproved && state.role === 'OPERATOR' && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>Approved Access Level to Provision: </Text>
            <Tag color="purple" style={{ fontSize: '0.9rem', fontWeight: 600, padding: '2px 8px' }}>
              {state.item.confirmAccessType || state.item.accessType}
            </Tag>
          </div>
        )}

        <Form.Item
          name="comments"
          label={<span style={{ fontWeight: 600 }}>{state.isApproved ? 'Comments / Notes (Optional)' : 'Rejection Reason / Comments *'}</span>}
          rules={[{ required: !state.isApproved, message: 'Please provide a comment explaining the reason for rejection.' }]}
          extra="These comments will be recorded in the audit log and visible in the portal and email."
        >
          <Input.TextArea
            rows={3}
            placeholder={state.isApproved ? 'Add any approval comments or instructions for the operator...' : 'Provide justification for rejecting this request...'}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0, marginTop: 24 }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              danger={!state.isApproved}
              style={state.isApproved ? { background: '#22c55e', borderColor: '#22c55e' } : undefined}
            >
              {state.isApproved ? (state.role === 'OPERATOR' ? 'Confirm Grant Access' : 'Confirm Approval') : 'Confirm Rejection'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

---

## `components/modals/RevokeModal.tsx`

```tsx
import { StopOutlined } from '@ant-design/icons';
import { Button, Col, Form, FormInstance, Input, Modal, Row, Space, Tag, Typography } from 'antd';
import type { RevokeModalState } from '../../types';

const { Text } = Typography;

interface Props {
  state: RevokeModalState;
  form: FormInstance;
  onClose: () => void;
  onSubmit: (values: { comments: string }) => Promise<void>;
}

export default function RevokeModal({ state, form, onClose, onSubmit }: Props) {
  if (!state.item || !state.ticket) {
    return <Modal open={state.isOpen} onCancel={onClose} footer={null} destroyOnClose />;
  }

  return (
    <Modal
      title={
        <Space align="center">
          <StopOutlined style={{ color: '#ef4444', fontSize: '1.25rem' }} />
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#b91c1c' }}>Revoke Granted Access</span>
        </Space>
      }
      open={state.isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 18 }}>
        <Text style={{ color: '#991b1b', fontSize: '0.85rem' }}>
          <strong>Warning:</strong> Revoking access will immediately change the status to <strong>ACCESS REVOKED</strong>, remove FSFA permissions, and send an email notification to the user with your comments.
        </Text>
      </div>

      <div className="info-banner-card" style={{ marginBottom: 18 }}>
        <Row gutter={[16, 12]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.78rem' }}>Ticket Number</Text>
            <div><strong style={{ color: '#2563eb' }}>{state.ticket.ticketNumber}</strong></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.78rem' }}>Requester User</Text>
            <div><strong>{state.ticket.createdBy}</strong></div>
          </Col>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: '0.78rem' }}>Folder Path</Text>
            <div><span className="folder-code-badge">{state.item.folderPath}</span></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.78rem' }}>Active Permission Level</Text>
            <div><Tag color="purple" style={{ fontWeight: 600 }}>{state.item.confirmAccessType || state.item.accessType}</Tag></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: '0.78rem' }}>Granted On</Text>
            <div><Text>{state.item.grantedAt ? new Date(state.item.grantedAt).toLocaleDateString() : 'Active'}</Text></div>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="comments"
          label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Reason for Revoking Access <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[{ required: true, message: 'Please provide a justification for revoking this folder access.' }]}
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
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" danger htmlType="submit" icon={<StopOutlined />}>
              Confirm & Revoke Access
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

---

## `App.tsx` — final orchestrator

```tsx
import { AuditOutlined, DashboardOutlined, DatabaseOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import { Layout, message, notification } from 'antd';
import { useState } from 'react';
import { folderMappingApi } from './api/folderMappingApi';
import { userApi } from './api/userApi';
import { workflowApi } from './api/workflowApi';
import AppHeader from './components/layout/AppHeader';
import NotificationsDrawer from './components/layout/NotificationsDrawer';
import DecisionModal from './components/modals/DecisionModal';
import FolderMappingModal from './components/modals/FolderMappingModal';
import RequestFormModal from './components/modals/RequestFormModal';
import RevokeModal from './components/modals/RevokeModal';
import TicketDetailModal from './components/modals/TicketDetailModal';
import UserEditModal from './components/modals/UserEditModal';
import AdminMappingsView from './components/views/AdminMappingsView';
import AdminUsersView from './components/views/AdminUsersView';
import HodQueueView from './components/views/HodQueueView';
import MyRequestsView from './components/views/MyRequestsView';
import OperatorQueueView from './components/views/OperatorQueueView';
import LoginPage from './components/LoginPage';
import { useAppData } from './hooks/useAppData';
import { useAuth } from './hooks/useAuth';
import { useDecisionModal } from './hooks/useDecisionModal';
import { useNotifications } from './hooks/useNotifications';
import { usePendingItems } from './hooks/usePendingItems';
import { useRevokeModal } from './hooks/useRevokeModal';
import { buildMailBody, sendMailLog } from './utils/mailBuilder';
import type { AccessItemDto, ApprovalLog, FolderMapping, TicketDto, UserDetailsDto } from './types';

const { Header, Content, Footer } = Layout;

export default function App() {
  const { currentUser, setCurrentUser, handleLogin, handleLogout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('admin-users');
  const [activeMenuKey, setActiveMenuKey] = useState<string>('admin-users');

  const { tickets, users, folderPaths, folderMappings, allHods, loadData } = useAppData(currentUser);
  const { notifications, unreadCount, isDrawerOpen, openDrawer, closeDrawer, pushNotification } = useNotifications();
  const { pendingHodItems, pendingOperatorItems, grantedOperatorItems } = usePendingItems(tickets, users, folderMappings, currentUser);

  // Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketDto | null>(null);
  const [isResubmitMode, setIsResubmitMode] = useState(false);

  // User / mapping modal state
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsDto | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FolderMapping | null>(null);

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
    reload: loadData
  });

  const revoke = useRevokeModal({
    currentUser,
    users,
    onSuccess: pushNotification,
    reload: loadData,
    onAfterRevoke: async (ticketId: number) => {
      const updated = await workflowApi.getAllTickets();
      const refreshed = updated.find(t => t.id === ticketId);
      if (refreshed) setSelectedTicket(refreshed);
    }
  });

  const goTo = (view: string) => {
    setCurrentView(view);
    setActiveMenuKey(view);
  };

  const onLoggedIn = (user: UserDetailsDto) => {
    if (user.roles.includes('Admin')) goTo('admin-users');
    else if (user.roles.includes('Operator')) goTo('operator-queue');
    else if (user.roles.includes('Hod')) goTo('hod-queue');
    else goTo('my-requests');
  };

  const getMenuItems = () => {
    if (!currentUser) return [];
    const items: any[] = [];

    if (currentUser.roles.includes('User') || currentUser.roles.includes('Hod') || currentUser.roles.includes('Operator')) {
      items.push({
        key: 'my-requests',
        icon: <DashboardOutlined />,
        label: currentUser.roles.includes('Operator') ? 'All Requests' : 'My Requests',
        onClick: () => goTo('my-requests')
      });
    }
    if (currentUser.roles.includes('Hod')) {
      items.push({ key: 'hod-queue', icon: <AuditOutlined />, label: 'HOD Approvals', onClick: () => goTo('hod-queue') });
    }
    if (currentUser.roles.includes('Operator')) {
      items.push({ key: 'operator-queue', icon: <ToolOutlined />, label: 'Fulfillment Console', onClick: () => goTo('operator-queue') });
    }
    if (currentUser.roles.includes('Admin')) {
      items.push(
        { key: 'admin-users', icon: <TeamOutlined />, label: 'Manage Users', onClick: () => goTo('admin-users') },
        { key: 'admin-mappings', icon: <DatabaseOutlined />, label: 'Folder Mappings', onClick: () => goTo('admin-mappings') }
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
      if (editingTicket && editingTicket.items && editingTicket.items.length > 0) {
        for (let i = 0; i < values.items.length; i++) {
          const formItem = values.items[i];
          const existingItem = editingTicket.items[i] || editingTicket.items[0];
          await workflowApi.resubmitItem(existingItem.id, formItem.folderPath, formItem.accessType, formItem.reasonForAccess, currentUser.userName);
        }

        const actionText = isResubmitMode ? 'resubmitted' : 'updated & resubmitted';
        const selectedHod = allHods.find(h => h.userId === values.hodUserId) ?? allHods.find(h => h.deptId === currentUser.deptId);

        await sendMailLog({
          mailProgram: 'ACCESS_REQUEST_RESUBMITTED',
          mailTo: selectedHod?.email || '',
          mailSubject: `Access request ${editingTicket.ticketNumber} resubmitted for HOD approval`,
          mailBody: buildMailBody({
            title: 'Access Request Resubmitted for HOD Approval',
            ticketNo: editingTicket.ticketNumber,
            requester: currentUser.userName,
            approver: selectedHod?.userName || 'System HOD',
            stage: 'PENDING_DEPT_HOD',
            action: 'RESUBMITTED',
            items: values.items
          })
        });

        notification.success({ message: `Request ${actionText.toUpperCase()}`, description: `Ticket ${editingTicket.ticketNumber} ${actionText} in-place successfully. Audit log created.`, placement: 'topRight' });
        pushNotification(`Ticket ${actionText.toUpperCase()}`, `Ticket ${editingTicket.ticketNumber} ${actionText} in-place. Sent to HOD.`);
      } else {
        const selectedHod = allHods.find(h => h.userId === values.hodUserId) ?? allHods.find(h => h.deptId === currentUser.deptId);
        const payload = {
          reqTo: selectedHod?.userName || 'System HOD',
          createdBy: currentUser.userName,
          items: values.items.map((item: any) => ({ folderPath: item.folderPath, accessType: item.accessType, reasonForAccess: item.reasonForAccess }))
        };

        const ticketNo = await workflowApi.createRequest(payload);

        await sendMailLog({
          mailProgram: 'ACCESS_REQUEST_CREATED',
          mailTo: selectedHod?.email || '',
          mailSubject: `Access request ${ticketNo} pending HOD approval`,
          mailBody: buildMailBody({
            title: 'New Access Request Pending HOD Approval',
            ticketNo,
            requester: currentUser.userName,
            approver: selectedHod?.userName || 'System HOD',
            stage: 'PENDING_DEPT_HOD',
            action: 'CREATED',
            items: payload.items
          })
        });

        notification.success({ message: 'Request CREATED', description: `Ticket ${ticketNo} created successfully. Sent to HOD for review.`, placement: 'topRight' });
        pushNotification('Ticket CREATED', `Ticket ${ticketNo} created successfully. Sent to HOD.`);
      }

      setIsRequestModalOpen(false);
      setEditingTicket(null);
      setIsResubmitMode(false);
      await loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit request');
    }
  };

  // ── User / mapping edits ────────────────────────────────────────
  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;
    try {
      const success = await userApi.updateUserRolesAndLocation(selectedUser.userId, values.roles, values.location);
      if (success) {
        message.success(`User ${selectedUser.userName} updated successfully.`);
        setIsUserEditModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to update user');
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
          isActive: values.isActive ? 1 : 0
        });
        message.success('Folder mapping updated successfully.');
      } else {
        await folderMappingApi.addFolderMapping({
          folderPath: values.folderPath,
          primaryFolderOwner: values.primaryFolderOwner,
          secondaryFolderOwner: values.secondaryFolderOwner || null,
          isActive: values.isActive ? 1 : 0
        });
        message.success('Folder mapping created successfully.');
      }
      setIsMappingModalOpen(false);
      await loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to save mapping');
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
    return <LoginPage onLogin={values => handleLogin(values, onLoggedIn)} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0 }}>
        <AppHeader
          currentUser={currentUser}
          activeMenuKey={activeMenuKey}
          menuItems={getMenuItems()}
          unreadCount={unreadCount}
          onOpenNotifications={openDrawer}
          onLogout={() => handleLogout(() => goTo('my-requests'))}
          onLogoClick={() => {
            if (currentUser.roles.includes('Admin')) goTo('admin-users');
            else if (currentUser.roles.includes('Operator')) goTo('operator-queue');
            else goTo('my-requests');
          }}
        />
      </Header>

      <Content style={{ padding: '24px 50px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {currentView === 'my-requests' && (
            <MyRequestsView
              currentUser={currentUser}
              tickets={tickets}
              users={users}
              folderMappings={folderMappings}
              onCreate={openCreateModal}
              onEdit={openEditModal}
              onResubmit={openResubmitModal}
              onViewDetails={t => {
                setSelectedTicket(t);
                setIsTicketDetailOpen(true);
              }}
            />
          )}

          {currentView === 'hod-queue' && (
            <HodQueueView
              items={pendingHodItems}
              onApprove={(record, role) => decision.openDecisionModal(record, role, true)}
              onReject={(record, role) => decision.openDecisionModal(record, role, false)}
            />
          )}

          {currentView === 'operator-queue' && (
            <OperatorQueueView
              pendingItems={pendingOperatorItems}
              grantedItems={grantedOperatorItems}
              onGrant={record => decision.openDecisionModal(record, 'OPERATOR', true)}
              onDeny={record => decision.openDecisionModal(record, 'OPERATOR', false)}
              onRevoke={record => revoke.openRevokeModal(record)}
            />
          )}

          {currentView === 'admin-users' && (
            <AdminUsersView
              users={users}
              onEditUser={u => {
                setSelectedUser(u);
                setIsUserEditModalOpen(true);
              }}
            />
          )}

          {currentView === 'admin-mappings' && (
            <AdminMappingsView
              folderMappings={folderMappings}
              onCreate={() => {
                setSelectedMapping(null);
                setIsMappingModalOpen(true);
              }}
              onEdit={m => {
                setSelectedMapping(m);
                setIsMappingModalOpen(true);
              }}
              onDeleted={loadData}
            />
          )}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', color: '#94a3b8', background: '#f8fafc', padding: 24 }}>
        AccessRequest Portal ©2026 Crafted for FSFA s
      </Footer>

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

      <UserEditModal open={isUserEditModalOpen} user={selectedUser} onClose={() => setIsUserEditModalOpen(false)} onSubmit={handleUpdateUser} />

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
        onEdit={t => {
          setIsTicketDetailOpen(false);
          openEditModal(t);
        }}
        onResubmit={t => {
          setIsTicketDetailOpen(false);
          openResubmitModal(t);
        }}
        onViewLogs={viewApprovalLogs}
        onRevoke={(ticket, item) => revoke.openRevokeModal({ ticket, item })}
      />

      <DecisionModal state={decision.state} form={decision.decisionForm} onClose={decision.closeDecisionModal} onSubmit={decision.handleConfirmDecision} />

      <RevokeModal state={revoke.state} form={revoke.revokeForm} onClose={revoke.closeRevokeModal} onSubmit={revoke.handleRevokeSubmit} />

      <NotificationsDrawer open={isDrawerOpen} onClose={closeDrawer} notifications={notifications} />
    </Layout>
  );
}
```

---

## Migration notes

1. **Old `FolderPathSelector.tsx` component and the `TreeSelect`-based
   `folderTreeData` logic are removed** — replaced by the cascading picker above
   plus `utils/folderPathTree.ts`. Your existing `FolderPathSelector.tsx` file
   import name is reused so no other references need to change.
2. `Form.Item name={[name, 'folderPath']}` now wraps `<FolderPathSelector />`
   instead of `<TreeSelect />`. Ant Design's `Form.Item` automatically wires
   `value`/`onChange` into any child that exposes those props, which
   `FolderPathSelector` does — no extra glue code needed.
3. Double-check your `accessType` enum values (`ReadOnly` / `ReadAndWrite` /
   `NotApplicable`) match what your backend expects — the original file mixed
   `'Read'` (default in `handleOpenCreateModal`) with `ReadOnly`/`ReadAndWrite`
   elsewhere; this refactor standardizes on `ReadOnly` as the default to match
   the dropdown options actually offered.
4. Wire up your real `LoginPage`, `api/*` modules, and CSS classes
   (`folder-code-badge`, `info-banner-card`, `comment-bubble`, `premium-card`,
   `gradient-header`, `top-navbar`) exactly as before — none of those changed.