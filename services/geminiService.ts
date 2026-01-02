
import { GoogleGenAI, Type } from "@google/genai";
import { CardAnalysisResult } from "../types";

export const analyzeWorkCard = async (base64Image: string): Promise<CardAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `Extract work card data: month, year, worker name, and a list of dates with hours worked. Sum total hours. Ensure JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for speed
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            month: { type: Type.STRING },
            year: { type: Type.NUMBER },
            workerName: { type: Type.STRING },
            totalHours: { type: Type.NUMBER },
            workDays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  hours: { type: Type.NUMBER },
                },
                required: ["date", "hours"]
              }
            }
          },
          required: ["month", "year", "workDays", "totalHours"]
        }
      }
    });

    return JSON.parse(response.text) as CardAnalysisResult;
  } catch (error) {
    console.error("Error analyzing card:", error);
    throw new Error("Card read nahi ho paaya. Photo saaf kheenchiye.");
  }
};
