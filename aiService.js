import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function summarizeEmail(emailText) {
  try {
    const prompt = `Lag en kort oppsummering av denne e-posten: "${emailText}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return summary;
  } catch (error) {
    console.error("Feil ved AI-sammendrag:", error);
    return "Kunne ikke oppsummere e-posten.";
  }
}
