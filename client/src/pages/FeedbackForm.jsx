import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/feedback", {
        name,
        feedback,
      });
      // Backend sends: { message, data: {...}, score }
      setResult(res.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: "50px auto", padding: "20px" }}>
      <Title level={3} style={{ textAlign: "center" }}>
        AI Feedback Dashboard
      </Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Your Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item label="Your Feedback" required>
          <Input.TextArea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Submit
        </Button>
      </Form>

      {result && (
        <Card style={{ marginTop: 20, background: "#f6ffed" }}>
          <Paragraph>
            <b>Sentiment:</b> {result.data?.sentiment || "N/A"}
          </Paragraph>
          {result.score !== undefined && (
            <Paragraph>
              <b>Confidence Score:</b>{" "}
              {(result.score * 100).toFixed(2)}%
            </Paragraph>
          )}
        </Card>
      )}
    </Card>
  );
};

export default FeedbackForm;
