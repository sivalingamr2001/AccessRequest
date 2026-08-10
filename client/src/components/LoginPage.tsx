import {
  ArrowRightOutlined,
  KeyOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

interface LoginPageProps {
  onLogin: (values: any) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await onLogin(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "93vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Glow Decorations */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "40%",
          height: "40%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "50%",
          height: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
        }}
      />

      <Card
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          padding: "12px 8px",
        }}
      >
        {/* Header Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#ffffff",
              fontSize: "1.75rem",
              marginBottom: 12,
              boxShadow: "0 8px 16px rgba(79, 70, 229, 0.3)",
            }}
          >
            <KeyOutlined />
          </div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Access Request
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: "0.875rem", color: "#64748b" }}
          >
            FSFA Portal
          </Text>
        </div>

        {/* Form Controls */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label={
              <span style={{ fontWeight: 600, color: "#334155" }}>
                Username / Emp ID
              </span>
            }
            name="username"
            rules={[
              { required: true, message: "Please enter username or Emp ID" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
              placeholder="e.g. Sivalingam, 1409, System Admin"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontWeight: 600, color: "#334155" }}>
                Password / Key
              </span>
            }
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
              placeholder="e.g. 1409, admin123"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            style={{
              height: 44,
              borderRadius: 8,
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
            }}
          >
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
}
