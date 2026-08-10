import { DownOutlined, PlusOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Space, Typography } from "antd";
import { useState } from "react";
import FolderPathSelector from "../FolderPathSelector";
import type { ParsedFolderPathDto } from "../../types";

const { Text } = Typography;
const { Option } = Select;

interface Props {
  folderPaths: ParsedFolderPathDto[];
}

export default function FolderItemFieldList({ folderPaths }: Props) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  return (
    <Form.List
      name="items"
      initialValue={[
        { folderPath: undefined, accessType: "ReadOnly", reasonForAccess: "" },
      ]}
    >
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => {
            const isExpanded = expandedItems[key] ?? true;
            return (
              <div
                key={key}
                style={{
                  background: "#f8fafc",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    marginBottom: isExpanded ? 16 : 0,
                  }}
                  onClick={() =>
                    setExpandedItems((prev) => ({
                      ...prev,
                      [key]: !isExpanded,
                    }))
                  }
                >
                  <Text strong>Folder Item {name + 1}</Text>
                  <Space>
                    <Text type="secondary">
                      {isExpanded ? "Collapse" : "Expand"}
                    </Text>
                    {isExpanded ? <UpOutlined /> : <DownOutlined />}
                  </Space>
                </div>

                {isExpanded && (
                  <>
                    <Form.Item
                      {...restField}
                      name={[name, "folderPath"]}
                      label="Folder Network Path"
                      rules={[
                        { required: true, message: "Missing folder path" },
                      ]}
                    >
                      <FolderPathSelector folderPaths={folderPaths} />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "accessType"]}
                          label="Access Permissions"
                          rules={[
                            { required: true, message: "Missing access type" },
                          ]}
                        >
                          <Select>
                            <Option value="NotApplicable">
                              Not Applicable
                            </Option>
                            <Option value="ReadOnly">Read Only</Option>
                            <Option value="ReadAndWrite">Read and Write</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, "reasonForAccess"]}
                          label="Justification Reason"
                          rules={[
                            {
                              required: true,
                              message: "Missing justification",
                            },
                          ]}
                        >
                          <Input placeholder="Describe why this folder access is required" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {fields.length > 1 && (
                      <Button
                        type="link"
                        danger
                        onClick={() => remove(name)}
                        style={{ padding: 0, marginTop: 8 }}
                      >
                        Remove Item
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              Add Another Folder
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}
