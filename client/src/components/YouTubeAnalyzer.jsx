import React, { useState } from "react";
import { Card, Input, Button, message, Progress } from "antd";
import axios from "axios";

const { TextArea } = Input;

export default function YouTubeAnalyzer() {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyze = async () => {
    if (!url.trim()) { message.warning("Enter YouTube link or ID"); return; }
    try {
      setRunning(true); setProgress(5);
      // Start analyze request (it will fetch and process; could be long)
      const resp = await axios.post("http://localhost:5000/api/youtube/analyze", { urlOrId: url }, { timeout: 10 * 60 * 1000 });
      setProgress(100);
      message.success(`Analyzed ${resp.data.count} comments`);
    } catch (err) {
      console.error(err);
      message.error("Analysis failed");
    } finally {
      setRunning(false);
      setTimeout(()=>setProgress(0), 1000);
    }
  };

  return (
    <Card title="YouTube Video Sentiment">
      <TextArea value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Paste YouTube link or ID" rows={2} />
      <div style={{ marginTop: 12 }}>
        <Button type="primary" onClick={analyze} loading={running}>Analyze Comments</Button>
        <Button style={{ marginLeft: 8 }} onClick={() => setUrl("")} disabled={running}>Clear</Button>
      </div>
      {progress>0 && <div style={{ marginTop: 12 }}><Progress percent={progress} /></div>}
    </Card>
  );
}
