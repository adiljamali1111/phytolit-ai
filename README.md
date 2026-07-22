# PhytoLit AI ??

> **Advanced Plant Pathology Literature Synthesizer & Research Companion**

PhytoLit AI is an end-to-end, AI-powered academic web application designed for plant pathologists, agronomists, graduate researchers, and agricultural scientists. It automates the synthesis of complex research literature, formats comparative data tables, extracts standardized BibTeX citations, renders mathematical equations, and exports publication-ready Word (`.docx`) and PDF documents.

---

## ?? Live Application URL

?? **Live Deployment:** [https://phytolit-ai.vercel.app](https://phytolit-ai.vercel.app)

*(Repository: Public GitHub Repository)*

---

## ?? Problem Statement & Audience

### **The Problem**
Research in plant pathology, crop disease management, and biological control is fragmented across thousands of peer-reviewed journals. Agricultural scientists and graduate students spend countless hours:
1. Manually reading through dozens of dense papers to extract disease management protocols, pathogen mechanisms, and trial results.
2. Formatting literature reviews, data grids, and citation references for academic proposals or theses.
3. Converting AI summaries into professional Word documents with standardized academic typography (Times New Roman, justified margins, and inline sub/superscripts for chemical formulas like $\text{K}_2\text{HPO}_3$).

### **The Solution**
**PhytoLit AI** solves this by providing an instant, expert-level research synthesizer that parses, formats, and structures agricultural literature into structured reviews, executive summaries, or bullet points. It integrates an interactive Q&A assistant to query the synthesized literature in real-time, extracts `.bib` citations, and exports styled Microsoft Word (`.docx`) files and dark-mode PDFs with a single click.

---

## ? Features

- ?? **AI-Powered Pathology Synthesis:** Generates high-density academic literature reviews, executive summaries, and bulleted key takeaways tailored for plant pathology.
- ?? **Professional Word (`.docx`) Export:**
  - **Academic Typography:** Formatted in 12pt **Times New Roman** with justified body text alignment and $1.15\times$ line spacing.
  - **Executive Palette:** Executive Emerald heading hierarchy ($18\text{pt}$ Heading 1, $14\text{pt}$ Heading 2, $12\text{pt}$ Heading 3).
  - **Native Subscripts & Math:** Converts inline LaTeX math formulas and chemical compounds (e.g., $H_2O$, $CuSO_4$) into native Word subscripts and superscripts.
  - **Formatted Data Tables:** Custom grid padding, light green header shading, and light gray borders.
- ?? **Seamless PDF Export:** Built-in vector print styling that preserves dark-mode aesthetics, table layouts, and mathematical formulas without text cutoff or image degradation.
- ?? **Instant BibTeX Citation Exporter (`.bib`):** Automatically detects and parses embedded BibTeX reference blocks, allowing one-click export directly into Zotero, Mendeley, or EndNote.
- ?? **Interactive "Chat with the Literature":** Context-aware follow-up Q&A engine that allows researchers to drill down into specific trial metrics, pathogen strains, or treatment dosages.
- ?? **KaTeX Math & Chemical Formula Rendering:** Renders complex mathematical equations, chemical formulas, and biological notation using $\text{KaTeX}$.
- ? **Local Search History:** Automatically persists recent search queries and outputs using browser `localStorage` for offline access and quick reload.

---

## ?? AI Feature & System Prompt Architecture

PhytoLit AI utilizes Google's **Gemini AI** model through two specialized workflows:

### 1. Literature Synthesis Workflow
The synthesis engine ingests user research queries and formats structured literature reviews complete with citations and comparative tables.

### 2. Context-Aware Literature Chat Workflow
The interactive chat engine receives the synthesized context and answers follow-up inquiries strictly grounded in the generated findings.

### **System Prompt / Prompt Logic**

```text
You are PhytoLit AI, an elite academic assistant and expert research synthesizer in Plant Pathology and Agronomy.

TASK:
1. Synthesize current peer-reviewed literature regarding the research topic provided.
2. Structure the output according to the requested format (Academic Literature Review, Executive Summary, or Key Takeaways).
3. Include relevant biological control mechanisms, pathogen taxonomies (italicized species names, e.g., Xanthomonas citri), and chemical treatment dosages where applicable.
4. Format comparative data using Markdown tables.
5. Render mathematical or chemical formulas using standard LaTeX notation ($...$).
6. Conclude the synthesis with a raw BibTeX code block containing valid academic citations for the referenced studies.

FORMATTING RULES:
- Use clear Markdown headings (#, ##, ###).
- Use **bold** for key terms and *italics* for scientific names.
- Provide clean, professional layout structures ready for document export.
