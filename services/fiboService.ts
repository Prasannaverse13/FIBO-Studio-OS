import { FiboScene } from '../types';
import { BRIA_MCP_API_KEY, BRIA_PRODUCTION_KEY } from '../constants';

export interface FiboGenerationResponse {
  url: string;
  seed: number;
  source: 'REST_V2' | 'MCP' | 'ERROR';
}

// Bria V2 API Endpoints
const BRIA_V2_PROD_ENDPOINT = "https://engine.prod.bria-api.com/v2/image/generate";
const BRIA_MCP_ENDPOINT = "https://mcp.prod.bria-api.com/mcp";

// Configuration
const API_TIMEOUT_MS = 120000; // 2 minutes max for polling

/**
 * Robust fetch with timeout wrapper
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = 30000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout/1000}s`);
    }
    throw err;
  }
};

/**
 * Polling helper for Bria V2 Async API
 * Matches Python: poll_status_until_completed
 */
const pollStatusUntilCompleted = async (statusUrl: string, apiKey: string): Promise<any> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < API_TIMEOUT_MS) {
    try {
      const response = await fetch(statusUrl, {
        headers: { 'api_token': apiKey }
      });
      
      if (!response.ok) throw new Error(`Polling error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.status === 'COMPLETED') {
        return data;
      } else if (data.status === 'FAILED') {
        throw new Error(data.error || "Generation failed during processing");
      }
      
      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (e) {
      console.warn("Polling glitch:", e);
      // Continue polling unless timeout
    }
  }
  throw new Error("Polling timed out");
};

/**
 * Strategy 1: Bria V2 REST API (Async Polling)
 * Aligned with Python 'RefineImageNodeV2' and 'GenerateImageNodeV2' logic
 */
const generateViaRestV2 = async (fiboJson: FiboScene, seed: number): Promise<FiboGenerationResponse> => {
    console.log("[FIBO Service] Attempting REST V2 (Async Polling)...");
    
    if (!BRIA_PRODUCTION_KEY) {
        throw new Error("Missing API Key: BRIA_API_KEY is missing/empty.");
    }

    // 1. Construct Safe JSON (Structured Prompt)
    const safeJson = {
        short_description: fiboJson.short_description || "High quality professional image",
        objects: Array.isArray(fiboJson.objects) ? fiboJson.objects : [],
        background_setting: fiboJson.background_setting || "Studio background",
        lighting: fiboJson.lighting || { conditions: "Studio lighting", direction: "Front", shadows: "Soft" },
        aesthetics: fiboJson.aesthetics || { composition: "Centered", color_scheme: "Natural", mood_atmosphere: "Professional" },
        photographic_characteristics: fiboJson.photographic_characteristics || { depth_of_field: "Standard", focus: "Sharp", camera_angle: "Eye level", lens_focal_length: "50mm" },
        style_medium: fiboJson.style_medium || "photograph",
        context: (fiboJson as any).context || "Professional visual production",
        artistic_style: (fiboJson as any).artistic_style || "realistic",
        text_render: (fiboJson as any).text_render || []
    };

    // Deep sanitize objects
    if (safeJson.objects.length > 0) {
        safeJson.objects = safeJson.objects.map((obj: any) => ({
            ...obj,
            description: obj.description || "Object"
        }));
    }

    // 2. Build Payload matching Python 'RefineImageNodeV2' usage of v2/image/generate
    // We send BOTH prompt and structured_prompt.
    const payload = {
      prompt: fiboJson.short_description, 
      structured_prompt: JSON.stringify(safeJson), 
      model_version: "FIBO", // Explicitly requested by Python script
      aspect_ratio: fiboJson.aspect_ratio || "1:1",
      seed: seed,
      num_results: 1, 
      sync: false // Use Async Polling
    };

    try {
        // 3. Initial POST request
        const response = await fetchWithTimeout(BRIA_V2_PROD_ENDPOINT, {
            method: 'POST',
            headers: {
                'api_token': BRIA_PRODUCTION_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text();
            console.error("[FIBO Service] API Error Details:", txt);
            throw new Error(`Bria API Error ${response.status}: ${txt.substring(0, 200)}`);
        }

        const initialData = await response.json();
        
        // 4. Handle Async Response
        if (!initialData.status_url) {
             // Fallback if API returns result immediately (sync behavior)
             if (initialData.result && initialData.result.image_url) {
                 return { 
                    url: initialData.result.image_url, 
                    seed: initialData.result.seed || seed, 
                    source: 'REST_V2' 
                };
             }
             throw new Error("No status_url returned from API");
        }

        console.log(`[FIBO Service] Task Submitted. Polling: ${initialData.status_url}`);

        // 5. Poll until completion
        const finalData = await pollStatusUntilCompleted(initialData.status_url, BRIA_PRODUCTION_KEY);
        
        const result = finalData.result || {};
        if (result.image_url) {
             return { 
                url: result.image_url, 
                seed: result.seed || seed, 
                source: 'REST_V2' 
            };
        }
        
        throw new Error("Polling completed but no image_url found in result.");

    } catch (error: any) {
        const errorMsg = error.message || "Unknown Error";
        console.error(`[FIBO Service] REST V2 Error: ${errorMsg}`);
        
        if (errorMsg.includes("Failed to fetch")) {
             throw new Error("Network/CORS Error: Check your connection or API Key.");
        }
        throw error;
    }
};

/**
 * Strategy 2: MCP Integration (Backup)
 */
const generateViaMcp = async (fiboJson: FiboScene, seed: number): Promise<FiboGenerationResponse> => {
    console.log("[FIBO Service] Fallback to MCP...");
    
    if (!BRIA_MCP_API_KEY) {
        throw new Error("Missing API Key: BRIA_MCP_API_KEY is missing.");
    }

    const rpcPayload = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
            name: "text_to_image",
            arguments: {
                prompt: fiboJson.short_description,
                aspect_ratio: fiboJson.aspect_ratio || "1:1",
                num_results: 1,
                seed: seed
            }
        }
    };

    const response = await fetchWithTimeout(BRIA_MCP_ENDPOINT, {
        method: 'POST',
        headers: {
            'api_token': BRIA_MCP_API_KEY, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rpcPayload)
    }, 60000);

    if (!response.ok) throw new Error(`MCP Error ${response.status}`);
    
    const data = await response.json();
    
    if (data.result && data.result.content) {
         for (const item of data.result.content) {
            if (item.type === 'text') {
                const urlMatch = item.text.match(/https?:\/\/[^\s"']+/);
                if (urlMatch) return { url: urlMatch[0], seed, source: 'MCP' };
            }
            if (item.type === 'image' && item.url) return { url: item.url, seed, source: 'MCP' };
        }
    }
    throw new Error("No URL in MCP response");
};

/**
 * Main Entry Point
 */
export const generateImageFromFibo = async (fiboJson: FiboScene): Promise<FiboGenerationResponse> => {
  const seed = Math.floor(Math.random() * 10000000);
  
  try {
    return await generateViaRestV2(fiboJson, seed);
  } catch (restError: any) {
    console.warn(`[FIBO Service] Primary Strategy Failed: ${restError.message}`);
    try {
        return await generateViaMcp(fiboJson, seed);
    } catch (mcpError: any) {
        throw new Error(`Generation Failed: ${restError.message}`);
    }
  }
};