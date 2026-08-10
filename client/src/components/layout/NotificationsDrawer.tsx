import { BellOutlined } from "@ant-design/icons";
import { Avatar, Drawer, Empty, List } from "antd";
import type { NotificationItem } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export default function NotificationsDrawer({
  open,
  onClose,
  notifications,
}: Props) {
  return (
    <Drawer
      title={
        <span style={{ fontFamily: "Outfit", fontWeight: 700 }}>
          Notifications Center
        </span>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={360}
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{ borderBottom: "1px solid #f1f5f9", padding: "12px 0" }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{ backgroundColor: item.read ? "#cbd5e1" : "#4f46e5" }}
                  icon={<BellOutlined />}
                />
              }
              title={<strong>{item.title}</strong>}
              description={
                <div>
                  <div style={{ color: "#475569", fontSize: "0.85rem" }}>
                    {item.description}
                  </div>
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      marginTop: 4,
                    }}
                  >
                    {item.time}
                  </div>
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
