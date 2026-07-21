'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HistoryItem {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('phytolit_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveToHistory = (newMessages: Message[]) => {
    if (newMessages.length === 0) return;
    const title = newMessages[0].content.slice(0, 35) + '...';
    const id = activeId || Date.now().toString();
    const newItem: HistoryItem = {
      id,
      title,
      messages: newMessages,
      timestamp: new Date().toLocaleDateString(),
    };

    const updated = [newItem, ...history.filter((h) => h.id !== id)];
    setHistory(updated);
    setActiveId(id);
    localStorage.setItem('phytolit_history', JSON.stringify(updated));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'No synthesis generated.',
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveToHistory(finalMessages);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `**Error:** ${err.message || 'Failed to connect to backend engine.'}`,
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveId(null);
  };

  const loadChat = (item: HistoryItem) => {
    setMessages(item.messages);
    setActiveId(item.id);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('phytolit_history', JSON.stringify(updated));
    if (activeId === id) {
      startNewChat();
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: 'PhytoLit_Synthesis_Report.pdf',
        image: { type: 'jpeg' as any, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as any },
      };
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const downloadBibTeX = () => {
    const bibtexData = `@article{phytolit2026synthesis,
  title={AI-Driven Phytopathological Synthesis and Integrated Management Report},
  author={Jamali, Adil},
  journal={PhytoLit AI Research Workspace},
  year={2026},
  note={Automated Pathogen Interaction & Biocontrol Analysis}
}`;
    const blob = new Blob([bibtexData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PhytoLit_References.bib';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌿</span>
            <h1 className="font-bold text-emerald-400 tracking-wide text-lg">PhytoLit AI</h1>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
            v1.0
          </span>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>+ New Research Query</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="text-xs font-semibold text-slate-400 px-2 py-2 uppercase tracking-wider">
            Research History
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 px-2 italic">No past sessions saved yet.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadChat(item)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  activeId === item.id
                    ? 'bg-slate-800 text-emerald-300 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="truncate flex-1 pr-2">{item.title}</span>
                <button
                  onClick={(e) => deleteChat(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1 transition-opacity"
                  title="Delete query"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span>Engine: Gemini 2.5 Flash</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span>Domain: Plant Pathology & Research</span>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <section className="flex-1 flex flex-col h-full bg-slate-950 relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-3">
            <span className="md:hidden text-lg">🌿</span>
            <h2 className="font-semibold text-slate-200">Interactive Phytopathological Synthesizer</h2>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadBibTeX}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-1.5 px-3 rounded border border-slate-700 transition-colors flex items-center space-x-1.5"
              >
                <span>📁 Export BibTeX</span>
              </button>
              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <span>{downloading ? 'Generating PDF...' : '📥 Download PDF'}</span>
              </button>
            </div>
          )}
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-3xl shadow-inner">
                🌾
              </div>
              <h3 className="text-xl font-bold text-slate-100">Welcome to PhytoLit AI</h3>
              <p className="text-sm text-slate-400">
                Your intelligent research companion for plant pathology, disease diagnostics, biocontrol mechanisms, and academic literature synthesis. Enter your query below to begin.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4 text-left">
                <button
                  onClick={() => setInput('Effectiveness of Pseudomonas fluorescens against bacterial blight in rice')}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  🌱 Pseudomonas fluorescens in Rice
                </button>
                <button
                  onClick={() => setInput('Integrated management strategies for cotton angular leaf spot')}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  🦠 Cotton Angular Leaf Spot Control
                </button>
              </div>
            </div>
          ) : (
            <div id="pdf-content" className="space-y-6 max-w-4xl mx-auto bg-slate-950 p-2 rounded-xl">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-5 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-xs text-slate-400 pl-2">Synthesizing literature & pathways...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pathogens, treatments, mechanisms, or research protocols..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-600 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center justify-center"
            >
              Send
            </button>
          </form>
          <div className="text-center text-[10px] text-slate-400 mt-2">
            PhytoLit AI Research Assistant • Powered by Google Gemini
          </div>
        </div>
      </section>
    </main>
  );
}
