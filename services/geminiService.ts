import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AppMode, AIResponse, ScenarioIntervention } from "../types";
import { SYSTEM_INSTRUCTION, CITIES, MOCK_TIMESERIES } from "../constants";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ui_text: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        narrative: { type: Type.STRING },
        highlight: { type: Type.STRING },
      },
      required: ["title", "narrative"],
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        key_drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
        health_impact: { type: Type.STRING },
      },
      required: ["key_drivers", "health_impact"],
    },
    comparisons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          primaryValue: { type: Type.NUMBER },
          secondaryValue: { type: Type.NUMBER },
          unit: { type: Type.STRING },
        },
        required: ["metric", "primaryValue", "secondaryValue", "unit"],
      },
    },
    warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["ui_text", "analysis"],
};

interface RequestContext {
  mode: AppMode;
  primaryCityId: string;
  secondaryCityId?: string;
  interventions?: ScenarioIntervention[];
  customPrompt?: string;
}

export const generateAnalysis = async (context: RequestContext): Promise<AIResponse> => {
  if (!apiKey) {
    console.warn("No API Key. Returning Mock.");
    return getMockResponse(context.mode);
  }

  try {
    const primaryCity = CITIES.find(c => c.id === context.primaryCityId);
    const secondaryCity = CITIES.find(c => c.id === context.secondaryCityId);
    
    // Always provide benchmark context
    const poleRef = CITIES.find(c => c.id === 'north_pole');

    const dataContext = {
      mode: context.mode,
      primary_city: primaryCity,
      secondary_city: secondaryCity,
      reference_baseline: poleRef,
      active_interventions: context.interventions
    };

    const userPrompt = `
      Current Data Context: ${JSON.stringify(dataContext)}
      User Custom Input: ${context.customPrompt || "None"}
      
      Generate response. Be authoritative. Use the Reference Baseline (Poles) to contextualize the severity of the primary city's pollution.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return JSON.parse(text) as AIResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getMockResponse(context.mode);
  }
};

const getMockResponse = (mode: AppMode): AIResponse => {
  // Simple Mock fallback
  return {
    ui_text: {
      title: "Atmospheric Data Unavailable",
      narrative: "Unable to reach Gemini Intelligence Core. Displaying cached simulation data.",
      highlight: "System Offline"
    },
    analysis: {
      key_drivers: ["N/A"],
      health_impact: "Data Link Severed"
    },
    comparisons: [],
  };
};