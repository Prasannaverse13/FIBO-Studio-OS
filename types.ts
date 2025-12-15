export interface FiboObject {
  description: string;
  location?: string;
  relationship?: string;
  relative_size?: string;
  shape_and_color?: string;
  texture?: string;
  appearance_details?: string;
  number_of_objects?: number;
  orientation?: string;
}

export interface FiboLighting {
  conditions: string;
  direction: string;
  shadows: string;
}

export interface FiboAesthetics {
  composition: string;
  color_scheme: string;
  mood_atmosphere: string;
}

export interface FiboPhotoChars {
  depth_of_field: string;
  focus: string;
  camera_angle: string;
  lens_focal_length: string;
}

// The official Bria "Structured Prompt" schema
export interface FiboScene {
  short_description: string;
  objects: FiboObject[];
  background_setting: string;
  lighting: FiboLighting;
  aesthetics: FiboAesthetics;
  photographic_characteristics: FiboPhotoChars;
  style_medium: 'photograph' | 'digital_art' | '3d_render' | 'oil_painting';
  // Required by Bria V2 API to avoid 422 Errors
  context: string; 
  artistic_style: string;
  // Optional for V2 but good to have in type
  text_render?: any[];
  // UI helper fields (optional, filtered out before sending if strict)
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3'; 
}

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrompt: string;
}

export interface GenerationResult {
  imageUrl: string;
  timestamp: number;
  config: FiboScene;
}

// New Types for Library and History
export interface LibraryBlueprint {
  id: string;
  category: 'E-Commerce' | 'Gaming' | 'Editorial' | 'Architecture';
  title: string;
  description: string;
  tags: string[];
  scene: FiboScene;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  scene: FiboScene;
  type: 'Generation' | 'Manual' | 'Library' | 'Batch';
  summary?: string;
}