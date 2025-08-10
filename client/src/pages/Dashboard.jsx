import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  Menu,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Spin,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  DashboardOutlined,
  FileTextOutlined,
  ReloadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const COLORS = ["#52c41a", "#faad14", "#f5222d"]; // positive, neutral, negative

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0 });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/feedback"),
        axios.get("http://localhost:5000/api/feedback/stats"),
      ]);

      const list = Array.isArray(listRes.data) ? listRes.data : [];
      setFeedbackList(
        list.map((f) => ({
          key: f._id,
          name: f.name,
          feedback: f.feedback,
          sentiment: (f.sentiment || "neutral").toLowerCase(),
          createdAt: f.createdAt,
        }))
      );

      // statsRes expected: [{ _id: 'positive', count: 3 }, ...]
      const rawStats = Array.isArray(statsRes.data) ? statsRes.data : [];
      const mapped = { positive: 0, neutral: 0, negative: 0 };
      rawStats.forEach((item) => {
        const id = (item._id || "").toString().toLowerCase();
        if (id.includes("pos")) mapped.positive = item.count;
        else if (id.includes("neg")) mapped.negative = item.count;
        else mapped.neutral = item.count;
      });
      setStats(mapped);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // optional: poll every 10s
    const t = setInterval(fetchAll, 10000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const total = stats.positive + stats.neutral + stats.negative;

  const pieData = [
    { name: "Positive", value: stats.positive },
    { name: "Neutral", value: stats.neutral },
    { name: "Negative", value: stats.negative },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Feedback",
      dataIndex: "feedback",
      key: "feedback",
      render: (text) => <div style={{ maxWidth: 500, whiteSpace: "pre-wrap" }}>{text}</div>,
    },
    {
      title: "Sentiment",
      dataIndex: "sentiment",
      key: "sentiment",
      width: 120,
      render: (s) => {
        if (!s) return <Tag>neutral</Tag>;
        const key = s.toLowerCase();
        if (key === "positive") return <Tag color="success">Positive</Tag>;
        if (key === "negative") return <Tag color="error">Negative</Tag>;
        return <Tag color="warning">Neutral</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (d) => new Date(d).toLocaleString(),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(c) => setCollapsed(c)}>
        <div style={{ height: 48, margin: 16, color: "#fff", fontWeight: 700 }}>AI Feedback</div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<FileTextOutlined />}>Submissions</Menu.Item>
          <Menu.Item key="3" icon={<PieChartOutlined />}>Analytics</Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>AI-Powered Feedback Dashboard</div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchAll}>Refresh</Button>
          </Space>
        </Header>

        <Content style={{ margin: 16 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic title="Total Feedback" value={total} />
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic title="Positive" value={stats.positive} />
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic title="Negative" value={stats.negative} />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12} style={{ height: 360 }}>
                  <Card title="Sentiment Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                <Col xs={24} lg={12} style={{ height: 360 }}>
                  <Card title="Recent Submissions">
                    <Table columns={columns} dataSource={feedbackList} pagination={{ pageSize: 5 }} />
                  </Card>
                </Col>
              </Row>

              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card title="All Feedback (raw)">
                    <pre style={{ maxHeight: 300, overflow: "auto" }}>{JSON.stringify(feedbackList, null, 2)}</pre>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
