import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

export const renderStatusTag = (status: string) => {
  switch (status) {
    case "PENDING_DEPT_HOD":
      return (
        <Tag color="blue" icon={<ExclamationCircleOutlined />}>
          PENDING HOD
        </Tag>
      );
    case "PENDING_FOLDER_OWNER":
      return (
        <Tag color="purple" icon={<ExclamationCircleOutlined />}>
          PENDING OWNER
        </Tag>
      );
    case "PENDING_OPERATOR":
      return (
        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
          PENDING OPERATOR
        </Tag>
      );
    case "ACCESS_GRANTED":
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          ACCESS GRANTED
        </Tag>
      );
    case "ACCESS_EXPIRED":
      return <Tag color="default">EXPIRED</Tag>;
    case "REJECTED_BY_DEPT_HOD":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          REJECTED BY HOD
        </Tag>
      );
    case "REJECTED_BY_FOLDER_OWNER":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          REJECTED BY OWNER
        </Tag>
      );
    case "REJECTED_BY_OPERATOR":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          REJECTED BY OPERATOR
        </Tag>
      );
    case "ACCESS_REVOKED":
    case "REVOKED_BY_OPERATOR":
      return (
        <Tag color="volcano" icon={<CloseCircleOutlined />}>
          ACCESS REVOKED
        </Tag>
      );
    default:
      return <Tag color="default">{status}</Tag>;
  }
};
