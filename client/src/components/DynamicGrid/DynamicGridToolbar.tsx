import { ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Space, Tooltip, Typography } from "antd";
import React from "react";

const { Title, Text } = Typography;

interface DynamicGridToolbarProps {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  toolbarExtra?: React.ReactNode;

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;

  // Refresh
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export const DynamicGridToolbar: React.FC<DynamicGridToolbarProps> = ({
  title,
  subTitle,
  headerActions,
  toolbarExtra,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  showRefresh = false,
  onRefresh,
}) => {
  const hasHeader = Boolean(title || subTitle || headerActions);

  return (
    <div style={{ marginBottom: 16 }}>
      {hasHeader && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            {typeof title === "string" ? (
              <Title level={2} className="gradient-header" style={{ margin: 0 }}>
                {title}
              </Title>
            ) : (
              title
            )}
            {subTitle && (
              typeof subTitle === "string" ? (
                <Text type="secondary">{subTitle}</Text>
              ) : (
                subTitle
              )
            )}
          </div>
          {headerActions && <Space size="middle" wrap>{headerActions}</Space>}
        </div>
      )}

      {(searchable || toolbarExtra || (showRefresh && onRefresh)) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 240, maxWidth: 360 }}>
            {searchable && (
              <Input.Search
                placeholder={searchPlaceholder}
                allowClear
                size="middle"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: "100%" }}
              />
            )}
          </div>

          <Space size="small" wrap align="center">
            {toolbarExtra}

            {showRefresh && onRefresh && (
              <Tooltip title="Refresh Data">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  size="middle"
                />
              </Tooltip>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};
