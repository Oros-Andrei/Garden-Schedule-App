import type { Disease, Fertilizer, PlantDetails, Trick } from './Types';

export interface PlantSetup {
  substrate: string;
  potType: string;
  potMaterial: string;
  potSize: string;
  room: string;
  pottedOn: string;
  repotted: string;
}

// Location is recorded as a dated calendar event, separate from plant setup.
export type CareEventType = 'watering' | 'fertilizing' | 'potted' | 'repotted' | 'location';

// Fertilizer methods can include user-added names configured in Settings.
export type FertilizerMethod = string;

export interface CareEvent {
  id: string;
  type: CareEventType;
  date: string;
  fertilizerMethod?: FertilizerMethod;
  potMaterial?: string;
  substrate?: string;
  // Keep a room selection on its dated event so calendar history stays explicit.
  room?: string;
}

export interface CalendarCareEvent {
  plantId: string;
  plantName: string;
  event: CareEvent;
}

export interface SavedPlant {
  id: string;
  name: string;
  source: 'built-in' | 'custom';
  // Preserve the minimum identity needed to rebuild a custom plant profile.
  latin?: string;
  categoryId?: string;
  setup?: PlantSetup;
  careEvents?: CareEvent[];
  photo?: string | null;
  icon?: string | null;
  details?: PlantDetails;
  fertilizer?: Fertilizer;
  tricks?: Trick[];
  diseases?: Disease[];
}

// Save one plant profile section while preserving its other saved data.
export type PlantProfileContentUpdate =
  | { section: 'care'; details: PlantDetails }
  | { section: 'fertilizer'; fertilizer: Fertilizer }
  | { section: 'tricks'; tricks: Trick[] }
  | { section: 'diseases'; diseases: Disease[] };

// Store categories independently so categories without plants are retained.
export interface SavedCategory {
  id: string;
  name: string;
  // Preserve a user-selected category color in browser data and JSON backups.
  color?: string;
}

// These additions flow into setup and calendar pickers and persist in garden data.
export interface GardenOptions {
  fertilizers: string[];
  potMaterials: string[];
  soils: string[];
  rooms: string[];
}

export interface GardenData {
  formatVersion: 1;
  categories: SavedCategory[];
  customOptions: GardenOptions;
  plants: SavedPlant[];
  // Preserve removals of built-in catalog entries across restarts and backups.
  deletedPlantIds: string[];
  deletedCategoryIds: string[];
}

export interface GardenDesktopBridge {
  load: () => Promise<GardenData>;
  saveSetup: (plant: Pick<SavedPlant, 'id' | 'name' | 'setup'>) => Promise<GardenData>;
  // Keep compressed photos in the desktop data file for built-in and custom plants.
  savePlantPhoto: (plant: Pick<SavedPlant, 'id' | 'name' | 'source' | 'photo'>) => Promise<GardenData>;
  logCareEvent: (payload: { id: string; name: string; event: CareEvent }) => Promise<GardenData>;
  // Remove a calendar record and optionally persist its matching setup-date update.
  deleteCareEvent: (payload: {
    id: string; name: string; source: SavedPlant['source']; eventId: string;
    type: CareEventType; date: string; setup?: PlantSetup;
  }) => Promise<GardenData>;
  // Persist custom identities through the same desktop data file as built-in care records.
  saveCustomCategory: (category: SavedCategory) => Promise<GardenData>;
  saveCustomPlant: (plant: Pick<SavedPlant, 'id' | 'name' | 'latin' | 'categoryId' | 'source'> &
    Partial<Pick<SavedPlant, 'details' | 'fertilizer' | 'tricks' | 'diseases'>>) => Promise<GardenData>;
  // Persist built-in or custom profile guidance without changing catalog identity.
  savePlantProfileContent: (payload: { id: string; name: string; source: SavedPlant['source']; update: PlantProfileContentUpdate }) => Promise<GardenData>;
  deletePlant: (id: string) => Promise<GardenData>;
  deleteCategory: (payload: { id: string; plantIds: string[] }) => Promise<GardenData>;
  saveCustomOptions: (options: GardenOptions) => Promise<GardenData>;
  importData: () => Promise<GardenData | null>;
  openDataFolder: () => Promise<string>;
}

declare global {
  interface Window {
    gardenDesktop?: GardenDesktopBridge;
    gardenInitialPhotos?: Record<string, string>;
  }
}
