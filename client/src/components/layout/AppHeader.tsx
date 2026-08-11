import {
  BellOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Space, Typography } from "antd";
import React from "react";
import type { UserDetailsDto } from "../../types";

const { Text } = Typography;

export interface MenuItemType {
  key: string;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface AppHeaderProps {
  currentUser: UserDetailsDto;
  activeMenuKey: string;
  menuItems: MenuItemType[];
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
        zIndex: 1000,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div className="logo" onClick={onLogoClick} style={{ cursor: "pointer" }}>
          <KeyOutlined /> AccessRequest
        </div>

        {/* Capsule Style Smooth Page Changer */}
        <nav
          className="capsule-nav-container"
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(241, 245, 249, 0.85)",
            padding: "3px 4px",
            borderRadius: 9999,
            border: "1px solid rgba(226, 232, 240, 0.8)",
            gap: 4,
          }}
        >
          {menuItems.map((item) => {
            const isActive = activeMenuKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`capsule-nav-item ${isActive ? "active" : ""}`}
                onClick={item.onClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.86rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#4f46e5" : "#64748b",
                  background: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(79, 70, 229, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)"
                    : "none",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  outline: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
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
