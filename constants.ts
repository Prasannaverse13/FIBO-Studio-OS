import { WorkflowPreset, LibraryBlueprint } from './types';

// Hardcoded Fallback Keys (Provided by user permission)
const FALLBACK_BRIA_KEY = "bf50316c2ef443498852ca998ad1ab24";
const FALLBACK_MCP_KEY = "32caf2a9ea05406fac6b1228f48159da";

// Bria.ai Keys
// We check process.env first. If missing/empty, we use the hardcoded fallback.
export const BRIA_PRODUCTION_KEY = process.env.BRIA_API_KEY || FALLBACK_BRIA_KEY;
export const BRIA_MCP_API_KEY = process.env.BRIA_MCP_API_KEY || FALLBACK_MCP_KEY;
export const BRIA_STAGING_KEY = process.env.BRIA_STAGING_KEY || "";
export const BRIA_API_KEY = BRIA_PRODUCTION_KEY; 

// Legacy / Other Keys
export const FIBO_API_KEY_LEGACY = process.env.FIBO_API_KEY_LEGACY || "";
export const COMFY_API_KEY = process.env.COMFY_API_KEY || "";
export const MCP_API_KEY_LEGACY = process.env.MCP_API_KEY_LEGACY || "";

export const WORKFLOWS: WorkflowPreset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Studio',
    description: 'Clean background, perfect product lighting',
    icon: '🛍️',
    basePrompt: 'Create a high-end product shot on a clean background.'
  },
  {
    id: 'gaming',
    name: 'Gaming Asset',
    description: 'Dynamic poses, cinematic lighting',
    icon: '🎮',
    basePrompt: 'Create a fantasy game character concept art.'
  },
  {
    id: 'ads',
    name: 'Ad Campaign',
    description: 'Lifestyle context, vibrant colors',
    icon: '📢',
    basePrompt: 'Create a lifestyle advertisement scene.'
  }
];

export const DEFAULT_JSON: any = {
  "short_description": "Waiting for input...",
  "objects": [],
  "background_setting": "Studio grey",
  "lighting": {
    "conditions": "Studio",
    "direction": "Front",
    "shadows": "Soft"
  },
  "aesthetics": {
    "composition": "Centered",
    "color_scheme": "Neutral",
    "mood_atmosphere": "Professional"
  },
  "photographic_characteristics": {
    "depth_of_field": "Deep",
    "focus": "Sharp",
    "camera_angle": "Eye level",
    "lens_focal_length": "50mm"
  },
  "style_medium": "photograph",
  "context": "Professional studio production",
  "artistic_style": "realistic",
  "aspect_ratio": "1:1"
};

export const BLUEPRINT_LIBRARY: LibraryBlueprint[] = [
  {
    id: 'eco-cosmetic',
    category: 'E-Commerce',
    title: 'Minimalist Cosmetic Bottle',
    description: 'High-end skincare product on natural stone with soft dappled sunlight.',
    tags: ['product', 'skincare', 'natural', 'luxury'],
    scene: {
      short_description: "A luxury skincare serum bottle sitting on a beige travertine stone. Soft dappled sunlight creates organic shadows.",
      objects: [{ description: "Glass serum bottle with gold dropper", location: "Center", shape_and_color: "Cylindrical amber glass" }],
      background_setting: "Beige travertine stone surface with a blurred natural background",
      lighting: { conditions: "Natural sunlight with gobos", direction: "Side", shadows: "Dappled foliage" },
      aesthetics: { composition: "Rule of thirds", color_scheme: "Warm neutrals", mood_atmosphere: "Serene and organic" },
      photographic_characteristics: { depth_of_field: "Shallow", focus: "Sharp on label", camera_angle: "Slightly high angle", lens_focal_length: "85mm" },
      style_medium: "photograph",
      context: "Beauty advertisement",
      artistic_style: "realistic",
      aspect_ratio: "1:1"
    }
  },
  {
    id: 'cyberpunk-street',
    category: 'Gaming',
    title: 'Cyberpunk Street Samurai',
    description: 'Neon-lit futuristic warrior in a rain-slicked alleyway.',
    tags: ['scifi', 'character', 'neon', 'dark'],
    scene: {
      short_description: "A cybernetic street samurai standing in a rainy neon-lit alleyway at night.",
      objects: [{ description: "Cybernetic warrior holding a glowing katana", location: "Center", appearance_details: "Chrome plating, LED accents" }],
      background_setting: "Futuristic city alleyway with neon signs reflecting in puddles",
      lighting: { conditions: "Neon city lights", direction: "Backlit and rim lighting", shadows: "High contrast" },
      aesthetics: { composition: "Centered heroic", color_scheme: "Cyberpunk Cyan and Magenta", mood_atmosphere: "Gritty and intense" },
      photographic_characteristics: { depth_of_field: "Cinematic", focus: "Sharp on character", camera_angle: "Low angle", lens_focal_length: "35mm" },
      style_medium: "digital_art",
      context: "Video game concept art",
      artistic_style: "realistic",
      aspect_ratio: "16:9"
    }
  },
  {
    id: 'sneaker-float',
    category: 'E-Commerce',
    title: 'Levitating Sneaker',
    description: 'Dynamic floating sneaker shot with exploded elements.',
    tags: ['shoe', 'sport', 'dynamic', 'tech'],
    scene: {
      short_description: "A high-tech running shoe levitating in mid-air with deconstructed elements floating around it.",
      objects: [{ description: "Neon green and black running shoe", location: "Floating center", orientation: "Dynamic tilt" }],
      background_setting: "Abstract gradient studio background",
      lighting: { conditions: "Studio high-key", direction: "Multi-point", shadows: "Minimal" },
      aesthetics: { composition: "Dynamic diagonal", color_scheme: "Vibrant neon", mood_atmosphere: "Energetic" },
      photographic_characteristics: { depth_of_field: "Deep", focus: "Sharp throughout", camera_angle: "Eye level", lens_focal_length: "50mm" },
      style_medium: "photograph",
      context: "Sportswear advertisement",
      artistic_style: "realistic",
      aspect_ratio: "1:1"
    }
  },
  {
    id: 'arch-modern',
    category: 'Architecture',
    title: 'Modern Concrete Villa',
    description: 'Minimalist concrete architecture at blue hour.',
    tags: ['house', 'exterior', 'modern', 'dusk'],
    scene: {
      short_description: "Exterior of a modern concrete villa at dusk (blue hour) with warm interior lights glowing.",
      objects: [{ description: "Modern concrete house structure", location: "Mid-ground", appearance_details: "Clean lines, glass windows" }],
      background_setting: "Manicured lawn and twilight sky",
      lighting: { conditions: "Blue hour twilight", direction: "Ambient", shadows: "Soft" },
      aesthetics: { composition: "Wide symmetrical", color_scheme: "Cool blue and warm orange", mood_atmosphere: "Luxurious and calm" },
      photographic_characteristics: { depth_of_field: "Deep", focus: "Sharp", camera_angle: "Eye level", lens_focal_length: "24mm" },
      style_medium: "photograph",
      context: "Architectural visualization",
      artistic_style: "realistic",
      aspect_ratio: "16:9"
    }
  }
];