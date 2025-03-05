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



// import OpenAI from 'openai';

// // Initialiser OpenAI med API-nøkkelen din
// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Hent fra miljøvariabel
//   dangerouslyAllowBrowser: true, // Nødvendig for å bruke OpenAI direkte i frontend
// });

// // Funksjon for å generere AI-baserte e-postsammendrag
// export async function summarizeEmail(emailContent) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini", // Eller "gpt-3.5-turbo" for billigere forespørsler
//       messages: [{ role: "user", content: `Oppsummer denne e-posten kort:\n\n${emailContent}` }],
//       max_tokens: 100,
//     });

//     return response.choices[0]?.message?.content || "Ingen respons fra AI.";
//   } catch (error) {
//     console.error("Feil ved AI-sammendrag:", error);
//     return "En feil oppstod under AI-behandlingen.";
//   }
// }
