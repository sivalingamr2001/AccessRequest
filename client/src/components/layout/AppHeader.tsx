import {
  BellOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Menu, Space, Typography } from "antd";
import type { UserDetailsDto } from "../../types";

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
  onLogoClick,
}: AppHeaderProps) {
  return (
    <div
      className="top-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div className="logo" onClick={onLogoClick}>
          <KeyOutlined /> AccessRequest
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[activeMenuKey]}
          items={menuItems}
          style={{
            border: "none",
            background: "transparent",
            width: 450,
            fontSize: "0.9rem",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={
              <BellOutlined style={{ fontSize: "1.25rem", color: "#475569" }} />
            }
            onClick={onOpenNotifications}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Badge>

        <Dropdown
          menu={{
            items: [
              {
                key: "profile",
                icon: <UserOutlined />,
                label: `${currentUser.userName} (${currentUser.roles.join(", ")})`,
              },
              { type: "divider" },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Logout",
                danger: true,
                onClick: onLogout,
              },
            ],
          }}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              style={{ backgroundColor: "#4f46e5" }}
              icon={<UserOutlined />}
            />
            <Text strong style={{ fontSize: "0.85rem" }}>
              {currentUser.userName}
            </Text>
          </Space>
        </Dropdown>
      </div>
    </div>
  );
}
