import { Card, Empty, Table } from "antd";
import type { TablePaginationConfig } from "antd";
import { useCallback, useMemo, useState } from "react";
import { DynamicGridToolbar } from "./DynamicGridToolbar";
import type { DynamicGridProps } from "./types";

// Helper to extract nested values safely
function getNestedValue(obj: any, path: any): any {
  if (obj == null) return undefined;
  if (Array.isArray(path)) {
    return path.reduce((prev, curr) => (prev != null ? prev[curr] : undefined), obj);
  }
  if (typeof path === "string" && path.includes(".")) {
    return path.split(".").reduce((prev, curr) => (prev != null ? prev[curr] : undefined), obj);
  }
  return obj[path];
}

// Deep search across object values
function deepSearchMatch(obj: any, query: string): boolean {
  if (obj == null) return false;
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    return String(obj).toLowerCase().includes(query);
  }
  if (Array.isArray(obj)) {
    return obj.some((item) => deepSearchMatch(item, query));
  }
  if (typeof obj === "object") {
    return Object.values(obj).some((val) => deepSearchMatch(val, query));
  }
  return false;
}

export function DynamicGrid<T extends object>({
  dataSource = [],
  columns,
  rowKey,
  loading = false,
  title,
  subTitle,
  headerActions,
  searchable = true,
  searchPlaceholder = "Search...",
  searchText: controlledSearchText,
  onSearchChange: controlledOnSearchChange,
  customFilter,
  showRefresh = false,
  onRefresh,
  toolbarExtra,
  cardWrapper = true,
  cardClassName = "premium-card",
  cardStyle,
  emptyText,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} entries`,
  },
  scroll,
  size = "middle",
  ...tableProps
}: DynamicGridProps<T>) {
  // Search state
  const [internalSearch, setInternalSearch] = useState("");
  const isControlledSearch = controlledSearchText !== undefined;
  const currentSearch = isControlledSearch ? controlledSearchText : internalSearch;

  const handleSearchChange = useCallback(
    (val: string) => {
      if (controlledOnSearchChange) {
        controlledOnSearchChange(val);
      }
      if (!isControlledSearch) {
        setInternalSearch(val);
      }
    },
    [controlledOnSearchChange, isControlledSearch]
  );

  // Active columns (excluding hidden ones)
  const activeColumns = useMemo(() => {
    return columns.filter((col) => !col.hideInTable);
  }, [columns]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!currentSearch || !currentSearch.trim()) {
      return dataSource;
    }
    const query = currentSearch.trim().toLowerCase();

    if (customFilter) {
      return dataSource.filter((item) => customFilter(item, query));
    }

    // Default intelligent filtering
    return dataSource.filter((item) => {
      for (const col of columns) {
        if (col.searchable === false) continue;
        if (col.dataIndex) {
          const val = getNestedValue(item, col.dataIndex);
          if (val != null && deepSearchMatch(val, query)) {
            return true;
          }
        }
      }
      return deepSearchMatch(item, query);
    });
  }, [dataSource, currentSearch, customFilter, columns]);

  const defaultEmptyText = typeof emptyText === "string" ? (
    <Empty description={emptyText} />
  ) : (
    emptyText || <Empty description="No data found" />
  );

  const tableComponent = (
    <Table<T>
      dataSource={filteredData}
      columns={activeColumns as any}
      rowKey={rowKey as any}
      loading={loading}
      size={size}
      pagination={pagination as TablePaginationConfig | false}
      scroll={scroll}
      style={{ width: "100%" }}
      locale={{ emptyText: defaultEmptyText }}
      {...tableProps}
    />
  );

  const toolbarElement = (
    <DynamicGridToolbar
      title={title}
      subTitle={subTitle}
      headerActions={headerActions}
      toolbarExtra={toolbarExtra}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      searchValue={currentSearch}
      onSearchChange={handleSearchChange}
      showRefresh={showRefresh}
      onRefresh={onRefresh}
    />
  );

  if (cardWrapper) {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        {toolbarElement}
        <Card className={cardClassName} style={cardStyle}>
          {tableComponent}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {toolbarElement}
      {tableComponent}
    </div>
  );
}
