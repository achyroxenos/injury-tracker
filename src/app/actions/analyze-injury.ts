"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injury } from "@/context/injury-context";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeInjury(injury: Injury, userMessage: string) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            text: "I'm in demo mode because no API Key was found. Please add GEMINI_API_KEY to .env.local to unlock real AI analysis.",
            isMock: true,
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Construct context from injury data
        const latestLog = injury.logs[injury.logs.length - 1];
        const context = `
      You are an empathetic, professional medical assistant AI for an Injury Tracking App.
      
      Current Context:
      - Injury Type: ${injury.type}
      - Body Part: ${injury.bodyPart}
      - Cause: ${injury.cause}
      - Status: ${injury.status}
      - Start Date: ${new Date(injury.startDate).toLocaleDateString()}
      - Latest Pain Level: ${latestLog.painLevel}/10
      - Latest Notes: ${latestLog.notes}
      ${latestLog.temperature ? `- Temperature: ${latestLog.temperature}°C` : ""}
      ${latestLog.symptoms ? `- Symptoms: ${latestLog.symptoms.join(", ")}` : ""}
      
      User Question: "${userMessage}"
      
      Instructions:
      1. Answer the user's query directly based on the medical context above.
      2. Speak with an empathetic, conversational, yet highly professional tone.
      3. Use clear **Markdown formatting** (bullet points, bold text for emphasis) to make your response extremely easy to read.
      4. Be concise (maximum 3-4 sentences total).
      5. If the user asks for a diagnosis or treatment plan, kindly remind them you are an AI assistant and they should consult a real healthcare professional.
    `;

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        return { text, isMock: false };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            text: "I'm having trouble connecting to my brain right now. Please try again later.",
            isMock: true,
            error: String(error)
        };
    }
}
