export type Severity = 'high' | 'medium' | 'low';
// Allow user-created categories to share the plant profile model with built-ins.
export type Category = string;
export type TabId = 0 | 1 | 2 | 3 | 4;

export interface Watering {
  summer: string;
  winter: string;
  summerMl: number;
  winterMl: number;
}

export interface PlantDetails {
  watering: Watering;
  light: string;
  temp: string;
  warning?: string;
  tips: string[];
}

export interface NPK {
  n: number;
  p: number;
  k: number;
}

export interface Fertilizer {
  type: string;
  schedule: string;
  npk: NPK;
  npkLabel: string;
  method: string;
  extras: string[];
  avoid: string;
}

export interface Trick {
  icon: string;
  title: string;
  body: string;
}

export interface Disease {
  symptom: string;
  severity: Severity;
  cause: string;
  fix: string;
}

export interface Plant {
  id: string;
  name: string;
  latin: string;
  category: Category;
  pot: string;
  substrate: string;
  potSize: string;
  color: string;
  accent: string;
  icon: React.FC<{ accent: string }>;
  details: PlantDetails;
  fertilizer: Fertilizer;
  tricks: Trick[];
  diseases: Disease[];
  // Track which custom care sections have user-provided content.
  customInfo?: { care: boolean; fertilizer: boolean; tricks: boolean; diseases: boolean };
  // Keep compressed user photos alongside the plant when rendering its card.
  photo?: string;
  // Let the profile renderer distinguish user plants without care guidance.
  isCustom?: boolean;
}

export interface CategoryDef {
  id: Category;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}
