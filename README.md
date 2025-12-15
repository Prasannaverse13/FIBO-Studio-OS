# 🚀 FIBO Studio OS

### Agentic, JSON-Native Visual Production System
**Hackathon Submission: Bria AI & FIBO Challenge**

![FIBO Studio OS Banner](https://img.shields.io/badge/Status-Production%20Ready-emerald) ![Tech](https://img.shields.io/badge/Stack-React%20|%20Gemini%20|%20Bria%20FIBO-indigo)

---

## 📖 About The Project

**FIBO Studio OS** is a professional visual production environment that shifts the paradigm from "prompt guessing" to **deterministic engineering**. 

Instead of struggling with vague natural language prompts, this application uses an intelligent **Interpreter Agent** (powered by Gemini) to translate creative intent into **FIBO JSON Blueprints**. These blueprints provide pixel-perfect control over camera angles, lighting, color depth, and composition before they are sent to the Bria generation engine.

Built for enterprise creatives, it features:
1.  **Visual Director Agent:** Enforces strict standards (16-bit color, HDR, specific lens focal lengths).
2.  **Batch Automation:** Generates parallel variations of a concept using multi-threaded agents.
3.  **Pro Control Matrix:** Locks specific photographic parameters (e.g., "85mm Lens", "Low Angle") regardless of the text prompt.
4.  **Version History:** Non-destructive timeline of all generated assets and their JSON states.

---

## 🏗️ Architecture & Workflow

The system operates on a strictly typed Agentic pipeline:

```mermaid
graph TD
    User[User Input / Text] -->|Natural Language| Interpreter[Gemini Interpreter Agent]
    Director[Visual Director UI] -->|Constraints (HDR, Lens, Angle)| Interpreter
    
    Interpreter -->|Translates to| JSON[FIBO JSON Blueprint]
    
    JSON -->|Validated Schema| AppState[React State / Editor]
    
    AppState -->|Sending Blueprint| BriaAPI[Bria Neural API v2]
    
    BriaAPI -->|Generates| Image[High-Fidelity Asset]
```

---

## 🛠️ Resource Usage & Integration Details

We have integrated the Bria ecosystem deeply into the application logic. Here is where and why we used each resource:

### 1. FIBO (Foundation for Image generation via Bria Objects)
*   **What it is:** The underlying JSON schema that controls the generation.
*   **Where is the code?** 
    *   `types.ts`: Defines the TypeScript interfaces (`FiboScene`, `FiboObject`, `FiboLighting`) ensuring the app strictly adheres to the Bria schema.
    *   `services/geminiService.ts`: Uses the `SCENE_SCHEMA` to force the LLM to output valid FIBO JSON.
*   **Why we used it:** To achieve deterministic control. Unlike standard diffusion models where "cinematic" is a guess, FIBO allows us to set `lighting.shadows: "Soft"` and `photographic_characteristics.lens_focal_length: "85mm"` explicitly.

### 2. Bria AI API (REST v2)
*   **What it is:** The primary generation engine.
*   **Where is the code?** 
    *   `services/fiboService.ts` -> function `generateViaRestV2`
*   **Why we used it:** It offers the highest fidelity and enterprise safety (indemnity). We construct a "SafeJSON" payload to prevent 422 errors and ensure all required fields (like `context` and `text_render`) are populated before sending to `https://engine.prod.bria-api.com/v2/image/generate`.

### 3. Google Gemini (Interpreter Agent)
*   **What it is:** The "brain" that translates human language to FIBO JSON.
*   **Where is the code?**
    *   `services/geminiService.ts`
*   **Why we used it:** We use `gemini-2.5-flash` because of its speed and superior ability to follow strict `responseSchema` instructions. It creates the bridge between a user typing "A cyberpunk cat" and the complex JSON required by FIBO.

### 4. Bria MCP (Model Context Protocol)
*   **What it is:** A standardized way to connect AI assistants to tools.
*   **Where is the code?**
    *   `services/fiboService.ts` -> function `generateViaMcp`
*   **Integration:** We implemented this as a **fallback strategy**. If the primary REST API fails or times out, the system automatically degrades gracefully to use the MCP endpoint (`https://mcp.prod.bria-api.com/mcp`) via JSON-RPC calls.

### 5. ComfyUI & Hugging Face
*   **Integration:** 
    *   **Hugging Face:** The FIBO model weights and concepts hosted on HF served as the reference for building our `types.ts` schema definitions.
    *   **ComfyUI:** Referenced in `constants.ts` and `AgentsPanel.tsx`. The architecture is designed to support a WebSocket bridge to a local ComfyUI instance running FIBO nodes, allowing this web app to act as a remote control for a local render farm.

---

## 💻 Setup Instructions

### Prerequisites
*   Node.js (v16+)
*   NPM or Yarn
*   Google Gemini API Key
*   Bria API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/fibo-studio-os.git
    cd fibo-studio-os
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root:
    ```env
    # Your Google Gemini API Key
    API_KEY=AIzaSy...
    
    # Note: Bria Keys are currently managed in constants.ts for the hackathon demo, 
    # but should be moved here for production.
    ```

4.  **Run the Application**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 🧩 Key Code Snippets

### 1. The Strict Schema Definition (`types.ts`)
This ensures the UI and the API speak the exact same language.
```typescript
export interface FiboScene {
  short_description: string;
  objects: FiboObject[];
  lighting: {
    conditions: string;
    direction: string;
    shadows: string;
  };
  // ... strict typing
}
```

### 2. The Agent Logic (`geminiService.ts`)
Converting text to JSON with `responseSchema`.
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: finalPrompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: SCENE_SCHEMA // <--- The magic happens here
  }
});
```

### 3. The Generation Call (`fiboService.ts`)
Constructing the payload for Bria v2.
```typescript
const payload = {
  structured_prompt: JSON.stringify(safeJson), 
  sync: true,
  seed: seed,
  aspect_ratio: "1:1"
};
// POST to https://engine.prod.bria-api.com/v2/image/generate
```

---

## 🎨 Example Workflow

1.  **Input:** User types: *"A futuristic sneaker floating in a neon void."*
2.  **Pro Controls:** User locks **Lens** to "16mm" and **Angle** to "Low Angle".
3.  **Interpreter Agent:** Generates the following JSON:
    ```json
    {
      "short_description": "A futuristic sneaker floating...",
      "objects": [{ "description": "High-tech shoe", "location": "Center" }],
      "photographic_characteristics": {
        "lens_focal_length": "16mm",  // Enforced by Pro Controls
        "camera_angle": "Low angle"   // Enforced by Pro Controls
      },
      "lighting": { "conditions": "Neon", "direction": "Backlit", "shadows": "Hard" }
    }
    ```
4.  **Bria API:** Receives this JSON and renders the image with exact adherence to the 16mm focal length and low angle.

---

## 🏆 Hackathon Categories Addressed

*   **Best Overall:** A complete OS for visual production, integrating LLMs, JSON, and Image Gen.
*   **Best Controllability:** The "Pro Control Matrix" allows locking physical camera parameters.
*   **Best Agentic Workflow:** The "Batch Agent" forks creative intent into 4 distinct structured variations automatically.
*   **User Experience:** Includes a "Blueprint Library" and "Time Travel" history for professional iteration.

---

*Built with ❤️ for the Bria AI Hackathon.*
