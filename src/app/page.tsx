'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface HistoryItem {
  query: string;
  format: string;
  result: string;
  timestamp: number;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('Literature Review');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('phytolit_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult('');
    setChatHistory([]);

    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, format }),
      });
      const data = await res.json();
      const output = data.result || data.error;
      setResult(output);

      if (data.result) {
        const newHistory = [{ query, format, result: output, timestamp: Date.now() }, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('phytolit_history', JSON.stringify(newHistory));
      }
    } catch (err) {
      setResult('An error occurred while fetching literature.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSearch = async () => {
    if (!followUpQuery) return;
    
    const userMessage = followUpQuery;
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setFollowUpQuery('');
    setFollowUpLoading(true);

    const combinedQuery = `
      Context from previous synthesis:
      "${result}"
      
      User's follow-up question: "${userMessage}"
      
      Task: Answer the user's follow-up question directly, concisely, and accurately based ONLY on the context provided above.
    `;

    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: combinedQuery, format: 'Bullet Points' }),
      });
      const data = await res.json();
      const cleanResponse = (data.result || data.error).replace(/```bibtex[\s\S]*?```/, '');
      setChatHistory((prev) => [...prev, { role: 'ai', content: cleanResponse }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'ai', content: 'Error fetching follow-up response.' }]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setQuery(item.query);
    setFormat(item.format);
    setResult(item.result);
    setChatHistory([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const element = document.getElementById('pdf-content');
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0.5,
      filename: 'PhytoLit_Synthesis.pdf',
      image: { type: 'jpeg' as any, quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0a0a0a' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as any },
    };
    if (element) {
  await html2pdf().set(opt).from(element).save();
}

    setDownloading(false);
  };

  const handleExportCitations = () => {
    const match = result.match(/```bibtex([\s\S]*?)```/);
    const bibtexData = match ? match[1].trim() : "No citations found in this synthesis.";
    
    const element = document.createElement("a");
    const file = new Blob([bibtexData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "citations.bib";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const displayResult = result.replace(/```bibtex[\s\S]*?```/, '');

  return (
    <main className="min-h-screen bg-[#0f0f11] text-neutral-200 selection:bg-emerald-500/30 font-sans pb-16 flex flex-col justify-between">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#0f0f11] to-[#0f0f11] pointer-events-none"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* LEFT COLUMN: Controls & History */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10 h-fit">
          <header className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-3">
              PhytoLit AI
            </h1>
            <p className="text-neutral-500 text-sm tracking-widest uppercase font-bold">
              Advanced Pathology Synthesizer
            </p>
          </header>

          <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800/80 p-6 rounded-[2rem] shadow-2xl space-y-6">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Research Topic</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Biocontrol agents for angular leaf spot..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-[#141417] border border-neutral-800/80 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Synthesis Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#141417] border border-neutral-800/80 text-neutral-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none shadow-inner"
              >
                <option value="Literature Review">Academic Literature Review</option>
                <option value="Executive Summary">Executive Summary</option>
                <option value="Bullet Points">Key Takeaways (Bullet Points)</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !query}
              className="w-full py-4 mt-2 bg-neutral-100 hover:bg-white text-neutral-950 font-extrabold text-lg rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Synthesizing Data...' : 'Generate Synthesis'}
            </button>
          </div>

          {history.length > 0 && (
            <div className="bg-neutral-900/20 border border-neutral-800/50 p-6 rounded-[2rem]">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Recent Syntheses</h3>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left p-3 rounded-xl bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800/50 transition-all text-sm text-neutral-300 truncate"
                  >
                    <span className="text-emerald-500 mr-2">◷</span>
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Output Engine */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="flex flex-col space-y-6">
              
              <div className="bg-[#141417]/80 backdrop-blur-xl border border-neutral-800/80 p-8 lg:p-12 rounded-[2rem] shadow-2xl">
                <div className="flex flex-wrap items-center justify-between border-b border-neutral-800/80 pb-6 mb-8 gap-4">
                  <h2 className="text-xl font-bold text-neutral-100 tracking-wide">Output Generation</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleExportCitations}
                      className="px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 text-neutral-300 text-sm font-semibold rounded-xl transition-all"
                    >
                      Export .bib
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 text-neutral-300 text-sm font-semibold rounded-xl transition-all"
                    >
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      {downloading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
                
                <div id="pdf-content" className="p-2">
                  <div className="text-neutral-300 text-base leading-relaxed tracking-wide">
                     <ReactMarkdown 
                       remarkPlugins={[remarkMath, remarkGfm]} 
                       rehypePlugins={[rehypeKatex]}
                       components={{
                         h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-neutral-100 mt-8 mb-6 pb-2 border-b border-neutral-800/50" {...props} />,
                         h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-neutral-100 mt-8 mb-4" {...props} />,
                         h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-emerald-400 mt-6 mb-3" {...props} />,
                         p: ({node, ...props}) => <p className="mb-6 leading-8" {...props} />,
                         ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-neutral-600" {...props} />,
                         ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-neutral-600" {...props} />,
                         strong: ({node, ...props}) => <strong className="font-bold text-emerald-300" {...props} />,
                         a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400/30" {...props} />,
                         table: ({node, ...props}) => (
                           <div className="overflow-x-auto my-10 rounded-2xl border border-neutral-800 bg-[#0f0f11] shadow-xl custom-scrollbar">
                             <table className="w-full text-sm text-left text-neutral-300 border-collapse min-w-[600px]" {...props} />
                           </div>
                         ),
                         thead: ({node, ...props}) => <thead className="text-xs uppercase bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 whitespace-nowrap" {...props} />,
                         th: ({node, ...props}) => <th className="px-6 py-5 font-bold tracking-wider" {...props} />,
                         td: ({node, ...props}) => <td className="px-6 py-4 border-b border-neutral-800/50 align-top" {...props} />,
                         tr: ({node, ...props}) => <tr className="transition-colors hover:bg-neutral-800/30" {...props} />,
                       }}
                     >
                       {displayResult}
                     </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE CHAT ENGINE */}
              <div className="bg-[#141417]/80 backdrop-blur-xl border border-neutral-800/80 p-6 lg:p-8 rounded-[2rem] shadow-2xl">
                <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                  <span>💬</span> Chat with the Literature
                </h3>
                
                {chatHistory.length > 0 && (
                  <div className="space-y-6 mb-6">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-neutral-800 text-neutral-200 rounded-tr-sm' : 'bg-emerald-900/20 border border-emerald-800/30 text-neutral-300 rounded-tl-sm'}`}>
                          {msg.role === 'ai' ? (
                             <div className="space-y-2 text-sm">
                               <ReactMarkdown>{msg.content}</ReactMarkdown>
                             </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFollowUpSearch()}
                    placeholder="Ask a specific question about the data above..."
                    className="flex-1 p-4 rounded-xl bg-[#0f0f11] border border-neutral-800/80 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={handleFollowUpSearch}
                    disabled={followUpLoading || !followUpQuery}
                    className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {followUpLoading ? '...' : 'Ask'}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[80vh] border border-dashed border-neutral-800/60 rounded-[2rem] text-neutral-600 bg-[#141417]/30">
              <p className="text-sm font-bold uppercase tracking-widest">Awaiting Input Parameters</p>
            </div>
          )}
        </div>

      </div>

      {/* WATERMARK FOOTER */}
      <footer className="relative z-10 text-center py-6 border-t border-neutral-800/50 mt-12">
        <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
          Made by Adil Jamali 🦅
        </p>
      </footer>
    </main>
  );
}