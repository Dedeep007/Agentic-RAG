import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

export default function ChatUI() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [workerAgents, setWorkerAgents] = useState(1);
  const [decisionLoops, setDecisionLoops] = useState(1);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages([]); // Clear chat history on reload
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    console.log(`Worker Agents: ${workerAgents}, Decision Loops: ${decisionLoops}`);
    // Add any additional logic here if needed
  }, [workerAgents, decisionLoops]);

  const sendMessage = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API Key.');
      return;
    }
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setMessages([...messages, { role: 'user', text: prompt }]);
    try {
      const res = await axios.post(`${config.backendUrl}/api/chat`, {
        api_key: apiKey,
        prompt,
        worker_agents: workerAgents,
        decision_loops: decisionLoops,
      });
      setMessages(msgs => [
        ...msgs,
        {
          role: 'ai',
          text: res.data.response.llm_response || res.data.response,
          ragPrompt: res.data.response.rag_prompt,
        }
      ]);
    } catch (err) {
      setError('Too many workers, api tokens exhausted');
    } finally {
      setPrompt('');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`body { background: #18181b !important; }`}</style>
      <div style={{
        display: 'flex',
        maxWidth: 1400,
        margin: '2em auto',
        fontFamily: 'Inter, Segoe UI, sans-serif',
        background: '#18181b',
        color: '#f4f4f5',
        borderRadius: 16,
        boxShadow: '0 4px 32px #000a',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid #27272a',
        minHeight: 600
      }}>
        {/* Left: Chat UI */}
        <div style={{ flex: 2, minWidth: 0, borderRight: '1px solid #23232b', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
            color: '#fff',
            margin: 0,
            padding: '1.2em 0',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: 1.5
          }}>Agentic RAG Network</h2>
          <div style={{ padding: '1.5em', paddingBottom: 0 }}>
            <label style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 4, display: 'block' }}>Gemini API Key</label>
            <input
              type="password"
              placeholder="Enter Gemini API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: '100%',
                marginBottom: 16,
                background: '#27272a',
                color: '#f4f4f5',
                border: '1px solid #52525b',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 15,
                outline: 'none',
                transition: 'border 0.2s',
              }}
            />
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <label style={{ color: '#a1a1aa', fontSize: 14 }}>Worker Agents: {workerAgents}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={workerAgents}
                  onChange={e => setWorkerAgents(Number(e.target.value))}
                  style={{ verticalAlign: 'middle', marginLeft: 8 }}
                />
              </label>
              <label style={{ color: '#a1a1aa', fontSize: 14 }}>Decision Loops: {decisionLoops}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={decisionLoops}
                  onChange={e => setDecisionLoops(Number(e.target.value))}
                  style={{ verticalAlign: 'middle', marginLeft: 8 }}
                />
              </label>
            </div>
          </div>
          <div style={{
            border: '1px solid #27272a',
            borderRadius: 12,
            padding: 0,
            height: 350,
            overflowY: 'auto',
            background: '#23232b',
            margin: '0 1.5em 1em 1.5em',
            boxShadow: '0 2px 8px #0004',
            transition: 'background 0.3s',
            scrollbarColor: '#6366f1 #23232b',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: '1.2em',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                opacity: 1,
                animation: 'fadeIn 0.5s',
              }}>
                <div style={{
                  display: 'inline-block',
                  background: msg.role === 'user' ? 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' : '#18181b',
                  color: msg.role === 'user' ? '#fff' : '#f4f4f5',
                  borderRadius: 12,
                  padding: '12px 16px',
                  maxWidth: '80%',
                  boxShadow: msg.role === 'user' ? '0 2px 8px #6366f155' : '0 2px 8px #0002',
                  fontSize: 16,
                  transition: 'background 0.3s, color 0.3s',
                }}>
                  <b style={{ fontWeight: 600 }}>{msg.role === 'user' ? 'You' : 'RAG aided LLM'}:</b> {msg.text}
                  {msg.role === 'ai' && msg.ragPrompt && (
                    <div style={{ marginTop: 10, fontSize: '0.97em', color: '#38bdf8', transition: 'color 0.3s' }}>
                      <div><b>RAG Refined Prompt:</b> <pre style={{whiteSpace: 'pre-wrap', margin: 0, background: 'none', color: '#a5b4fc'}}>{msg.ragPrompt}</pre></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'left', margin: '1em 0 1em 0.5em', color: '#818cf8', fontStyle: 'italic', fontSize: 15, animation: 'fadeIn 0.7s' }}>
                <span className="thinking-dot">Thinking <span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span></span>
                <div style={{ color: '#38bdf8', marginTop: 4, fontSize: 14, fontWeight: 500, transition: 'color 0.3s' }}>
                  <span>RAG refinement in progress...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {error && <div style={{ color: '#f87171', margin: '0 1.5em 1em 1.5em', fontWeight: 500 }}>{error}</div>}
          <form style={{ display: 'flex', gap: 8, background: '#23232b', padding: '1em 1.5em 1.5em 1.5em', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
            onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <textarea
              rows={2}
              style={{
                flex: 1,
                resize: 'none',
                borderRadius: 10,
                border: '1px solid #27272a',
                padding: 12,
                background: '#18181b',
                color: '#f4f4f5',
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s',
                boxShadow: '0 1px 4px #0002',
              }}
              placeholder="Type your message..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                padding: '0 24px',
                borderRadius: 10,
                background: loading ? 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' : 'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                boxShadow: loading ? '0 2px 8px #6366f199' : '0 2px 8px #06b6d455',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s, box-shadow 0.3s, transform 0.1s',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>Sending...</span>
              ) : (
                <span>Send</span>
              )}
            </button>
          </form>
          {/* Footer */}
          <div style={{ textAlign: 'left', padding: '2em 1.5em', fontSize: 14, color: '#a1a1aa', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <p style={{ margin: 0 }}>
              <a href="https://github.com/Dedeep007/Agentic-RAG" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
                GitHub Repository
              </a>
            </p>
            <p style={{ margin: 0, textAlign: 'right' }}>
              Contributions are welcome! Feel free to fork the repository, submit pull requests, or open issues to help improve this project.
            </p>
          </div>
        </div>
        {/* Right: Flowchart/Diagram */}
        <div style={{ flex: 1.2, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: '2em 0' }}>
            <h3 style={{ color: '#a5b4fc', textAlign: 'center', fontWeight: 700, marginBottom: 24, fontSize: '1.8em' }}>Agentic RAG Flow</h3>
            <svg width="100%" height="700" viewBox="0 0 500 700" style={{ display: 'block', margin: '0 auto', background: 'none' }}>
              {/* User Prompt */}
              <defs>
                <marker id="arrowheadLightBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
                  <polygon points="0 0, 8 4, 0 8" fill="#3b82f6" />
                </marker>
                <marker id="arrowheadOrange" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
                  <polygon points="0 0, 8 4, 0 8" fill="#f97316" />
                </marker>
              </defs>
              {/* User Prompt Block */}
              <rect x="170" y="20" width="160" height="50" rx="18" fill="#3b82f6" />
              <text x="250" y="45" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">User Prompt</text>
              {/* User Icon */}
              <text x="250" y="65" fontSize="22" textAnchor="middle" fill="#fff">👤</text>
              {/* Adjusted Arrow Sizes and Label Positions */}
              <line x1="250" y1="80" x2="250" y2="110" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" />
              <text x="260" y="95" fill="#3b82f6" fontSize="12" fontWeight="bold">Delegate</text>
              {/* Master Agent Block */}
              <rect x="170" y="110" width="160" height="50" rx="18" fill="#f97316" />
              <text x="250" y="135" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">Master Agent</text>
              {/* Brain Icon */}
              <text x="250" y="155" fontSize="22" textAnchor="middle" fill="#fff">🧠</text>
              {/* Arrows to Workers */}
              <line x1="250" y1="160" x2="100" y2="220" stroke="#f97316" strokeWidth="2.5" markerEnd="url(#arrowheadOrange)" />
              <line x1="250" y1="160" x2="250" y2="220" stroke="#f97316" strokeWidth="2.5" markerEnd="url(#arrowheadOrange)" />
              <line x1="250" y1="160" x2="400" y2="220" stroke="#f97316" strokeWidth="2.5" markerEnd="url(#arrowheadOrange)" />
              <text x="80" y="190" fill="#f97316" fontSize="13" fontWeight="bold">Delegate</text>
              <text x="250" y="190" fill="#f97316" fontSize="13" fontWeight="bold">Delegate</text>
              <text x="420" y="190" fill="#f97316" fontSize="13" fontWeight="bold">Delegate</text>
              {/* Worker 1 */}
              <rect x="40" y="220" width="120" height="50" rx="18" fill="#3b82f6" />
              <text x="100" y="245" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">Worker 1</text>
              <text x="100" y="265" fontSize="22" textAnchor="middle" fill="#fff">⚙️</text>
              {/* Worker 2 */}
              <rect x="190" y="220" width="120" height="50" rx="18" fill="#3b82f6" />
              <text x="250" y="245" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">Worker 2</text>
              <text x="250" y="265" fontSize="22" textAnchor="middle" fill="#fff">⚙️</text>
              {/* Worker 3 */}
              <rect x="340" y="220" width="120" height="50" rx="18" fill="#3b82f6" />
              <text x="400" y="245" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">Worker 3</text>
              <text x="400" y="265" fontSize="22" textAnchor="middle" fill="#fff">⚙️</text>
              {/* Adjusted Arrow Sizes and Label Positions */}
              <line x1="100" y1="220" x2="170" y2="160" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" markerStart="url(#arrowheadLightBlue)" />
              <text x="80" y="180" fill="#3b82f6" fontSize="12" fontWeight="bold">Feedback</text>
              <line x1="250" y1="220" x2="250" y2="160" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" markerStart="url(#arrowheadLightBlue)" />
              <text x="260" y="180" fill="#3b82f6" fontSize="12" fontWeight="bold">Feedback</text>
              <line x1="400" y1="220" x2="330" y2="160" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" markerStart="url(#arrowheadLightBlue)" />
              <text x="420" y="180" fill="#3b82f6" fontSize="12" fontWeight="bold">Feedback</text>
              {/* Aggregate Arrows from Workers to Refined Prompt */}
              <line x1="100" y1="270" x2="250" y2="330" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" />
              <text x="120" y="300" fill="#3b82f6" fontSize="12" fontWeight="bold">Aggregate</text>
              <line x1="250" y1="270" x2="250" y2="330" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" />
              <text x="260" y="300" fill="#3b82f6" fontSize="12" fontWeight="bold">Aggregate</text>
              <line x1="400" y1="270" x2="250" y2="330" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowheadLightBlue)" />
              <text x="380" y="300" fill="#3b82f6" fontSize="12" fontWeight="bold">Aggregate</text>
              {/* Refined Prompt Block */}
              <rect x="170" y="330" width="160" height="50" rx="18" fill="#f97316" />
              <text x="250" y="355" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">Refined Prompt</text>
              <text x="250" y="375" fontSize="22" textAnchor="middle" fill="#fff">🪄</text>
              {/* Adjusted Arrow Sizes and Label Positions */}
              <line x1="250" y1="380" x2="250" y2="440" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrowheadOrange)" />
              <text x="260" y="410" fill="#f97316" fontSize="12" fontWeight="bold">To LLM</text>
              {/* LLM Block */}
              <rect x="170" y="440" width="160" height="50" rx="18" fill="#3b82f6" />
              <text x="250" y="465" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">LLM</text>
              <text x="250" y="485" fontSize="22" textAnchor="middle" fill="#fff">🤖</text>
            </svg>
            <ul style={{ color: '#a1a1aa', fontSize: 14, marginTop: 24, lineHeight: 1.7, paddingLeft: 18 }}>
              <li><b>1.</b> User enters a prompt.</li>
              <li><b>2.</b> Master Agent receives and distributes to Worker Retrieval Agents.</li>
              <li><b>3.</b> Workers fetch info from sources and return to Master Agent.</li>
              <li><b>4.</b> Master Agent refines the prompt and sends to LLM.</li>
              <li><b>5.</b> LLM answers using only the RAG context.</li>
              <li><b>6.</b> Feedback loop: Workers provide feedback to Master Agent for refinement.</li>
            </ul>
          </div>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          .thinking-dot .dot-1, .thinking-dot .dot-2, .thinking-dot .dot-3 {
            animation: blink 1.2s infinite;
          }
          .thinking-dot .dot-2 { animation-delay: 0.2s; }
          .thinking-dot .dot-3 { animation-delay: 0.4s; }
          @keyframes blink {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
          }
          ::-webkit-scrollbar {
            width: 8px;
            background: #23232b;
          }
          ::-webkit-scrollbar-thumb {
            background: #6366f1;
            border-radius: 8px;
          }
        `}</style>
      </div>
    </>
  );
}
