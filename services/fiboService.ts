import { FiboScene } from '../types';
import { BRIA_MCP_API_KEY, BRIA_PRODUCTION_KEY } from '../constants';

export interface FiboGenerationResponse {
  url: string;
  seed: number;
  source: 'REST_V2' | 'MCP' | 'ERROR';
}

// Bria V2 API Endpoint
const BRIA_V2_PROD_ENDPOINT = "https://engine.prod.bria-api.com/v2/image/generate";
const BRIA_MCP_ENDPOINT = "https://mcp.prod.bria-api.com/mcp";

// Configuration
const API_TIMEOUT_MS = 90000; // 90s timeout

/**
 * Robust fetch with timeout wrapper
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = API_TIMEOUT_MS): Promise<Response> => {
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
 * Strategy 1: Bria V2 REST API (Official Production Endpoint)
 */
const generateViaRestV2 = async (fiboJson: FiboScene, seed: number): Promise<FiboGenerationResponse> => {
    console.log("[FIBO Service] Attempting REST V2 (Production)...");
    
    // EXPLICIT CONSTRUCTION: Create a fresh object to guarantee all required keys exist.
    // This solves the "objects -> Field required" 422 error by ensuring undefined values are replaced with defaults.
    const safeJson = {
        short_description: fiboJson.short_description || "High quality professional image",
        // Force 'objects' to be an array, never undefined
        objects: Array.isArray(fiboJson.objects) ? fiboJson.objects : [],
        background_setting: fiboJson.background_setting || "Studio background",
        lighting: fiboJson.lighting || { conditions: "Studio lighting", direction: "Front", shadows: "Soft" },
        aesthetics: fiboJson.aesthetics || { composition: "Centered", color_scheme: "Natural", mood_atmosphere: "Professional" },
        photographic_characteristics: fiboJson.photographic_characteristics || { depth_of_field: "Standard", focus: "Sharp", camera_angle: "Eye level", lens_focal_length: "50mm" },
        style_medium: fiboJson.style_medium || "photograph",
        // Mandatory fields for V2 that might be missing in older schemas
        context: (fiboJson as any).context || "Professional visual production",
        artistic_style: (fiboJson as any).artistic_style || "realistic",
        text_render: (fiboJson as any).text_render || []
    };

    // Deep sanitize objects to ensure they have descriptions
    if (safeJson.objects.length > 0) {
        safeJson.objects = safeJson.objects.map((obj: any) => ({
            ...obj,
            description: obj.description || "Object"
        }));
    }

    // Construct the payload with stringified structured_prompt
    const payload = {
      structured_prompt: JSON.stringify(safeJson), 
      sync: true,
      seed: seed,
      aspect_ratio: fiboJson.aspect_ratio || "1:1"
    };

    try {
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
            
            // Log payload for debugging if it fails again
            console.error("[FIBO Service] 422 Error Payload Dump:", payload);
            
            let errorDetails = txt;
            try {
                const jsonErr = JSON.parse(txt);
                if (jsonErr.error && jsonErr.error.details) {
                    // Capture Pydantic validation details
                    errorDetails = `${jsonErr.error.message} (${JSON.stringify(jsonErr.error.details)})`;
                } else if (jsonErr.error && jsonErr.error.message) {
                    errorDetails = jsonErr.error.message;
                }
            } catch (e) { /* ignore parse error */ }
            
            throw new Error(`Bria API Error ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        
        if (data.result && data.result.image_url) {
            return { 
                url: data.result.image_url, 
                seed: data.result.seed || seed, 
                source: 'REST_V2' 
            };
        }
        
        throw new Error("API success but no image_url in response.");

    } catch (error: any) {
        console.error(`[FIBO Service] REST V2 Error: ${error.message}`);
        throw error;
    }
};

/**
 * Strategy 2: MCP Integration (Backup)
 */
const generateViaMcp = async (fiboJson: FiboScene, seed: number): Promise<FiboGenerationResponse> => {
    console.log("[FIBO Service] Fallback to MCP...");
    
    // MCP Payload
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
    
    // Parse MCP Tool Result
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
  
  // Try REST V2 first (Preferred, High Fidelity)
  try {
    return await generateViaRestV2(fiboJson, seed);
  } catch (restError: any) {
    console.warn(`[FIBO Service] Primary Strategy Failed: ${restError.message}`);
    
    // Try MCP as Backup
    try {
        return await generateViaMcp(fiboJson, seed);
    } catch (mcpError: any) {
        // If both fail, throw the REST error as it's usually more descriptive for the user
        throw new Error(`Generation Failed: ${restError.message}`);
    }
  }
};