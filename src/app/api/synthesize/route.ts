import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { query, format } = await req.json();

    // The heavily enforced prompt engine with the new BibTeX rule
    const prompt = `
      You are PhytoLit AI, a research literature assistant for Plant Pathology.
      User Research Topic: "${query}"
      Desired Output Format: "${format}"

      Task: Search for recent peer-reviewed scientific literature and provide a well-structured summary. 
      Include citations or paper titles where applicable.
      
      CRITICAL FORMATTING RULES - YOU MUST OBEY THESE STRICTLY:
      1. NO ASCII ART OR DIAGRAMS: Under no circumstances should you use keyboard characters (+, -, |, v, >, <) to draw flowcharts, structural boxes, or diagrams. Use standard nested bullet points for pathways or hierarchies.
      2. STRICT MARKDOWN TABLES: When presenting comparative data, you MUST use strict GitHub Flavored Markdown tables with pipe (|) characters and hyphens (-). NEVER use spaces or tabs to visually align text.
