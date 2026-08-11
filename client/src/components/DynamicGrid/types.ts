import type { TableColumnType, TableProps } from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import type { ReactNode } from "react";

export interface DynamicColumnType<T = any> extends Omit<TableColumnType<T>, "dataIndex"> {
  dataIndex?: keyof T | string | (keyof T | string)[];
  searchable?: boolean;
  exportable?: boolean;
  exportValue?: (value: any, record: T) => string;
  hideInTable?: boolean;
}

export interface DynamicGridProps<T extends object = any>
  extends Omit<TableProps<T>, "columns" | "dataSource" | "title"> {
  dataSource?: T[];
  columns: DynamicColumnType<T>[];
  rowKey: keyof T | ((record: T) => string | number);
  loading?: boolean;

  // Header & Title
  title?: ReactNode;
  subTitle?: ReactNode;
  headerActions?: ReactNode;

  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  searchText?: string;
  onSearchChange?: (val: string) => void;
  customFilter?: (item: T, query: string) => boolean;

  // Toolbar Features
  showRefresh?: boolean;
  onRefresh?: () => void;
  toolbarExtra?: ReactNode;

  // Layout & Styling
  cardWrapper?: boolean;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
  emptyText?: ReactNode;
  size?: SizeType;
}
