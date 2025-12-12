import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeClassroomImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image for a school attendance system. 1. Estimate the count of students visible. 2. Is this likely a classroom setting? 3. Describe the attentiveness briefly. Return JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentCount: { type: Type.INTEGER },
            isClassroom: { type: Type.BOOLEAN },
            environmentDescription: { type: Type.STRING },
            attentivenessScore: { type: Type.STRING, description: "High, Medium, or Low based on visual cues" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails
    return {
      studentCount: 0,
      isClassroom: false,
      environmentDescription: "Could not analyze image. Please verify internet connection.",
      attentivenessScore: "Unknown"
    };
  }
};