import type { GardenData, GardenOptions, SavedCategory, SavedPlant } from './GardenData';

const optionKeys: (keyof GardenOptions)[] = ['fertilizers', 'potMaterials', 'soils', 'rooms'];

// Validate browser/mobile imports before writing any of the app's saved data.
export const parseGardenBackup = (value: unknown): GardenData => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The backup file is invalid.');
  const data = value as Partial<GardenData>;
  if (data.formatVersion !== 1 || !Array.isArray(data.plants) ||
      (data.categories !== undefined && !Array.isArray(data.categories)) ||
      (data.customOptions !== undefined && (!data.customOptions || typeof data.customOptions !== 'object' || Array.isArray(data.customOptions))) ||
      (data.deletedPlantIds !== undefined && !Array.isArray(data.deletedPlantIds)) ||
      (data.deletedCategoryIds !== undefined && !Array.isArray(data.deletedCategoryIds))) {
    throw new Error('This is not a supported Garden Schedule backup.');
  }

  const categories = (data.categories ?? []).map(category => {
    if (!category || typeof category.id !== 'string' || !category.id.trim() || typeof category.name !== 'string' || !category.name.trim()) {
      throw new Error('A category record is invalid.');
    }
    if (category.color !== undefined && (typeof category.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(category.color))) {
      throw new Error('A category color is invalid.');
    }
    return category as SavedCategory;
  });
  const customOptions = {} as GardenOptions;
  for (const key of optionKeys) {
    const values = data.customOptions?.[key] ?? [];
    if (!Array.isArray(values) || values.some(item => typeof item !== 'string' || !item.trim())) {
      throw new Error(`The ${key} options are invalid.`);
    }
    customOptions[key] = [...values];
  }
  const plants = data.plants.map(plant => {
    if (!plant || typeof plant.id !== 'string' || !plant.id.trim() || typeof plant.name !== 'string' || !plant.name.trim()) {
      throw new Error('A plant record is invalid.');
    }
    if (plant.source === 'custom' && (typeof plant.latin !== 'string' || typeof plant.categoryId !== 'string')) {
      throw new Error('A custom plant is missing its name or category.');
    }
    if (plant.photo !== undefined && plant.photo !== null) {
      const match = /^data:image\/(?:webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(plant.photo);
      if (!match) throw new Error(`The photo for ${plant.name} is invalid.`);
      const padding = match[1].endsWith('==') ? 2 : match[1].endsWith('=') ? 1 : 0;
      if (Math.floor(match[1].length * 3 / 4) - padding > 300 * 1024) throw new Error(`The photo for ${plant.name} exceeds 300 KB.`);
    }
    return { ...plant, source: plant.source === 'custom' ? 'custom' : 'built-in' } as SavedPlant;
  });
  const deletedPlantIds = data.deletedPlantIds ?? [];
  const deletedCategoryIds = data.deletedCategoryIds ?? [];
  if ([...deletedPlantIds, ...deletedCategoryIds].some(id => typeof id !== 'string' || !id.trim())) {
    throw new Error('The backup contains an invalid removal record.');
  }
  return { formatVersion: 1, categories, customOptions, plants, deletedPlantIds, deletedCategoryIds };
};

// Merge by record ID and carry deletion markers forward so imports cannot revive removed plants.
export const mergeGardenBackups = (current: GardenData, incoming: GardenData): GardenData => {
  const deletedPlantIds = Array.from(new Set([...current.deletedPlantIds, ...incoming.deletedPlantIds]));
  const deletedCategoryIds = Array.from(new Set([...current.deletedCategoryIds, ...incoming.deletedCategoryIds]));
  const categories = Array.from(new Map([...current.categories, ...incoming.categories].map(item => [item.id, item])).values())
    .filter(item => !deletedCategoryIds.includes(item.id));
  const customOptions = {} as GardenOptions;
  for (const key of optionKeys) {
    customOptions[key] = Array.from(new Set([...current.customOptions[key], ...incoming.customOptions[key]]));
  }
  const plants = Array.from(new Map([...current.plants, ...incoming.plants].map(item => [item.id, item])).values())
    .filter(item => !deletedPlantIds.includes(item.id) && !deletedCategoryIds.includes(item.categoryId ?? ''));
  return { formatVersion: 1, categories, customOptions, plants, deletedPlantIds, deletedCategoryIds };
};
