import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FiboScene } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Prompt Interpreter Agent" for FIBO Studio OS. 
Your goal is to convert vague natural language user requests into a STRICT deterministic JSON blueprint for the Bria/FIBO image generation engine.

Rules:
1. You must output valid JSON matching the "Structured Prompt" schema provided.
2. "objects" must be a list of detailed object descriptions.
3. "photographic_characteristics" must use professional photography terms (e.g., "85mm lens", "f/1.8", "low angle").
4. "lighting" must describe conditions, direction, and shadows explicitly.
5. "context" and "artistic_style" are MANDATORY.
6. Be highly descriptive in "short_description" as it acts as a fallback/summary.
`;

const SCENE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    short_description: { type: Type.STRING, description: "A comprehensive summary of the visual scene." },
    objects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          location: { type: Type.STRING },
          relationship: { type: Type.STRING },
          relative_size: { type: Type.STRING },
          shape_and_color: { type: Type.STRING },
          texture: { type: Type.STRING },
          appearance_details: { type: Type.STRING },
          number_of_objects: { type: Type.NUMBER },
          orientation: { type: Type.STRING }
        },
        required: ['description']
      }
    },
    background_setting: { type: Type.STRING, description: "Detailed description of the background." },
    lighting: {
      type: Type.OBJECT,
      properties: {
        conditions: { type: Type.STRING, description: "e.g., 'Soft studio lighting', 'Golden hour'" },
        direction: { type: Type.STRING },
        shadows: { type: Type.STRING }
      },
      required: ['conditions', 'direction', 'shadows']
    },
    aesthetics: {
      type: Type.OBJECT,
      properties: {
        composition: { type: Type.STRING, description: "e.g., 'Rule of thirds', 'Centered'" },
        color_scheme: { type: Type.STRING, description: "e.g., 'Teal and Orange', 'Monochrome'" },
        mood_atmosphere: { type: Type.STRING }
      },
      required: ['composition', 'color_scheme', 'mood_atmosphere']
    },
    photographic_characteristics: {
      type: Type.OBJECT,
      properties: {
        depth_of_field: { type: Type.STRING, description: "e.g., 'Shallow', 'Deep'" },
        focus: { type: Type.STRING },
        camera_angle: { type: Type.STRING, description: "e.g., 'Eye-level', 'Low angle', 'Dutch angle'" },
        lens_focal_length: { type: Type.STRING, description: "e.g., '35mm', '50mm', '85mm'" }
      },
      required: ['depth_of_field', 'camera_angle', 'lens_focal_length']
    },
    style_medium: { type: Type.STRING, enum: ['photograph', 'digital_art', '3d_render', 'oil_painting'] },
    context: { type: Type.STRING, description: "Context of usage, e.g. 'e-commerce', 'editorial', 'cinematic concept'" },
    artistic_style: { type: Type.STRING, description: "e.g. 'realistic', 'surreal', 'minimalist'" },
    aspect_ratio: { type: Type.STRING, enum: ['1:1', '16:9', '9:16', '4:3'] }
  },
  required: ['short_description', 'objects', 'background_setting', 'lighting', 'aesthetics', 'photographic_characteristics', 'style_medium', 'context', 'artistic_style', 'aspect_ratio']
};

export const generateFiboJson = async (userPrompt: string, constraints?: string, previousJson?: FiboScene): Promise<FiboScene> => {
  try {
    const model = "gemini-2.5-flash";
    let finalPrompt = userPrompt;
    
    if (previousJson) {
      finalPrompt = `
      CURRENT STRUCTURED PROMPT:
      ${JSON.stringify(previousJson)}

      USER REFINEMENT REQUEST:
      "${userPrompt}"

      INSTRUCTIONS:
      Update the CURRENT JSON to satisfy the USER REFINEMENT REQUEST. 
      Keep all other parameters (objects, lighting, camera) consistent unless asked to change.
      `;
    }

    if (constraints) {
      finalPrompt += `\n\n[VISUAL DIRECTOR CONSTRAINTS]: ${constraints}`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: SCENE_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FiboScene;
    }
    throw new Error("No JSON returned from Gemini");
  } catch (error) {
    console.error("Gemini Agent Error:", error);
    throw error;
  }
};

export const generateBatchFiboJson = async (userPrompt: string, count: number, constraints?: string): Promise<FiboScene[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    let finalPrompt = `
    STRICT INSTRUCTION: Generate EXACTLY ${count} unique variations for the following concept: "${userPrompt}".
    
    You MUST output a JSON object containing a "variations" array with exactly ${count} items.
    
    Vary these parameters across the ${count} items to create distinct looks:
    - Camera Angle (e.g., one low angle, one high angle)
    - Lighting Direction (e.g., one side lit, one backlit)
    - Composition (e.g., one centered, one wide)
    `;

    if (constraints) {
      finalPrompt += `\n\n[VISUAL DIRECTOR CONSTRAINTS (Apply to all)]: ${constraints}`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: SCENE_SCHEMA
            }
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      let variations = parsed.variations as FiboScene[];

      // SAFETY NET: Ensure 'variations' is an array
      if (!Array.isArray(variations)) variations = [];
      
      // GUARANTEE: Exact Count Logic
      if (variations.length > count) {
        variations = variations.slice(0, count);
      }
      
      if (variations.length < count) {
          console.warn(`[Batch Agent] Model returned ${variations.length}/${count}. Padding...`);
          
          if (variations.length === 0) {
              throw new Error("Batch generation yielded zero results.");
          }
          
          const originalCount = variations.length;
          let i = 0;
          while (variations.length < count) {
              const source = variations[i % originalCount];
              const clone = JSON.parse(JSON.stringify(source));
              clone.short_description += ` (Variant ${variations.length + 1})`;
              variations.push(clone);
              i++;
          }
      }

      return variations;
    }
    throw new Error("No Batch JSON returned from Gemini");
  } catch (error) {
    console.error("Gemini Batch Agent Error:", error);
    throw error;
  }
};