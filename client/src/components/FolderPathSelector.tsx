import {
  CheckCircleFilled,
  EditOutlined,
  FolderOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Input, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import type { ParsedFolderPathDto } from "../types";

const { Text } = Typography;

type FolderNode = {
  driveName: string;
  name: string;
  children?: FolderNode[];
};

interface FolderPathSelectorProps {
  folderPaths: ParsedFolderPathDto[];
  value?: string;
  onChange?: (fullPath: string | undefined) => void;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function getOrCreateChild(parent: FolderNode, name: string): FolderNode {
  if (!parent.children) parent.children = [];
  let child = parent.children.find((node) => node.name === name);
  if (!child) {
    child = { driveName: parent.driveName, name, children: [] };
    parent.children.push(child);
  }
  return child;
}

function sortTree(node: FolderNode): FolderNode {
  if (!node.children) return node;
  node.children = node.children
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(sortTree);
  return node;
}

function buildFolderTree(paths: ParsedFolderPathDto[]): FolderNode[] {
  const driveMap = new Map<string, FolderNode>();

  for (const path of paths) {
    const drive = normalize(path.driveName);
    if (!drive) continue;

    let driveNode = driveMap.get(drive);
    if (!driveNode) {
      driveNode = { driveName: drive, name: "", children: [] };
      driveMap.set(drive, driveNode);
    }

    const parent = normalize(path.parentFolder);
    if (!parent) continue;

    let current = getOrCreateChild(driveNode, parent);
    for (const childName of [
      normalize(path.childDepth1),
      normalize(path.childDepth2),
      normalize(path.childDepth3),
      normalize(path.childDepth4),
    ]) {
      if (!childName) break;
      current = getOrCreateChild(current, childName);
    }
  }

  return Array.from(driveMap.values())
    .sort((a, b) => a.driveName.localeCompare(b.driveName))
    .map(sortTree);
}

function buildFullPath(stack: FolderNode[]): string {
  if (!stack.length) return "";
  const drive = stack[0].driveName;
  const segments = stack.slice(1).map((node) => node.name).filter(Boolean);
  return [drive, ...segments].join("\\");
}

export default function FolderPathSelector({
  folderPaths,
  value,
  onChange,
}: FolderPathSelectorProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stack, setStack] = useState<FolderNode[]>([]);
  const [search, setSearch] = useState("");

  const folderTree = useMemo(() => buildFolderTree(folderPaths), [folderPaths]);

  const currentFolders = useMemo(() => {
    if (!stack.length) return folderTree;
    return stack[stack.length - 1].children ?? [];
  }, [folderTree, stack]);

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return currentFolders;
    const term = search.toLowerCase();
    return currentFolders.filter((folder) =>
      (folder.name || folder.driveName).toLowerCase().includes(term),
    );
  }, [currentFolders, search]);

  const currentPath = useMemo(() => buildFullPath(stack), [stack]);

  const openDrawer = () => {
    setDrawerOpen(true);
    setSearch("");
    setStack([]);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSearch("");
    setStack([]);
  };

  const handleFolderClick = (folder: FolderNode) => {
    if (folder.children?.length) {
      setStack((prev) => [...prev, folder]);
      setSearch("");
      return;
    }

    const selected = buildFullPath([...stack, folder]);
    onChange?.(selected);
    closeDrawer();
  };

  const handleSelectCurrent = () => {
    if (!stack.length) return;
    const selected = currentPath;
    onChange?.(selected);
    closeDrawer();
  };

  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        {value ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
            }}
          >
            <Space align="start">
              <CheckCircleFilled
                style={{ color: "#22c55e", fontSize: "1.1rem", marginTop: 2 }}
              />
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "0.75rem", display: "block" }}
                >
                  Selected Folder Path
                </Text>
                <Text
                  strong
                  style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                >
                  {value}
                </Text>
              </div>
            </Space>
            <Button size="small" icon={<EditOutlined />} onClick={openDrawer}>
              Change
            </Button>
          </div>
        ) : (
          <Button type="default" onClick={openDrawer}>
            Select folder path
          </Button>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title="Select Folder Path"
        width={520}
        bodyStyle={{ padding: 16 }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {stack.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => setStack((prev) => prev.slice(0, -1))}
              >
                Back
              </Button>
              <Button type="primary" onClick={handleSelectCurrent}>
                Select This Folder
              </Button>
            </div>
          )}

          <Input
            allowClear
            placeholder="Search folders..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {stack.length > 0 && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: "#f5f7ff",
                border: "1px solid #dbeafe",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                wordBreak: "break-all",
              }}
            >
              {currentPath}
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            {filteredFolders.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                No folders found.
              </div>
            ) : (
              filteredFolders.map((folder) => (
                <Button
                  key={`${folder.driveName}-${folder.name}`}
                  type="default"
                  onClick={() => handleFolderClick(folder)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: 8,
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FolderOutlined style={{ fontSize: 16 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {folder.name || folder.driveName}
                    </span>
                  </span>
                  {folder.children?.length ? "→" : null}
                </Button>
              )))
            }
          </div>
        </Space>
      </Drawer>
    </>
  );
}
