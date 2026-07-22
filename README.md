# PhytoLit AI 🦅

> **Advanced Plant Pathology Literature Synthesizer & Research Companion**

PhytoLit AI is an end-to-end, AI-powered academic web application engineered for plant pathologists, agronomists, graduate researchers, and agricultural scientists. It automates the synthesis of complex research literature, formats comparative data tables, extracts standardized BibTeX citations, renders mathematical equations and chemical formulas, and exports publication-ready Word (`.docx`) and vector PDF documents with a single click.

---

## 🌐 Live Application & Repository

- **Live Web App:** [https://phytolit-ai.vercel.app](https://phytolit-ai.vercel.app)
- **GitHub Repository:** [https://github.com/adiljamali1111/phytolit-ai](https://github.com/adiljamali1111/phytolit-ai)

---

## 🔬 Problem Statement & Best Use Cases

### The Problem
Academic research in plant pathology, crop disease management, and biological control is fragmented across thousands of peer-reviewed journals. Agricultural scientists and graduate students waste valuable time:
1. Manually sifting through dozens of dense papers to extract disease management protocols, pathogen mechanisms, and trial metrics.
2. Re-formatting literature reviews, data tables, and citation blocks for academic research proposals, synopses, or master's theses.
3. Converting AI output into professional Word documents with standardized academic typography (Times New Roman, justified margins, and inline chemical subscripts/superscripts like $\text{CuSO}_4$ or $\text{K}_2\text{HPO}_3$).

### Solution & Best Use Cases
**PhytoLit AI** bridges this gap by acting as an expert-level literature synthesizer that transforms complex agricultural research topics into structured academic reviews, executive summaries, or concise bullet points. 

**Best Use Cases Include:**
- **Thesis & Synopsis Preparation:** Rapidly drafting literature review sections with formatted citations and scientific nomenclature (e.g., italicized *Xanthomonas citri*).
- **Integrated Pest & Disease Management Strategy:** Generating comparative treatment dosage grids and biological control mechanisms.
- **Interactive Literature Discovery:** Querying synthesized findings in real-time without re-reading entire documents.
- **Citation & Export Automation:** Instantly exporting `.bib` reference files into reference managers (Zotero, Mendeley, EndNote) alongside publication-ready `.docx` and dark-mode `.pdf` files.

---

## ✨ Features

- 🧠 **AI-Powered Pathology Synthesis:** Generates high-density academic literature reviews, executive summaries, and key takeaways tailored specifically for agricultural science.
- 📝 **Professional Word (`.docx`) Export Engine:**
  - **Academic Typography:** Formatted in 12pt **Times New Roman** with justified body text alignment and $1.15\times$ line spacing.
  - **Executive Palette:** Executive Emerald heading hierarchy ($18\text{pt}$ Heading 1, $14\text{pt}$ Heading 2, $12\text{pt}$ Heading 3).
  - **Native Subscripts & Math:** Converts inline LaTeX math formulas and chemical compounds into native Word subscripts and superscripts.
  - **Formatted Data Tables:** Native table output with light green header shading (`#E8F5E9`) and styled borders.
- 📄 **Seamless Vector PDF Export:** Built-in vector print styling preserving dark-mode aesthetics, responsive table layouts, and KaTeX notation without text cutoff or quality loss.
- 📚 **Instant BibTeX Citation Exporter (`.bib`):** Automatically parses embedded BibTeX reference blocks for direct one-click download into academic reference managers.
- 💬 **Interactive "Chat with the Literature":** Context-aware follow-up Q&A engine grounded strictly in the generated synthesis to answer specific questions regarding trial metrics, pathogen strains, or treatment dosages.
- 🧪 **KaTeX Math & Chemical Formula Rendering:** Renders complex mathematical equations, chemical formulas, and biological notation using KaTeX and LaTeX syntax.
- 💾 **Local History Storage:** Automatically persists recent search queries and generated outputs in browser `localStorage` for quick reload and offline reference.

---

## 🛠️ Tech Stack & Dependencies

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/typography`
- **AI Backend Integration:** Google Gemini SDK (`@google/genai`) via Next.js API route (`/api/synthesize`)
- **Document Processing & Export:** `docx`, `jspdf`, `html2pdf.js`, `modern-screenshot`
- **Markdown & Math Rendering:** `react-markdown`, `remark-math`, `rehype-katex`, `remark-gfm`, `katex`

## 🧠 AI Feature & System Prompt Architecture

PhytoLit AI utilizes Google's **Gemini AI** model via a Next.js API route (`/api/synthesize`) to parse, structure, and synthesize complex literature queries.

### System Prompt Logic
```text
You are PhytoLit AI, an elite academic assistant and expert research synthesizer in Plant Pathology and Agronomy.

TASK:
1. Synthesize current peer-reviewed literature regarding the research topic provided.
2. Structure the output according to the requested format (Academic Literature Review, Executive Summary, or Key Takeaways).
3. Include relevant biological control mechanisms, pathogen taxonomies (italicized species names, e.g., Xanthomonas citri), and chemical treatment dosages where applicable.
4. Format comparative data using Markdown tables.
5. Render mathematical or chemical formulas using standard LaTeX notation ($...$).
6. Conclude the synthesis with a raw BibTeX code block containing valid academic citations for the referenced studies.

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
- **Node.js:** v18.x or higher
- **npm / yarn / pnpm**
- **Google Gemini API Key**

### 1. Clone the Repository
```bash
git clone [https://github.com/adiljamali1111/phytolit-ai.git](https://github.com/adiljamali1111/phytolit-ai.git)
cd phytolit-ai
```
Screenshots of the app in action:
<img width="946" height="382" alt="Screenshot 2026-07-22 184829" src="https://github.com/user-attachments/assets/c68564fe-199a-42b7-b67d-46a4c242ad4e" />
<img width="959" height="449" alt="Screenshot 2026-07-22 184803" src="https://github.com/user-attachments/assets/b3a28d29-1e4f-4abd-9ba5-56026374d418" />
<img width="959" height="512" alt="Screenshot 2026-07-22 184740" src="https://github.com/user-attachments/assets/c2b04491-9b79-412a-9a7b-fa4d46454b66" />
<img width="947" height="410" alt="Screenshot 2026-07-22 184703" src="https://github.com/user-attachments/assets/64f437fc-43e2-414d-ba76-de5927acfbe5" />
<img width="949" height="512" alt="Screenshot 2026-07-22 184912" src="https://github.com/user-attachments/assets/93330fcb-1a8f-42be-9e03-71dbbdbede40" />
<img width="959" height="539" alt="Screenshot 2026-07-23 012654" src="https://github.com/user-attachments/assets/6cf31391-d364-410c-9630-9aea406c3998" />
