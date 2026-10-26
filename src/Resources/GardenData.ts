export interface PlantSetup {
  substrate: string;
  potType: string;
  potMaterial: string;
  potSize: string;
  pottedOn: string;
  repotted: string;
}

export type CareEventType = 'watering' | 'fertilizing' | 'potted' | 'repotted';

export type FertilizerMethod = 'Cucumber water' | 'Normal' | 'Banana Water';

export interface CareEvent {
  id: string;
  type: CareEventType;
  date: string;
  fertilizerMethod?: FertilizerMethod;
  potMaterial?: string;
  substrate?: string;
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
  setup?: PlantSetup;
  careEvents?: CareEvent[];
  photo?: string | null;
  icon?: string | null;
  details?: Record<string, unknown>;
}

export interface GardenData {
  formatVersion: 1;
  plants: SavedPlant[];
}

export interface GardenDesktopBridge {
  load: () => Promise<GardenData>;
  saveSetup: (plant: Pick<SavedPlant, 'id' | 'name' | 'setup'>) => Promise<GardenData>;
  logCareEvent: (payload: { id: string; name: string; event: CareEvent }) => Promise<GardenData>;
  importData: () => Promise<GardenData | null>;
  openDataFolder: () => Promise<string>;
}

declare global {
  interface Window {
    gardenDesktop?: GardenDesktopBridge;
  }
}
