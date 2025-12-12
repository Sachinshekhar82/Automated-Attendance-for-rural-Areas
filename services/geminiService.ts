import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const urlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Return only the base64 data part
        resolve(result.split(',')[1]);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Could not load reference image:", url, error);
    return null;
  }
};

export const analyzeClassroomImage = async (base64Image: string, students: Student[]): Promise<AIAnalysisResult> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const model = "gemini-2.5-flash";

    // 1. Add the main classroom image
    const parts: any[] = [
      {
        text: "You are an automated attendance system. I will provide a 'Classroom Photo' followed by 'Reference Photos' of students. \n\nTask:\n1. Analyze the Classroom Photo to find faces.\n2. Compare found faces with the provided Reference Photos.\n3. Identify which students are present.\n4. If the photo quality is poor or no exact matches are found, but it looks like a class, strictly list NO ONE. However, for the purpose of this demo, if the face matches are ambiguous but likely, lean towards matching.\n\nClassroom Photo:"
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      }
    ];

    // 2. Add reference images for each student
    if (students.length > 0) {
      parts.push({ text: "Reference Student Photos (ID: Name):" });
      
      // Limit to first 10 students to avoid payload size issues in this demo environment
      // In production, this would be handled by a backend with vector embeddings.
      const studentsCheck = students.slice(0, 10);
      
      for (const student of studentsCheck) {
        const studentB64 = await urlToBase64(student.photoUrl);
        if (studentB64) {
          parts.push({ text: `Student ID: ${student.id}, Name: ${student.name}` });
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: studentB64
            }
          });
        }
      }
    }
    
    parts.push({
      text: "Based on the images above, return a JSON object with the analysis results."
    });
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentCount: { type: Type.INTEGER },
            isClassroom: { type: Type.BOOLEAN },
            environmentDescription: { type: Type.STRING },
            attentivenessScore: { type: Type.STRING, description: "High, Medium, or Low" },
            presentStudentIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of IDs of students positively identified in the classroom photo"
            }
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
      environmentDescription: "Could not analyze image due to technical issues.",
      attentivenessScore: "Unknown",
      presentStudentIds: []
    };
  }
};