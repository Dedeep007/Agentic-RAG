import React, { useState } from 'react';
import axios from 'axios';

export default function ChatUI() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [workerAgents, setWorkerAgents] = useState(1);
  const [decisionLoops, setDecisionLoops] = useState(1);
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const res = await axios.post('http://localhost:5000/api/chat', {
      api_key: apiKey,
      prompt,
      worker_agents: workerAgents,
      decision_loops: decisionLoops,
    });
    setMessages([...messages, { role: 'user', text: prompt }, { role: 'ai', text: res.data.response }]);
    setPrompt('');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
      />
      <div>
        <label>Worker Agents: {workerAgents}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={workerAgents}
          onChange={e => setWorkerAgents(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Decision Loops: {decisionLoops}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={decisionLoops}
          onChange={e => setDecisionLoops(Number(e.target.value))}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Type your message..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}><b>{msg.role}:</b> {msg.text}</div>
        ))}
      </div>
    </div>
  );
}
