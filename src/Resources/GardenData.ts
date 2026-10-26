export interface PlantSetup {
  substrate: string;
  potType: string;
  potMaterial: string;
  potSize: string;
  repotted: string;
}

export interface SavedPlant {
  id: string;
  name: string;
  source: 'built-in' | 'custom';
  setup?: PlantSetup;
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
  importData: () => Promise<GardenData | null>;
  openDataFolder: () => Promise<string>;
}

declare global {
  interface Window {
    gardenDesktop?: GardenDesktopBridge;
  }
}
