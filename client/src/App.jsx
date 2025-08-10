

// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import {
//   Layout,
//   Card,
//   Input,
//   Button,
//   Row,
//   Col,
//   Table,
//   Tag,
//   Space,
//   Select,
//   Typography,
//   message,
//   Spin,
// } from "antd";
// import { Bar } from "react-chartjs-2";
// import { ReloadOutlined, SendOutlined } from "@ant-design/icons";
// import moment from "moment";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const { Header, Content } = Layout;
// const { TextArea } = Input;
// const { Title: H2 } = Typography;
// const { Option } = Select;

// const SENTIMENT_COLORS = {
//   POSITIVE: "#52c41a",
//   NEGATIVE: "#f5222d",
//   NEUTRAL: "#faad14",
//   positive: "#52c41a",
//   negative: "#f5222d",
//   neutral: "#faad14",
// };

// export default function App() {
//   const [text, setText] = useState("");
//   const [loadingAnalyze, setLoadingAnalyze] = useState(false);
//   const [analyses, setAnalyses] = useState([]);
//   const [filter, setFilter] = useState("ALL");
//   const [loadingFetch, setLoadingFetch] = useState(false);

//   const fetchAnalyses = async () => {
//     try {
//       setLoadingFetch(true);
//       const res = await axios.get("http://localhost:5000/api/analyses");
//       setAnalyses(res.data || []);
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to fetch analyses");
//     } finally {
//       setLoadingFetch(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnalyses();
//   }, []);

//   const analyzeSentiment = async () => {
//     if (!text?.trim()) {
//       message.warning("Please enter some text first");
//       return;
//     }
//     try {
//       setLoadingAnalyze(true);
//       const res = await axios.post("http://localhost:5000/api/analyze", { text });
//       message.success(`Result: ${res.data.sentiment} (${(res.data.score * 100).toFixed(1)}%)`);
//       setText("");
//       // refresh list
//       await fetchAnalyses();
//     } catch (err) {
//       console.error(err);
//       message.error("Analysis failed");
//     } finally {
//       setLoadingAnalyze(false);
//     }
//   };

//   const filtered = useMemo(() => {
//     if (filter === "ALL") return analyses;
//     return analyses.filter((a) => {
//       const s = (a.sentiment || "").toString().toUpperCase();
//       return s.includes(filter);
//     });
//   }, [analyses, filter]);

//   const counts = useMemo(() => {
//     const c = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
//     analyses.forEach((a) => {
//       const s = (a.sentiment || "").toString().toUpperCase();
//       if (s.includes("POS")) c.POSITIVE++;
//       else if (s.includes("NEG")) c.NEGATIVE++;
//       else c.NEUTRAL++;
//     });
//     return c;
//   }, [analyses]);

//   const chartData = useMemo(() => {
//     return {
//       labels: ["Positive", "Neutral", "Negative"],
//       datasets: [
//         {
//           label: "Count",
//           data: [counts.POSITIVE, counts.NEUTRAL, counts.NEGATIVE],
//           backgroundColor: [
//             SENTIMENT_COLORS.POSITIVE,
//             SENTIMENT_COLORS.NEUTRAL,
//             SENTIMENT_COLORS.NEGATIVE,
//           ],
//         },
//       ],
//     };
//   }, [counts]);

//   const columns = [
//     {
//       title: "Text",
//       dataIndex: "postText",
//       key: "postText",
//       render: (t) => <div style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>{t}</div>,
//     },
//     {
//       title: "Sentiment",
//       dataIndex: "sentiment",
//       key: "sentiment",
//       width: 140,
//       render: (s) => {
//         const upper = (s || "NEUTRAL").toString().toUpperCase();
//         const color = SENTIMENT_COLORS[upper] || SENTIMENT_COLORS.NEUTRAL;
//         return <Tag color={color}>{upper}</Tag>;
//       },
//     },
//     {
//       title: "Score",
//       dataIndex: "score",
//       key: "score",
//       width: 120,
//       render: (sc) => (typeof sc === "number" ? (sc * 100).toFixed(1) + "%" : "—"),
//     },
//     {
//       title: "Date",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       width: 180,
//       render: (d) => moment(d).format("YYYY-MM-DD HH:mm"),
//     },
//   ];

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <Header style={{ background: "#001529", padding: "12px 20px" }}>
//         <H2 style={{ color: "#fff", margin: 0 }}>AI Sentiment Analyzer</H2>
//       </Header>

//       <Content style={{ padding: 20 }}>
//         <Row gutter={[16, 16]}>
//           <Col xs={24} lg={10}>
//             <Card title="Analyze Text" bordered>
//               <TextArea
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 rows={6}
//                 placeholder="Paste a social post, review or message..."
//               />
//               <Space style={{ marginTop: 12 }}>
//                 <Button
//                   type="primary"
//                   icon={<SendOutlined />}
//                   onClick={analyzeSentiment}
//                   loading={loadingAnalyze}
//                 >
//                   Analyze
//                 </Button>

//                 <Button onClick={() => { setText(""); }} disabled={!text}>
//                   Clear
//                 </Button>

//                 <Button
//                   icon={<ReloadOutlined />}
//                   onClick={fetchAnalyses}
//                   loading={loadingFetch}
//                 >
//                   Refresh
//                 </Button>
//               </Space>
//             </Card>

//             <Card style={{ marginTop: 16 }} title="Quick Stats">
//               <Row gutter={12}>
//                 <Col span={8}>
//                   <Card>
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontSize: 20, color: SENTIMENT_COLORS.POSITIVE }}>{counts.POSITIVE}</div>
//                       <div>Positive</div>
//                     </div>
//                   </Card>
//                 </Col>
//                 <Col span={8}>
//                   <Card>
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontSize: 20, color: SENTIMENT_COLORS.NEUTRAL }}>{counts.NEUTRAL}</div>
//                       <div>Neutral</div>
//                     </div>
//                   </Card>
//                 </Col>
//                 <Col span={8}>
//                   <Card>
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontSize: 20, color: SENTIMENT_COLORS.NEGATIVE }}>{counts.NEGATIVE}</div>
//                       <div>Negative</div>
//                     </div>
//                   </Card>
//                 </Col>
//               </Row>
//             </Card>
//           </Col>

//           <Col xs={24} lg={14}>
//             <Card title="Sentiment Trends">
//               <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, height: 200 }} />
//             </Card>

//             <Card style={{ marginTop: 16 }}>
//               <Space style={{ marginBottom: 12, width: "100%", justifyContent: "space-between" }}>
//                 <Select value={filter} onChange={(v) => setFilter(v)} style={{ width: 200 }}>
//                   <Option value="ALL">All</Option>
//                   <Option value="POS">Positive</Option>
//                   <Option value="NEG">Negative</Option>
//                   <Option value="NEU">Neutral</Option>
//                 </Select>
//                 <div>
//                   <Button onClick={() => { setFilter("ALL"); }}>Reset Filter</Button>
//                 </div>
//               </Space>

//               {loadingFetch ? (
//                 <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
//               ) : (
//                 <Table
//                   dataSource={filtered.map((r) => ({ ...r, key: r._id || r.createdAt }))}
//                   columns={columns}
//                   pagination={{ pageSize: 6 }}
//                 />
//               )}
//             </Card>
//           </Col>
//         </Row>
//       </Content>
//     </Layout>
//   );
// }

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Layout,
  Card,
  Input,
  Button,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Select,
  Typography,
  message,
  Spin,ConfigProvider,  Switch
} from "antd";
import { theme } from 'antd';
const { darkAlgorithm, defaultAlgorithm } = theme;
import { Bar } from "react-chartjs-2";
import { ReloadOutlined, SendOutlined, YoutubeOutlined ,BulbOutlined, BulbFilled} from "@ant-design/icons";
import moment from "moment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title: H2 } = Typography;
const { Option } = Select;

const SENTIMENT_COLORS = {
  POSITIVE: "#52c41a",
  NEGATIVE: "#f5222d",
  NEUTRAL: "#faad14",
  positive: "#52c41a",
  negative: "#f5222d",
  neutral: "#faad14",
};
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function App() {
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [redditUrl, setRedditUrl] = useState("");
  const [loadingReddit, setLoadingReddit] = useState(false);
    const [darkMode, setDarkMode] = useState(false);


  const fetchAnalyses = async () => {
    try {
      setLoadingFetch(true);
      const res = await axios.get(`${BACKEND_URL}/api/analyses`);
      setAnalyses(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch analyses");
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const rowSelection = {
  selectedRowKeys,
  onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
};
  const analyzeSentiment = async () => {
    if (!text?.trim()) {
      message.warning("Please enter some text first");
      return;
    }
    try {
      setLoadingAnalyze(true);
      const res = await axios.post(`${BACKEND_URL}/api/analyze`, { text });
      message.success(`Result: ${res.data.sentiment} (${(res.data.score * 100).toFixed(1)}%)`);
      setText("");
      await fetchAnalyses();
    } catch (err) {
      console.error(err);
      message.error("Analysis failed");
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const analyzeYoutubeComments = async () => {
    if (!youtubeUrl?.trim()) {
      message.warning("Please enter a YouTube video link");
      return;
    }
    try {
      setLoadingYoutube(true);
      const res = await axios.post(`${BACKEND_URL}/api/youtube-comments`, {
        url: youtubeUrl,
      });
      message.success(`Fetched & analyzed ${res.data.count} comments`);
      setYoutubeUrl("");
      await fetchAnalyses();
    } catch (err) {
      console.error(err);
      message.error("Failed to analyze YouTube comments");
    } finally {
      setLoadingYoutube(false);
    }
  };
  const analyzeRedditComments = async () => {
  if (!redditUrl?.trim()) {
    message.warning("Please enter a Reddit post URL");
    return;
  }
  try {
    setLoadingReddit(true);
    const res = await axios.post(`${BACKEND_URL}/api/reddit-comments`, {
      url: redditUrl,
    });
    message.success(`Fetched & analyzed ${res.data.count} Reddit comments`);
    setRedditUrl("");
    await fetchAnalyses();
  } catch (err) {
    console.error(err);
    message.error("Failed to analyze Reddit comments");
  } finally {
    setLoadingReddit(false);
  }
};
const handleDelete = async () => {
  if (selectedRowKeys.length === 0) {
    message.warning("Please select comments to delete");
    return;
  }
  try {
    await axios.delete(`${BACKEND_URL}/api/comments`, { data: { ids: selectedRowKeys } });
    message.success("Deleted selected comments");
    fetchAnalyses(); // reload updated list
    setSelectedRowKeys([]); // clear selection
  } catch (error) {
    console.error(error);
    message.error("Failed to delete comments");
  }
};


  const filtered = useMemo(() => {
    if (filter === "ALL") return analyses;
    return analyses.filter((a) => {
      const s = (a.sentiment || "").toString().toUpperCase();
      return s.includes(filter);
    });
  }, [analyses, filter]);

  const counts = useMemo(() => {
    const c = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
    analyses.forEach((a) => {
      const s = (a.sentiment || "").toString().toUpperCase();
      if (s.includes("POS")) c.POSITIVE++;
      else if (s.includes("NEG")) c.NEGATIVE++;
      else c.NEUTRAL++;
    });
    return c;
  }, [analyses]);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const chartData = useMemo(() => {
    return {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          label: "Count",
          data: [counts.POSITIVE, counts.NEUTRAL, counts.NEGATIVE],
          backgroundColor: [
            SENTIMENT_COLORS.POSITIVE,
            SENTIMENT_COLORS.NEUTRAL,
            SENTIMENT_COLORS.NEGATIVE,
          ],
        },
      ],
    };
  }, [counts]);

  const columns = [
    {
      title: "Text",
      dataIndex: "postText",
      key: "postText",
      render: (t) => <div style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>{t}</div>,
    },
    {
      title: "Sentiment",
      dataIndex: "sentiment",
      key: "sentiment",
      width: 140,
      render: (s) => {
        const upper = (s || "NEUTRAL").toString().toUpperCase();
        const color = SENTIMENT_COLORS[upper] || SENTIMENT_COLORS.NEUTRAL;
        return <Tag color={color}>{upper}</Tag>;
      },
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: 120,
      render: (sc) => (typeof sc === "number" ? (sc * 100).toFixed(1) + "%" : "—"),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (d) => moment(d).format("YYYY-MM-DD HH:mm"),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        // Ant Design v5 supports dynamic algorithm switching
            algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,

      }}
    >
    
    <Layout style={{ minHeight: "100vh" }}>
       <Header
          style={{
            background: darkMode ? "#001529" : "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <h2 style={{ color: darkMode ? "#fff" : "#000", margin: 0 }}>
            AI Sentiment Analyzer
          </h2>
           <Switch
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
            checked={darkMode}
            onChange={toggleDarkMode}
          />
      </Header>

      <Content style={{ padding: 20, background: darkMode ? "#141414" : "#fff" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card title="Analyze Text" style={{ padding: window.innerWidth < 768 ? 12 : 24 }}
>
              <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Paste a review or text..."
                style={{ width: '100%' }}

              />
              <Space style={{ marginTop: 12, width: '100%', flexWrap: 'wrap' }}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={analyzeSentiment}
                  loading={loadingAnalyze}
                  block={window.innerWidth < 768}
                  style={{ marginBottom: window.innerWidth < 768 ? 8 : 0 }}
                >
                  Analyze
                </Button>
                <Button onClick={() => setText("")} disabled={!text} block={window.innerWidth < 768}>
                  Clear
                </Button>
              </Space>
            </Card>

            <Card style={{ marginTop: 16 ,padding: window.innerWidth < 768 ? '10px' : '24px'}} title="Analyze YouTube Video Comments" >
              <Input
                placeholder="Paste YouTube video link..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <Button
                style={{ marginTop: 12 }}
                type="primary"
                icon={<YoutubeOutlined />}
                onClick={analyzeYoutubeComments}
                loading={loadingYoutube}
                block
              >
                Fetch & Analyze Comments
              </Button>
            </Card>
            <Card style={{ marginTop: 16 ,padding: window.innerWidth < 768 ? '10px' : '24px'}} title="Analyze Reddit Post Comments">
  <Input
    placeholder="Paste Reddit post URL..."
    value={redditUrl}
    onChange={(e) => setRedditUrl(e.target.value)}
  />
  <Button
    style={{ marginTop: 12 }}
    type="primary"
    onClick={analyzeRedditComments}
    loading={loadingReddit}
    block
  >
    Fetch & Analyze Reddit Comments
  </Button>
</Card>


            <Card style={{ marginTop: 16,padding: window.innerWidth < 768 ? '10px' : '24px' }} title="Quick Stats">
              <Row gutter={12}>
                <Col span={8}>
                  <Card>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, color: SENTIMENT_COLORS.POSITIVE }}>{counts.POSITIVE}</div>
                      <div>Positive</div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, color: SENTIMENT_COLORS.NEUTRAL }}>{counts.NEUTRAL}</div>
                      <div>Neutral</div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, color: SENTIMENT_COLORS.NEGATIVE }}>{counts.NEGATIVE}</div>
                      <div>Negative</div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card title="Sentiment Trends">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Card>

           <Card style={{ marginTop: 16 }}>
  <Space style={{ marginBottom: 12, width: "100%", justifyContent: "space-between" }}>
    <Select value={filter} onChange={(v) => setFilter(v)} style={{ width: 200 }}>
      <Option value="ALL">All</Option>
      <Option value="POS">Positive</Option>
      <Option value="NEG">Negative</Option>
      <Option value="NEU">Neutral</Option>
    </Select>

    <Space>
      <Button danger onClick={handleDelete} disabled={selectedRowKeys.length === 0}>
        Delete Selected
      </Button>
      <Button onClick={() => setSelectedRowKeys([])} disabled={selectedRowKeys.length === 0}>
        Clear Selection
      </Button>
      <Button onClick={() => setFilter("ALL")}>Reset Filter</Button>
    </Space>
  </Space>

  {loadingFetch ? (
    <div style={{ padding: 40, textAlign: "center" }}>
      <Spin />
    </div>
  ) : (
    <Table
      rowSelection={rowSelection}
      dataSource={filtered.map((r) => ({ ...r, key: r._id || r.createdAt }))}
      columns={columns}
      pagination={{ pageSize: 6 }}
    />
  )}
</Card>

          </Col>
        </Row>
      </Content>
    </Layout>
    </ConfigProvider>
  );
}
