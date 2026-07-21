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
      3. CITATION EXPORT: At the very end of your response, you MUST provide a valid BibTeX format block containing the citations for the literature you referenced. Wrap this BibTeX block exactly inside \`\`\`bibtex and \`\`\` tags.
      
      Table Format Example:
      | Strategy Category | Representative Agents | Key Advantage | Key Limitation |
      |---|---|---|---|
      | Data | Data | Data | Data |
    `;

    // Call the Gemini 3.6 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    // Send the correctly formatted text back to your frontend
    return NextResponse.json({ result: response.text });
    
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to synthesize literature. Please try again." }, 
      { status: 500 }
    );
  }
}
