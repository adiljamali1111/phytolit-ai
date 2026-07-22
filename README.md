# PhytoLit AI

> **Advanced Plant Pathology Literature Synthesizer & Research Companion**

PhytoLit AI is an end-to-end, AI-powered academic web application designed for plant pathologists, agronomists, graduate researchers, and agricultural scientists. It automates the synthesis of complex research literature, formats comparative data tables, extracts standardized BibTeX citations, renders mathematical equations, and exports publication-ready Word (`.docx`) and PDF documents.

---

## 🌐 Live Application URL

* **Live Deployment:** [https://phytolit-ai.vercel.app](https://phytolit-ai.vercel.app)
* **Repository:** Public GitHub Repository

---

## 🎯 Problem Statement & Audience

### The Problem
Research in plant pathology, crop disease management, and biological control is fragmented across thousands of peer-reviewed journals. Agricultural scientists and graduate students spend countless hours:
* Manually reading through dozens of dense papers to extract disease management protocols, pathogen mechanisms, and trial results.
* Formatting literature reviews, data grids, and citation references for academic proposals or theses.
* Converting AI summaries into professional Word documents with standardized academic typography (Times New Roman, justified margins, and inline sub/superscripts for chemical formulas like $\text{K}_2\text{HPO}_3$).

### The Solution
PhytoLit AI solves this by providing an instant, expert-level research synthesizer that parses, formats, and structures agricultural literature into structured reviews, executive summaries, or bullet points. It integrates an interactive Q&A assistant to query the synthesized literature in real-time, extracts `.bib` citations, and exports styled Microsoft Word (`.docx`) files and dark-mode PDFs with a single click.

---

## ✨ Features

* **🤖 AI-Powered Pathology Synthesis:** Generates high-density academic literature reviews, executive summaries, and bulleted key takeaways tailored for plant pathology.
* **📄 Professional Word (.docx) Export:** 
  * **Academic Typography:** Formatted in 12pt Times New Roman with justified body text alignment and 1.15× line spacing.
  * **Executive Palette:** Executive Emerald heading hierarchy (18pt Heading 1, 14pt Heading 2, 12pt Heading 3).
  * **Native Subscripts & Math:** Converts inline math formulas and chemical compounds (e.g., $\text{H}_2\text{O}$, $\text{CuSO}_4$) into native Word subscripts and superscripts.
  * **Formatted Data Tables:** Custom grid padding, light green header shading, and light gray borders.
* **📊 Seamless PDF Export:** Built-in vector print styling that preserves dark-mode aesthetics, table layouts, and mathematical formulas without text cutoff or image degradation.
* **📚 Instant BibTeX Citation Exporter (.bib):** Automatically detects and parses embedded BibTeX reference blocks, allowing one-click export directly into Zotero, Mendeley, or EndNote.
* **💬 Interactive "Chat with the Literature":** Context-aware follow-up Q&A engine that allows researchers to drill down into specific trial metrics, pathogen strains, or treatment dosages.
* **🧪 KaTeX Math & Chemical Formula Rendering:** Renders complex mathematical equations, chemical formulas, and biological notation using KaTeX.
* **💾 Local Search History:** Automatically persists recent search queries and outputs using browser `localStorage` for offline access and quick reload.

---

## 🧠 AI Feature & System Prompt Architecture

PhytoLit AI utilizes Google's Gemini AI model through two specialized workflows:

### 1. Literature Synthesis Workflow
The synthesis engine ingests user research queries and formats structured literature reviews complete with citations and comparative tables.

Screenshots of the app in action:
<img width="946" height="382" alt="Screenshot 2026-07-22 184829" src="https://github.com/user-attachments/assets/c68564fe-199a-42b7-b67d-46a4c242ad4e" />
<img width="959" height="449" alt="Screenshot 2026-07-22 184803" src="https://github.com/user-attachments/assets/b3a28d29-1e4f-4abd-9ba5-56026374d418" />
<img width="959" height="512" alt="Screenshot 2026-07-22 184740" src="https://github.com/user-attachments/assets/c2b04491-9b79-412a-9a7b-fa4d46454b66" />
<img width="947" height="410" alt="Screenshot 2026-07-22 184703" src="https://github.com/user-attachments/assets/64f437fc-43e2-414d-ba76-de5927acfbe5" />
<img width="959" height="510" alt="Screenshot 2026-07-22 184636" src="https://github.com/user-attachments/assets/9e43b1cb-83d9-4524-94e5-e3c9ecc7d485" />
<img width="949" height="512" alt="Screenshot 2026-07-22 184912" src="https://github.com/user-attachments/assets/93330fcb-1a8f-42be-9e03-71dbbdbede40" />
