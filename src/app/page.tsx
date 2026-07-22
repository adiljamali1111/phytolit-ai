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
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
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
      const cleanResponse = (data.result || data.error).replace(/\x60\x60\x60bibtex[\s\S]*?\x60\x60\x60/, '');
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

  // Triggers vector print output
  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = 'phytolit-AI';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Generates academic DOCX with Times New Roman & native subscript math formatting
  const handleDownloadDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType, AlignmentType } = await import('docx');

      // Helper to convert math/subscripts inside any text run
      const parseMathAndSubscripts = (rawText: string, isBold: boolean, isItalic: boolean) => {
        const runs: InstanceType<typeof TextRun>[] = [];
        const mathParts = rawText.split(/(\$.*?\$)/g);

        mathParts.forEach((part) => {
          if (!part) return;

          if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
            let formula = part.slice(1, -1)
              .replace(/\\(text|mathrm|mathbf)\{(.*?)\}/g, '$2')
              .replace(/\\beta/g, 'β')
              .replace(/\\alpha/g, 'α')
              .replace(/\\gamma/g, 'γ')
              .replace(/\\pm/g, '±')
              .replace(/\\mu/g, 'μ')
              .replace(/\\/g, '');

            const subSuperRegex = /(_\{.*?\}|_[\da-zA-Z]|\^\{.*?\}|\^[\da-zA-Z])/g;
            const subParts = formula.split(subSuperRegex);

            subParts.forEach((subPart) => {
              if (!subPart) return;
              if (subPart.startsWith('_')) {
                const val = subPart.startsWith('_{') ? subPart.slice(2, -1) : subPart.slice(1);
                runs.push(new TextRun({
                  text: val,
                  subScript: true,
                  bold: isBold,
                  italics: isItalic,
                  font: 'Times New Roman',
                  size: 24,
                  color: '1A1A1A',
                }));
              } else if (subPart.startsWith('^')) {
                const val = subPart.startsWith('^{') ? subPart.slice(2, -1) : subPart.slice(1);
                runs.push(new TextRun({
                  text: val,
                  superScript: true,
                  bold: isBold,
                  italics: isItalic,
                  font: 'Times New Roman',
                  size: 24,
                  color: '1A1A1A',
                }));
              } else {
                runs.push(new TextRun({
                  text: subPart,
                  bold: isBold,
                  italics: isItalic,
                  font: 'Times New Roman',
                  size: 24,
                  color: '1A1A1A',
                }));
              }
            });
          } else {
            const cleanPart = part.replace(/\$/g, '');
            runs.push(new TextRun({
              text: cleanPart,
              bold: isBold,
              italics: isItalic,
              font: 'Times New Roman',
              size: 24,
              color: '2B2B2B',
            }));
          }
        });

        return runs;
      };

      // Two-pass parser: Handles outer Markdown (bold/italic) and nested math
      const parseInlineText = (text: string) => {
        const cleanedText = text.replace(/\*\*\*/g, '**');
        const runs: InstanceType<typeof TextRun>[] = [];
        const segments = cleanedText.split(/(\*\*.*?\*\*|\*.*?\*)/g);

        segments.forEach((segment) => {
          if (!segment) return;

          if (segment.startsWith('**') && segment.endsWith('**') && segment.length >= 4) {
            const innerText = segment.slice(2, -2);
            runs.push(...parseMathAndSubscripts(innerText, true, false));
          } else if (segment.startsWith('*') && segment.endsWith('*') && segment.length >= 2) {
            const innerText = segment.slice(1, -1);
            runs.push(...parseMathAndSubscripts(innerText, false, true));
          } else {
            runs.push(...parseMathAndSubscripts(segment, false, false));
          }
        });

        return runs;
      };

      const lines = displayResult.split('\n');
      const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

      let inTable = false;
      let tableRowsData: string[][] = [];

      const processTable = () => {
        if (tableRowsData.length === 0) return;

        const rows = tableRowsData.map((rowCells, rowIndex) => {
          const isHeader = rowIndex === 0;
          return new TableRow({
            children: rowCells.map((cellText) => new TableCell({
              children: [
                new Paragraph({
                  children: parseInlineText(cellText.trim()),
                  spacing: { before: 80, after: 80 },
                }),
              ],
              shading: isHeader ? { fill: 'F0F7F4', type: ShadingType.CLEAR } : undefined,
              width: { size: Math.floor(100 / rowCells.length), type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
              },
            })),
          });
        });

        children.push(new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }));

        children.push(new Paragraph({ spacing: { after: 200 } }));
        tableRowsData = [];
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '---' || line === '***' || line === '___') {
          children.push(new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D3D3D3' } },
            spacing: { before: 180, after: 180 },
          }));
          continue;
        }

        if (line.startsWith('|') && line.endsWith('|')) {
          if (line.replace(/[\s|:-]/g, '').length === 0) continue;
          inTable = true;
          const cells = line.split('|').slice(1, -1);
          tableRowsData.push(cells);
          continue;
        } else if (inTable) {
          inTable = false;
          processTable();
        }

        if (!line) continue;

        if (line.startsWith('# ')) {
          children.push(new Paragraph({
            text: line.replace('# ', '').replace(/\*/g, ''),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 140 },
          }));
        } else if (line.startsWith('## ')) {
          children.push(new Paragraph({
            text: line.replace('## ', '').replace(/\*/g, ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }));
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({
            text: line.replace('### ', '').replace(/\*/g, ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          }));
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
          const listText = line.replace(/^[\*\-]\s+/, '');
          children.push(new Paragraph({
            children: parseInlineText(listText),
            bullet: { level: 0 },
            spacing: { after: 100 },
          }));
        } else if (/^\d+\.\s+/.test(line)) {
          const listText = line.replace(/^\d+\.\s+/, '');
          children.push(new Paragraph({
            children: parseInlineText(listText),
            spacing: { after: 100, left: 360 },
          }));
        } else {
          // Standard Academic Body Paragraph (Justified text + 12pt Times New Roman)
          children.push(new Paragraph({
            children: parseInlineText(line),
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 140, line: 276 },
          }));
        }
      }

      if (inTable) processTable();

      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: 'Heading1',
              name: 'Heading 1',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 36,
                bold: true,
                color: '0F5132',
                font: 'Times New Roman',
              },
            },
            {
              id: 'Heading2',
              name: 'Heading 2',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 28,
                bold: true,
                color: '198754',
                font: 'Times New Roman',
              },
            },
            {
              id: 'Heading3',
              name: 'Heading 3',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 24,
                bold: true,
                color: '212529',
                font: 'Times New Roman',
              },
            },
          ],
        },
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children: children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'phytolit-AI.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Docx Export Error:', err);
    }
  };

  const handleExportCitations = () => {
    const match = result.match(/\x60\x60\x60bibtex([\s\S]*?)\x60\x60\x60/);
    const bibtexData = match ? match[1].trim() : "No citations found in this synthesis.";
    
    const element = document.createElement("a");
    const file = new Blob([bibtexData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "citations.bib";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const displayResult = result
    .replace(/\x60\x60\x60bibtex[\s\S]*?\x60\x60\x60/, '')
    .replace(/\*\*\*/g, '**')
    .replace(/\*\*\s+/g, '**')
    .replace(/\s+\*\*/g, '**');

  return (
    <main className="min-h-screen bg-[#0f0f11] text-neutral-200 selection:bg-emerald-500/30 font-sans pb-16 flex flex-col justify-between">
      
      {/* SEAMLESS FULL-DARK PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0 !important;
          }

          html, body, main {
            background-color: #0f0f11 !important;
            color: #e5e5e5 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #pdf-content {
            background-color: #0f0f11 !important;
            padding: 15mm !important;
            box-sizing: border-box !important;
          }

          .print\\:hidden, header, .lg\\:col-span-4, .chat-engine, button, input, textarea, select, footer {
            display: none !important;
          }

          .lg\\:col-span-8 {
            width: 100% !important;
            max-width: 100% !important;
          }

          .overflow-x-auto {
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
          }

          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
          }

          th, td {
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          tr, li, blockquote, h1, h2, h3, p {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#0f0f11] to-[#0f0f11] pointer-events-none print:hidden"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full print:p-0">
        
        {/* LEFT COLUMN: Controls & History */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10 h-fit print:hidden">
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
        <div className="lg:col-span-8 print:w-full">
          {result ? (
            <div className="flex flex-col space-y-6">
              
              <div className="bg-[#141417]/80 backdrop-blur-xl border border-neutral-800/80 p-8 lg:p-12 rounded-[2rem] shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-transparent">
                <div className="flex flex-wrap items-center justify-between border-b border-neutral-800/80 pb-6 mb-8 gap-4 print:hidden">
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
                    
                    {/* DOWNLOAD DOCUMENT DROPDOWN MENU */}
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      >
                        <span>Download Document</span>
                        <span className="text-xs">▾</span>
                      </button>

                      {isDownloadOpen && (
                        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#141417] border border-neutral-800 shadow-2xl z-50 overflow-hidden py-1">
                          <button
                            onClick={() => {
                              setIsDownloadOpen(false);
                              handleDownloadPDF();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-800/80 hover:text-emerald-400 flex items-center gap-2 transition-all"
                          >
                            <span className="text-emerald-500">📄</span> Download PDF
                          </button>
                          <button
                            onClick={() => {
                              setIsDownloadOpen(false);
                              handleDownloadDocx();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-800/80 hover:text-emerald-400 flex items-center gap-2 transition-all border-t border-neutral-800/50"
                          >
                            <span className="text-emerald-500">📝</span> Download Word (.docx)
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
                
                <div id="pdf-content" className="p-2 print:p-0">
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
                           <div className="overflow-x-auto my-10 rounded-2xl border border-neutral-800 bg-[#0f0f11] shadow-xl custom-scrollbar print:border-neutral-700">
                             <table className="w-full text-sm text-left text-neutral-300 border-collapse min-w-[600px] print:min-w-0" {...props} />
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
              <div className="bg-[#141417]/80 backdrop-blur-xl border border-neutral-800/80 p-6 lg:p-8 rounded-[2rem] shadow-2xl chat-engine print:hidden">
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
            <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[80vh] border border-dashed border-neutral-800/60 rounded-[2rem] text-neutral-600 bg-[#141417]/30 print:hidden">
              <p className="text-sm font-bold uppercase tracking-widest">Awaiting Input Parameters</p>
            </div>
          )}
        </div>

      </div>

      {/* WATERMARK FOOTER */}
      <footer className="relative z-10 text-center py-6 border-t border-neutral-800/50 mt-12 print:hidden">
        <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
          Made by Adil Jamali 🦅
        </p>
      </footer>
    </main>
  );
}
