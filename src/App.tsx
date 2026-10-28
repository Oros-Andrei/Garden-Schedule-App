import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, FERTILIZER_OPTIONS, PLANTS, POT_MATERIAL_OPTIONS, SOIL_OPTIONS } from './Resources/Constants';
import type { CareEvent, GardenData, GardenOptions, PlantProfileContentUpdate, PlantSetup, SavedCategory, SavedPlant } from './Resources/GardenData';
import type { Plant } from './Resources/Types';
import { CustomPlantIcon } from './Resources/Icons';
import { Emoji } from './Resources/Emoji';
import Button from './Components/Button';
import Dropdown from './Components/Dropdown';
import StyledScrollArea from './Components/StyledScrollArea';
import GardenCalendar from './Components/GardenCalendar';
import PlantDetail from './Components/PlantDetail';
import { loadPlantPhotos, removePlantPhotos, savePlantPhoto as saveBrowserPlantPhoto } from './Resources/PlantPhotoStore';

const MAX_PLANT_PHOTO_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_PLANT_PHOTO_OUTPUT_BYTES = 300 * 1024;

// Resize and re-encode uploads so plant photos stay small in backups and storage.
const compressPlantPhoto = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > MAX_PLANT_PHOTO_INPUT_BYTES) throw new Error('Choose a photo that is 10 MB or less.');
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo compression is unavailable in this window.');
    for (const maxDimension of [1200, 1000, 800, 640, 512, 400]) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42, 0.32]) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        let photo = canvas.toDataURL('image/webp', quality);
        if (!photo.startsWith('data:image/webp;')) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          photo = canvas.toDataURL('image/jpeg', quality);
        }
        const encoded = photo.slice(photo.indexOf(',') + 1);
        const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
        if (Math.floor(encoded.length * 3 / 4) - padding <= MAX_PLANT_PHOTO_OUTPUT_BYTES) return photo;
      }
    }
    throw new Error('This photo could not be compressed below 300 KB. Choose another image.');
  } finally {
    bitmap.close();
  }
};

const loadCustomCategories = (): SavedCategory[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('garden-custom-categories') ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is SavedCategory =>
      item && typeof item.id === 'string' && typeof item.name === 'string') : [];
  } catch { return []; }
};

const loadCustomPlants = (): SavedPlant[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('garden-custom-plants') ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is SavedPlant =>
      item && item.source === 'custom' && typeof item.id === 'string' && typeof item.name === 'string' &&
      typeof item.latin === 'string' && typeof item.categoryId === 'string') : [];
  } catch { return []; }
};

const loadBuiltInProfileOverrides = (): SavedPlant[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('garden-built-in-profile-overrides') ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is SavedPlant =>
      item && item.source === 'built-in' && typeof item.id === 'string' && typeof item.name === 'string' &&
      (item.details || item.fertilizer || item.tricks || item.diseases)) : [];
  } catch { return []; }
};

const emptyCustomOptions: GardenOptions = { fertilizers: [], potMaterials: [], soils: [] };

const loadCustomOptions = (): GardenOptions => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('garden-custom-options') ?? '{}');
    if (!value || typeof value !== 'object') return emptyCustomOptions;
    const options = value as Partial<GardenOptions>;
    return {
      fertilizers: Array.isArray(options.fertilizers) ? options.fertilizers.filter((item): item is string => typeof item === 'string') : [],
      potMaterials: Array.isArray(options.potMaterials) ? options.potMaterials.filter((item): item is string => typeof item === 'string') : [],
      soils: Array.isArray(options.soils) ? options.soils.filter((item): item is string => typeof item === 'string') : [],
    };
  } catch { return emptyCustomOptions; }
};

const loadDeletedIds = (key: string): string[] => {
  // Keep removed catalog entries hidden after browser reloads.
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
};

const customPlantColors = [
  { color: '#B8D8A8', accent: '#4A7C3F' }, { color: '#D8C0E0', accent: '#7A4A8A' },
  { color: '#F0D0A0', accent: '#A06A20' }, { color: '#A8D8D0', accent: '#347A70' },
];

const toCustomPlant = (record: SavedPlant, index: number): Plant => {
  const palette = customPlantColors[index % customPlantColors.length];
  return {
    id: record.id, name: record.name, latin: record.latin ?? '', category: record.categoryId ?? 'custom',
    pot: 'Custom', substrate: 'General', potSize: 'Not set', color: palette.color, accent: palette.accent,
    icon: CustomPlantIcon, isCustom: true,
    photo: record.photo ?? undefined,
    details: record.details ?? { watering: { summer: '', winter: '', summerMl: 0, winterMl: 0 }, light: '', temp: '', tips: [] },
    fertilizer: record.fertilizer ?? { type: '', schedule: '', npk: { n: 0, p: 0, k: 0 }, npkLabel: '', method: '', extras: [], avoid: '' },
    tricks: record.tricks ?? [], diseases: record.diseases ?? [],
    customInfo: {
      care: Boolean(record.details), fertilizer: Boolean(record.fertilizer),
      tricks: Boolean(record.tricks?.length), diseases: Boolean(record.diseases?.length),
    },
  };
};

// Give custom categories more distinct colors before the palette repeats.
const customCategoryPalette = [
  '#4A8C3A', '#8B3A7A', '#C07010', '#C03020', '#347A70',
  '#365C9A', '#7A5A2D', '#6A4C93', '#2F7D5B', '#A33D5B',
  '#526B2D', '#996515', '#2A7185', '#7D3C98', '#B04A00',
  '#426B8A', '#7B4F3A', '#A23B72', '#4D6B3C', '#8A5A00',
  '#386B8F', '#6B5B95', '#8C3F2B', '#3F7C78', '#785C2F',
  '#9B3A36', '#536D87', '#6A7F27', '#72518B', '#AD5A18',
];
const optionDefaults: GardenOptions = {
  fertilizers: FERTILIZER_OPTIONS, potMaterials: POT_MATERIAL_OPTIONS, soils: SOIL_OPTIONS,
};
const optionLabels: Record<keyof GardenOptions, string> = {
  fertilizers: 'Fertilizer types', potMaterials: 'Pot materials', soils: 'Soil types',
};
// Explain what each Settings add action creates instead of repeating saved values.
const settingsDescriptions: Record<'categories' | keyof GardenOptions, string> = {
  categories: 'Add a new category to organize your plants.',
  fertilizers: 'Add a fertilizer type for plant care.',
  potMaterials: 'Add a pot material for plant setup.',
  soils: 'Add a soil type for plant setup.',
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<SavedCategory[]>(loadCustomCategories);
  const [customPlantRecords, setCustomPlantRecords] = useState<SavedPlant[]>(loadCustomPlants);
  const [builtInProfileOverrides, setBuiltInProfileOverrides] = useState<SavedPlant[]>(loadBuiltInProfileOverrides);
  const [plantPhotos, setPlantPhotos] = useState<Record<string, string>>(() => window.gardenInitialPhotos ?? {});
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState<GardenOptions>(loadCustomOptions);
  const [deletedPlantIds, setDeletedPlantIds] = useState<string[]>(() => loadDeletedIds('garden-deleted-plant-ids'));
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>(() => loadDeletedIds('garden-deleted-category-ids'));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpenId, setCategoryMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ message: string; onConfirm: () => Promise<void> } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const [addingPlantCategoryId, setAddingPlantCategoryId] = useState<string | null>(null);
  const [categoryNameDraft, setCategoryNameDraft] = useState('');
  const [optionDrafts, setOptionDrafts] = useState<Record<keyof GardenOptions, string>>({ fertilizers: '', potMaterials: '', soils: '' });
  const [plantNameDraft, setPlantNameDraft] = useState('');
  const [plantLatinDraft, setPlantLatinDraft] = useState('');
  const [plantCategoryDraft, setPlantCategoryDraft] = useState('');
  const [openCats,   setOpenCats]     = useState<Record<string, boolean>>({
    succulents: true, tropicals: true, citrus: true, vegetables: true,
  });

  // Load browser photos from IndexedDB; desktop photos arrive with the garden data file.
  useEffect(() => {
    if (window.gardenDesktop) return;
    void loadPlantPhotos().then(savedPhotos => setPlantPhotos(current => ({ ...savedPhotos, ...current })))
      .catch(() => setPhotoMessage('Saved plant photos could not be loaded from this browser.'));
  }, []);

  // Close the menu on pointer presses outside its container.
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [menuOpen]);

  // Close category actions when a pointer press lands outside their menu.
  useEffect(() => {
    if (!categoryMenuOpenId) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) setCategoryMenuOpenId(null);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [categoryMenuOpenId]);

  // Keep deleted defaults out of every view while retaining the fixed source catalog.
  const deletedPlantIdSet = new Set(deletedPlantIds);
  const deletedCategoryIdSet = new Set(deletedCategoryIds);
  const plants = [
    ...PLANTS.filter(plant => !deletedPlantIdSet.has(plant.id) && !deletedCategoryIdSet.has(plant.category))
      .map(plant => {
        const override = builtInProfileOverrides.find(record => record.id === plant.id);
        // Apply only editable guidance fields so built-in identity always comes from the catalog.
        return {
          ...plant,
          details: override?.details ?? plant.details,
          fertilizer: override?.fertilizer ?? plant.fertilizer,
          tricks: override?.tricks ?? plant.tricks,
          diseases: override?.diseases ?? plant.diseases,
          photo: plantPhotos[plant.id],
        };
      }),
    ...customPlantRecords
      .filter(plant => !deletedPlantIdSet.has(plant.id) && !deletedCategoryIdSet.has(plant.categoryId ?? ''))
      .map((plant, index) => ({ ...toCustomPlant(plant, index), photo: plantPhotos[plant.id] ?? plant.photo ?? undefined })),
  ];
  const categories = [
    ...CATEGORIES.filter(category => !deletedCategoryIdSet.has(category.id)),
    ...customCategories.filter(category => !deletedCategoryIdSet.has(category.id)).map((category, index) => {
      const color = customCategoryPalette[index % customCategoryPalette.length];
      return { id: category.id, label: category.name, emoji: Emoji.seedling, color, bg: `${color}20` };
    }),
  ];
  // Merge configured additions with the fixed built-in choices used across all forms.
  const availableOptions: GardenOptions = {
    fertilizers: Array.from(new Set([...optionDefaults.fertilizers, ...customOptions.fertilizers])),
    potMaterials: Array.from(new Set([...optionDefaults.potMaterials, ...customOptions.potMaterials])),
    soils: Array.from(new Set([...optionDefaults.soils, ...customOptions.soils])),
  };
  const selectedPlant = plants.find(p => p.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  // Compress each selected image before saving it in browser or desktop storage.
  const uploadPlantPhoto = async (plant: Plant, file: File) => {
    setPhotoMessage(null);
    try {
      const photo = await compressPlantPhoto(file);
      if (window.gardenDesktop) {
        await window.gardenDesktop.savePlantPhoto({
          id: plant.id, name: plant.name, source: plant.isCustom ? 'custom' : 'built-in', photo,
        });
      } else {
        await saveBrowserPlantPhoto(plant.id, photo);
      }
      setPlantPhotos(current => ({ ...current, [plant.id]: photo }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The plant photo could not be saved.';
      setPhotoMessage(message);
    }
  };

  const toggleCat = (id: string) => {
    setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Save category identity before rendering it so it survives reloads and backups.
  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = categoryNameDraft.trim();
    if (!name) return;
    if (categories.some(category => category.label.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      window.alert('A category with that name already exists.');
      return;
    }
    const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    const record: SavedCategory = { id, name };
    try {
      if (window.gardenDesktop) await window.gardenDesktop.saveCustomCategory(record);
      const updated = [...customCategories, record];
      try { localStorage.setItem('garden-custom-categories', JSON.stringify(updated)); }
      catch { /* Desktop storage is authoritative; retain the new category in this session. */ }
      setCustomCategories(updated);
      setOpenCats(current => ({ ...current, [id]: true }));
      setCategoryNameDraft('');
    } catch (error) {
      console.error('Unable to save the category.', error);
      window.alert('The category could not be saved.');
    }
  };

  // Persist plant tombstones so built-in and custom removals survive restarts.
  const deletePlant = async (plantId: string) => {
    const record = plants.find(plant => plant.id === plantId);
    if (!record) return;
    try {
      if (window.gardenDesktop) await window.gardenDesktop.deletePlant(plantId);
      const updatedDeletedIds = Array.from(new Set([...deletedPlantIds, plantId]));
      const updatedCustomPlants = customPlantRecords.filter(plant => plant.id !== plantId);
      // Remove guidance with its plant so browser backups cannot restore deleted overrides.
      const updatedProfileOverrides = builtInProfileOverrides.filter(plant => plant.id !== plantId);
      try {
        localStorage.setItem('garden-deleted-plant-ids', JSON.stringify(updatedDeletedIds));
        localStorage.setItem('garden-custom-plants', JSON.stringify(updatedCustomPlants));
        localStorage.setItem('garden-built-in-profile-overrides', JSON.stringify(updatedProfileOverrides));
        localStorage.removeItem(`garden-setup-${plantId}`);
        localStorage.removeItem(`garden-care-events-${plantId}`);
      } catch (error) { if (!window.gardenDesktop) throw error; }
      setDeletedPlantIds(updatedDeletedIds);
      setCustomPlantRecords(updatedCustomPlants);
      setBuiltInProfileOverrides(updatedProfileOverrides);
      // Drop the saved image with the plant so deleted photos do not linger in storage.
      setPlantPhotos(current => {
        const updated = { ...current };
        delete updated[plantId];
        return updated;
      });
      if (!window.gardenDesktop) void removePlantPhotos([plantId]).catch(() => {});
      setSelectedId(current => current === plantId ? null : current);
    } catch (error) {
      console.error('Unable to delete the plant.', error);
      window.alert('The plant could not be deleted.');
    }
  };

  // Remove every plant in a category and persist IDs for deleted built-in entries.
  const deleteCategory = async (categoryId: string) => {
    const category = categories.find(item => item.id === categoryId);
    if (!category) return;
    const categoryPlants = plants.filter(plant => plant.category === categoryId);
    const removedPlantIds = new Set(categoryPlants.map(plant => plant.id));
    try {
      if (window.gardenDesktop) await window.gardenDesktop.deleteCategory({ id: categoryId, plantIds: [...removedPlantIds] });
      const updatedDeletedPlantIds = Array.from(new Set([...deletedPlantIds, ...removedPlantIds]));
      const updatedDeletedCategoryIds = Array.from(new Set([...deletedCategoryIds, categoryId]));
      const updatedCategories = customCategories.filter(item => item.id !== categoryId);
      const updatedPlants = customPlantRecords.filter(plant => !removedPlantIds.has(plant.id));
      // Drop built-in guidance overrides along with every plant removed from this category.
      const updatedProfileOverrides = builtInProfileOverrides.filter(plant => !removedPlantIds.has(plant.id));
      try {
        localStorage.setItem('garden-deleted-plant-ids', JSON.stringify(updatedDeletedPlantIds));
        localStorage.setItem('garden-deleted-category-ids', JSON.stringify(updatedDeletedCategoryIds));
        localStorage.setItem('garden-custom-categories', JSON.stringify(updatedCategories));
        localStorage.setItem('garden-custom-plants', JSON.stringify(updatedPlants));
        localStorage.setItem('garden-built-in-profile-overrides', JSON.stringify(updatedProfileOverrides));
        removedPlantIds.forEach(plantId => {
          localStorage.removeItem(`garden-setup-${plantId}`);
          localStorage.removeItem(`garden-care-events-${plantId}`);
        });
      } catch (error) { if (!window.gardenDesktop) throw error; }
      setDeletedPlantIds(updatedDeletedPlantIds);
      setDeletedCategoryIds(updatedDeletedCategoryIds);
      setCustomCategories(updatedCategories);
      setCustomPlantRecords(updatedPlants);
      setBuiltInProfileOverrides(updatedProfileOverrides);
      // Remove photos alongside every plant deleted with this category.
      setPlantPhotos(current => {
        const updated = { ...current };
        removedPlantIds.forEach(plantId => delete updated[plantId]);
        return updated;
      });
      if (!window.gardenDesktop) void removePlantPhotos([...removedPlantIds]).catch(() => {});
      setSelectedId(current => current && removedPlantIds.has(current) ? null : current);
    } catch (error) {
      console.error('Unable to delete the category.', error);
      window.alert('The category could not be deleted.');
    }
  };

  // Keep deletion confirmations inside the app so the warning matches its interface.
  const requestDeletePlant = (plantId: string) => {
    const record = plants.find(plant => plant.id === plantId);
    if (record) setDeleteConfirmation({
      message: `Delete ${record.name}? Its setup and care events will also be deleted.`,
      onConfirm: () => deletePlant(plantId),
    });
  };

  const requestDeleteCategory = (categoryId: string) => {
    const category = categories.find(item => item.id === categoryId);
    if (!category) return;
    const categoryLabel = category.label; // Both built-in and custom category records expose their display name as a label.
    const count = plants.filter(plant => plant.category === categoryId).length;
    const plantSummary = count
      ? ` This will also delete ${count} plant${count === 1 ? '' : 's'} and their setup and care events.`
      : '';
    setDeleteConfirmation({
      message: `Delete the ${categoryLabel} category?${plantSummary}`,
      onConfirm: () => deleteCategory(categoryId),
    });
  };

  // Persist additions once so setup, calendar, and backup views see the same choices.
  const saveOption = async (key: keyof GardenOptions, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = optionDrafts[key].trim();
    if (!name) return;
    if (availableOptions[key].some(option => option.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      window.alert(`${name} is already in ${optionLabels[key].toLowerCase()}.`);
      return;
    }
    const updated: GardenOptions = { ...customOptions, [key]: [...customOptions[key], name] };
    try {
      if (window.gardenDesktop) await window.gardenDesktop.saveCustomOptions(updated);
      try { localStorage.setItem('garden-custom-options', JSON.stringify(updated)); }
      catch (error) { if (!window.gardenDesktop) throw error; }
      setCustomOptions(updated);
      setOptionDrafts(current => ({ ...current, [key]: '' }));
    } catch (error) {
      console.error(`Unable to save ${optionLabels[key].toLowerCase()}.`, error);
      window.alert(`The ${optionLabels[key].toLowerCase()} could not be saved.`);
    }
  };

  // Store new identities in the selected category and open the profile for immediate setup.
  const savePlant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = plantNameDraft.trim();
    const latin = plantLatinDraft.trim();
    const categoryId = plantCategoryDraft || addingPlantCategoryId || '';
    if (!name || !latin || !categoryId) return;
    const record: SavedPlant = {
      id: `custom-plant-${Date.now()}`, name, latin, categoryId, source: 'custom', careEvents: [],
    };
    try {
      if (window.gardenDesktop) await window.gardenDesktop.saveCustomPlant(record);
      const updated = [...customPlantRecords, record];
      try { localStorage.setItem('garden-custom-plants', JSON.stringify(updated)); }
      catch { /* Desktop storage is authoritative; retain the new plant in this session. */ }
      setCustomPlantRecords(updated);
      setSelectedId(record.id);
      setOpenCats(current => ({ ...current, [categoryId]: true }));
      setPlantNameDraft('');
      setPlantLatinDraft('');
      setPlantCategoryDraft('');
      setAddingPlantCategoryId(null);
    } catch (error) {
      console.error('Unable to save the plant.', error);
      window.alert('The plant could not be saved.');
    }
  };

  // Save a profile section by plant source while preserving setup, photos, and other guidance.
  const savePlantProfileContent = async (plant: Plant, update: PlantProfileContentUpdate): Promise<boolean> => {
    const records = plant.isCustom ? customPlantRecords : builtInProfileOverrides;
    const currentRecord = records.find(record => record.id === plant.id) ?? {
      id: plant.id, name: plant.name, source: plant.isCustom ? 'custom' as const : 'built-in' as const,
    };
    const content = update.section === 'care' ? { details: update.details }
      : update.section === 'fertilizer' ? { fertilizer: update.fertilizer }
      : update.section === 'tricks' ? { tricks: update.tricks }
      : { diseases: update.diseases };
    const updatedRecord = { ...currentRecord, ...content };
    const updatedPlants = records.some(record => record.id === plant.id)
      ? records.map(record => record.id === plant.id ? updatedRecord : record)
      : [...records, updatedRecord];
    try {
      if (window.gardenDesktop) await window.gardenDesktop.savePlantProfileContent({
        id: plant.id, name: plant.name, source: plant.isCustom ? 'custom' : 'built-in', update,
      });
      const storageKey = plant.isCustom ? 'garden-custom-plants' : 'garden-built-in-profile-overrides';
      try { localStorage.setItem(storageKey, JSON.stringify(updatedPlants)); }
      catch (error) { if (!window.gardenDesktop) throw error; }
      if (plant.isCustom) setCustomPlantRecords(updatedPlants);
      else setBuiltInProfileOverrides(updatedPlants);
      return true;
    } catch (error) {
      console.error('Unable to save plant profile information.', error);
      window.alert('The plant information could not be saved.');
      return false;
    }
  };

  const createBrowserBackup = (): GardenData => {
    const plants: SavedPlant[] = PLANTS
      .filter(plant => !deletedPlantIdSet.has(plant.id) && !deletedCategoryIdSet.has(plant.category))
      .flatMap(plant => {
        let savedSetup: Partial<PlantSetup> = {};
        let savedSoil: string | null = null;
        let careEvents: CareEvent[] = [];
        try {
          const setupValue = localStorage.getItem(`garden-setup-${plant.id}`);
          if (setupValue) savedSetup = JSON.parse(setupValue) as Partial<PlantSetup>;
          savedSoil = localStorage.getItem(`garden-soil-${plant.id}`);
          const careValue = localStorage.getItem(`garden-care-events-${plant.id}`);
          if (careValue) careEvents = JSON.parse(careValue) as CareEvent[];
        } catch {
          // Skip malformed browser records; the original browser data remains untouched.
          return [];
        }

        const photo = plantPhotos[plant.id] ?? null;
        const profileOverride = builtInProfileOverrides.find(record => record.id === plant.id);
        if (!Object.keys(savedSetup).length && !savedSoil && careEvents.length === 0 && !photo && !profileOverride) return [];

        const setup: PlantSetup = {
          substrate: typeof savedSetup.substrate === 'string' ? savedSetup.substrate : savedSoil ?? 'General',
          potType: typeof savedSetup.potType === 'string' ? savedSetup.potType : 'Custom',
          potMaterial: typeof savedSetup.potMaterial === 'string' ? savedSetup.potMaterial : plant.pot,
          potSize: typeof savedSetup.potSize === 'string' ? savedSetup.potSize : plant.potSize,
          pottedOn: typeof savedSetup.pottedOn === 'string' ? savedSetup.pottedOn : '',
          repotted: typeof savedSetup.repotted === 'string' ? savedSetup.repotted : '',
        };

        return [{ ...profileOverride, id: plant.id, name: plant.name, source: 'built-in', setup, careEvents, photo, icon: null }];
      });

    const customPlants = customPlantRecords
      .filter(plant => !deletedPlantIdSet.has(plant.id) && !deletedCategoryIdSet.has(plant.categoryId ?? ''))
      .map(plant => {
        try {
          const setupValue = localStorage.getItem(`garden-setup-${plant.id}`);
          const careValue = localStorage.getItem(`garden-care-events-${plant.id}`);
          return {
            ...plant,
            photo: plantPhotos[plant.id] ?? plant.photo ?? null,
            ...(setupValue ? { setup: JSON.parse(setupValue) } : {}),
            careEvents: careValue ? JSON.parse(careValue) as CareEvent[] : plant.careEvents ?? [],
          };
        } catch {
          return plant;
        }
      });

    return {
      formatVersion: 1, categories: customCategories, customOptions, plants: [...plants, ...customPlants],
      deletedPlantIds, deletedCategoryIds,
    };
  };

  const exportGardenData = async () => {
    try {
      const backup = await window.gardenDesktop?.load() ?? createBrowserBackup();
      const content = new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: 'application/json' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'garden-data.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Unable to export the garden data file.', error);
      window.alert('Garden data could not be exported.');
    }
  };

  const importGardenData = async () => {
    if (!window.gardenDesktop) return;
    if (!window.confirm('Import a garden backup? Matching plant records in this app will be replaced by the backup.')) return;
    try {
      const imported = await window.gardenDesktop.importData();
      if (!imported) return;
      window.location.reload();
    } catch (error) {
      console.error('Unable to import the garden data file.', error);
      window.alert('That garden data file could not be imported. Your current data was left unchanged.');
    }
  };

  const openGardenDataFolder = async () => {
    try {
      const error = await window.gardenDesktop?.openDataFolder();
      if (error) window.alert(`Could not open the garden data folder: ${error}`);
    } catch (error) {
      console.error('Unable to open the garden data folder.', error);
    }
  };

  return (
    <div className="garden-app" style={{
      fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
      background: 'linear-gradient(135deg,#F0F7E8 0%,#E8F4E0 50%,#F5EFE0 100%)',
      minHeight: '100vh',
    }}>
      <style>{`
        html { scrollbar-gutter: stable; }
        @media (min-width: 800px) {
          /* Keep the desktop home view within the viewport so its calendar stays stationary. */
          .garden-app { display: flex; flex-direction: column; height: 100vh; min-height: 0 !important; overflow: hidden; }
          .garden-header { flex: 0 0 auto; }
          .garden-layout { display: flex !important; align-items: flex-start; gap: 24px; padding: 0 32px 32px !important; width: 100%; max-width: none !important; flex: 1; min-height: 0; overflow: hidden; }
          /* Confine desktop scrolling to the plant list and profile panels. */
          .garden-sidebar { width: 40%; min-width: 320px; max-width: 560px; height: 100%; max-height: 100%; overscroll-behavior: contain; flex-shrink: 0; padding-top: 0 !important; }
          /* Keep the menu available above categories while the plant list scrolls. */
          .garden-menu-row { position: sticky; top: 0; z-index: 5; padding: 0 0 10px; background: #EDF6E8; }
          .garden-plant-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .garden-detail  { flex: 1; min-width: 0; max-height: 100%; margin: 0 !important; position: sticky; top: 20px; }
          .garden-empty   { flex: 1; min-width: 0; min-height: 0; height: 100%; position: sticky; top: 0; }
        }
        @media (max-width: 799px) {
          .garden-detail  { margin: 16px 14px 28px !important; }
          .garden-empty   { display: block !important; margin: 16px 14px 28px; }
        }
        .setup-calendar-layout { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: start; }
        @media (min-width: 800px) {
          .setup-calendar-layout { grid-template-columns: minmax(320px, 35fr) minmax(0, 65fr); align-items: center; }
        }
        .setup-grid { display: grid; grid-template-columns: max-content minmax(0, 1fr); column-gap: 10px; row-gap: 14px; align-items: center; }
        @media (max-width: 480px) {
          .setup-grid { grid-template-columns: max-content minmax(0, 1fr); column-gap: 6px; row-gap: 12px; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="garden-header" style={{ textAlign: 'center', padding: '28px 20px 18px' }}>
        <h1 style={{ fontSize: 26, color: '#2A4A1A', margin: 0 }}>Plant Care Guide</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {window.gardenDesktop && (
            <>
              <button type="button" onClick={importGardenData} style={{ cursor: 'pointer', border: '1px solid #B8D0A8', borderRadius: 8, background: '#FFFFFFCC', color: '#3A5A2A', padding: '6px 10px', font: 'inherit', fontSize: 13 }}>
                Import JSON backup
              </button>
              <button type="button" onClick={openGardenDataFolder} style={{ cursor: 'pointer', border: '1px solid #B8D0A8', borderRadius: 8, background: '#FFFFFFCC', color: '#3A5A2A', padding: '6px 10px', font: 'inherit', fontSize: 13 }}>
                Open data folder
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className={`garden-layout${selectedPlant ? ' has-selection' : ''}`} style={{ padding: '0 14px 32px', maxWidth: 480, margin: '0 auto' }}>

        {/* LEFT — categories + plant grid */}
        {/* Keep the category list independently scrollable with the shared scrollbar. */}
        <StyledScrollArea className="garden-sidebar" ariaLabel="Plant categories and plants" viewportStyle={{ paddingTop: 0, overscrollBehavior: 'contain' }}>
          {/* Keep garden-wide actions together above the plant categories. */}
          <div className="garden-menu-row">
            <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
              <Button onClick={() => setMenuOpen(open => !open)} icon="☰" color="#4A8C3A" ariaLabel="Menu">Menu</Button>
              {menuOpen && (
                <div role="group" aria-label="Menu options" style={{
                  position: 'absolute', top: 'calc(100% + 5px)', left: 0, zIndex: 20,
                  display: 'grid', gap: 7, minWidth: 220, padding: 10,
                  border: '1px solid #D5E2CB', borderRadius: 14,
                  background: 'rgba(255,255,255,0.98)',
                  boxShadow: '0 8px 22px rgba(35,65,25,0.16)',
                }}>
                  <Button onClick={() => { setMenuOpen(false); setSettingsOpen(true); }} icon="⚙️" color="#4A8C3A">Settings</Button>
                  <Button onClick={() => { setMenuOpen(false); exportGardenData(); }} icon={Emoji.download} color="#4A8C3A">Export JSON backup</Button>
                </div>
              )}
            </div>
          </div>
          {photoMessage && <div role="alert" style={{ margin: '4px 0 10px', padding: '8px 12px', borderRadius: 10, background: '#FFF3EF', color: '#A33D36', fontSize: 13 }}>
            {photoMessage}
          </div>}
          {categories.map(cat => {
            const catPlants = plants.filter(p => p.category === cat.id);
            const isOpen = openCats[cat.id];

            return (
              <div key={cat.id} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 7, marginBottom: isOpen ? 10 : 0 }}>
                  <button
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      flex: 1, background: cat.bg, border: 'none', borderRadius: 14,
                      padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</span>
                    <span style={{ fontSize: 14, color: cat.color, opacity: 0.7, marginLeft: 'auto' }}>
                      {catPlants.length} plant{catPlants.length === 1 ? '' : 's'}
                    </span>
                    <span aria-hidden="true" style={{
                      fontSize: 14, color: cat.color,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s', display: 'inline-block',
                    }}>▾</span>
                  </button>
                  {/* Label the category controls as Options for quick recognition. */}
                  <div ref={categoryMenuOpenId === cat.id ? categoryMenuRef : null} style={{ position: 'relative' }}>
                    <Button onClick={() => setCategoryMenuOpenId(openId => openId === cat.id ? null : cat.id)}
                      icon="⚙️" color="#4A8C3A" ariaLabel={`Options for ${cat.label}`}>Options</Button>
                    {categoryMenuOpenId === cat.id && (
                      <div role="group" aria-label={`${cat.label} actions`} style={{
                        position: 'absolute', top: 'calc(100% + 5px)', right: 0, zIndex: 20,
                        display: 'grid', gap: 7, minWidth: 190, padding: 10,
                        border: '1px solid #D5E2CB', borderRadius: 14,
                        background: 'rgba(255,255,255,0.98)',
                        boxShadow: '0 8px 22px rgba(35,65,25,0.16)',
                      }}>
                        <Button onClick={() => {
                          setCategoryMenuOpenId(null);
                          setPlantCategoryDraft(cat.id);
                          setAddingPlantCategoryId(cat.id);
                        }} icon={Emoji.plus} color="#4A8C3A">Add a plant</Button>
                        <Button onClick={() => {
                          setCategoryMenuOpenId(null);
                          requestDeleteCategory(cat.id);
                        }} icon="🗑️" color="#C04040">Delete category</Button>
                      </div>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="garden-plant-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {catPlants.map(p => (
                      <div key={p.id} style={{
                          background: selectedId === p.id ? p.color : 'rgba(255,255,255,0.85)',
                          border: `2.5px solid ${selectedId === p.id ? p.accent : 'rgba(120,160,90,0.2)'}`,
                          borderRadius: 18, position: 'relative', overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          boxShadow: selectedId === p.id ? `0 4px 18px ${p.color}99` : '0 2px 8px rgba(0,0,0,0.05)',
                          transform: 'none',
                        }}>
                        {/* Keep photo selection separate from the plant-profile button. */}
                        <button type="button" onClick={() => handleSelect(p.id)} aria-label={`Open ${p.name} profile`}
                          aria-pressed={selectedId === p.id} style={{
                            width: '100%', minHeight: 103, padding: '11px 6px 9px', border: 'none', borderRadius: 15,
                            background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 5,
                          }}>
                          {p.photo ? (
                            <img src={p.photo} alt={`${p.name}`} style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 12 }} />
                          ) : (
                            <div style={{ width: 58, height: 58 }}><p.icon accent={p.accent} /></div>
                          )}
                          <div style={{ fontSize: 14, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
                            color: selectedId === p.id ? p.accent : '#3A5A2A' }}>
                            {p.name}
                          </div>
                        </button>
                        {/* Use a single-color camera glyph so the photo action stays centered and clear. */}
                        <Button onClick={() => document.getElementById(`plant-photo-${p.id}`)?.click()} icon={
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
                            <circle cx="12" cy="13" r="3.5" />
                          </svg>
                        }
                          color="#4A8C3A" ariaLabel={`Add or change ${p.name} photo`} title={`Add or change ${p.name} photo`}
                          size="compact" style={{ position: 'absolute', top: 5, right: 5, display: 'grid', placeItems: 'center',
                            gap: 0, width: 30, minWidth: 30, height: 30, minHeight: 30, padding: 0,
                            border: '1px solid #4A8C3A', borderRadius: '50%', background: '#E1F2D8', color: '#286326' }}>
                          {''}
                        </Button>
                        <input id={`plant-photo-${p.id}`} type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={event => {
                            const file = event.currentTarget.files?.[0];
                            if (file) void uploadPlantPhoto(p, file);
                            event.currentTarget.value = '';
                          }} />
                      </div>
                    ))}
                    {/* Keep empty categories actionable so users can add their first plant. */}
                    {catPlants.length === 0 && <div style={{ gridColumn: '1 / -1', color: '#71856A', fontSize: 13, padding: 10 }}>No plants here yet. Add one to get started.</div>}
                  </div>
                )}
              </div>
            );
          })}
        </StyledScrollArea>

        {/* RIGHT — detail panel or empty state */}
        {selectedPlant ? (
          // Match the detail panel scrollbar to the rest of the app's bounded panels.
          <StyledScrollArea className="garden-detail" ariaLabel={`${selectedPlant.name} plant details`}>
            <PlantDetail key={selectedPlant.id} plant={selectedPlant} plants={plants} options={availableOptions}
              onClose={() => setSelectedId(null)} onPhotoUpload={file => { void uploadPlantPhoto(selectedPlant, file); }}
              onSavePlantContent={update => savePlantProfileContent(selectedPlant, update)}
              onDelete={() => requestDeletePlant(selectedPlant.id)} />
          </StyledScrollArea>
        ) : (
          <div className="garden-empty">
            {/* Reload cached calendar events when the plant roster changes. */}
            <GardenCalendar key={plants.map(plant => plant.id).join('|')} plants={plants} options={availableOptions} />
          </div>
        )}

      </div>

      {settingsOpen && <div style={modalBackdropStyle}>
        {/* Keep long settings content inside a themed, accessible scroll area. */}
        <StyledScrollArea role="dialog" ariaLabel="Garden settings" ariaModal ariaLabelledBy="settings-title"
          style={{ ...modalStyle, maxHeight: 'min(86vh, 780px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 id="settings-title" style={{ ...modalTitleStyle, margin: 0 }}>Garden settings</h2>
            {/* Match the plant profile's circular close control for quick access. */}
            <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings" title="Close settings"
              style={{
                width: 34, height: 34, border: '1px solid rgba(80,80,80,0.2)', borderRadius: '50%',
                background: 'rgba(255,255,255,0.75)', color: '#4A5A3A', fontSize: 22,
                lineHeight: 1, cursor: 'pointer',
              }}
            >{Emoji.close}</button>
          </div>
          <section style={settingsSectionStyle}>
            <h3 style={settingsSectionTitleStyle}>Plant categories</h3>
            <form onSubmit={saveCategory} style={settingsFormStyle}>
              <label style={fieldLabelStyle} htmlFor="new-category-name">Add category</label>
              <div style={settingsEntryRowStyle}>
                <input id="new-category-name" required value={categoryNameDraft} onChange={event => setCategoryNameDraft(event.target.value)} style={fieldStyle} />
                <Button type="submit" icon={Emoji.plus} color="#4A8C3A">Add</Button>
              </div>
            </form>
            <p style={settingsDescriptionStyle}>{settingsDescriptions.categories}</p>
          </section>

          {(Object.keys(optionLabels) as (keyof GardenOptions)[]).map(key => (
            <section key={key} style={settingsSectionStyle}>
              <h3 style={settingsSectionTitleStyle}>{optionLabels[key]}</h3>
              <form onSubmit={event => saveOption(key, event)} style={settingsFormStyle}>
                <label style={fieldLabelStyle} htmlFor={`new-option-${key}`}>Add {optionLabels[key].toLowerCase()}</label>
                <div style={settingsEntryRowStyle}>
                  <input id={`new-option-${key}`} required value={optionDrafts[key]}
                    onChange={event => setOptionDrafts(current => ({ ...current, [key]: event.target.value }))} style={fieldStyle} />
                  <Button type="submit" icon={Emoji.plus} color="#4A8C3A">Add</Button>
                </div>
              </form>
              <p style={settingsDescriptionStyle}>{settingsDescriptions[key]}</p>
            </section>
          ))}

          <div style={modalActionsStyle}>
            <Button onClick={() => setSettingsOpen(false)} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
          </div>
        </StyledScrollArea>
      </div>}

      {addingPlantCategoryId && <div style={modalBackdropStyle}>
        <form role="dialog" aria-modal="true" aria-labelledby="add-plant-title" onSubmit={savePlant} style={modalStyle}>
          <h2 id="add-plant-title" style={modalTitleStyle}>Add plant</h2>
          <label style={fieldLabelStyle} htmlFor="new-plant-name">Plant name</label>
          <input id="new-plant-name" autoFocus required value={plantNameDraft} onChange={event => setPlantNameDraft(event.target.value)} style={fieldStyle} />
          <label style={fieldLabelStyle} htmlFor="new-plant-latin">Latin name</label>
          <input id="new-plant-latin" required value={plantLatinDraft} onChange={event => setPlantLatinDraft(event.target.value)} style={fieldStyle} />
          <div style={fieldLabelStyle}>Category</div>
          {/* Match category selection to the custom pickers used elsewhere in the app. */}
          <Dropdown ariaLabel="Plant category" value={plantCategoryDraft || addingPlantCategoryId}
            onChange={setPlantCategoryDraft} fullWidth
            options={categories.map(category => ({ value: category.id, label: category.label }))} />
          <div style={modalActionsStyle}>
            <Button type="submit" icon={Emoji.seedling} color="#4A8C3A">Save</Button>
            <Button type="button" onClick={() => {
              setAddingPlantCategoryId(null);
              setPlantCategoryDraft('');
            }} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
          </div>
        </form>
      </div>}

      {deleteConfirmation && <div style={modalBackdropStyle} onMouseDown={() => setDeleteConfirmation(null)}>
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-confirmation-title"
          aria-describedby="delete-confirmation-message" onMouseDown={event => event.stopPropagation()} style={modalStyle}>
          <h2 id="delete-confirmation-title" style={modalTitleStyle}>Confirm deletion</h2>
          <p id="delete-confirmation-message" style={{ margin: 0, color: '#53684B', fontSize: 14, lineHeight: 1.5 }}>
            {deleteConfirmation.message}
          </p>
          <div style={modalActionsStyle}>
            <Button onClick={() => setDeleteConfirmation(null)} icon={Emoji.wiltedFlower} color="#C04040">Cancel</Button>
            <Button onClick={() => {
              const confirmation = deleteConfirmation;
              setDeleteConfirmation(null);
              void confirmation.onConfirm();
            }} icon="🗑️" color="#C04040">Delete</Button>
          </div>
        </div>
      </div>}
    </div>
  );
};

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center',
  padding: 20, background: 'rgba(24,35,20,0.42)',
};
const modalStyle: React.CSSProperties = {
  width: 'min(100%, 440px)', boxSizing: 'border-box', display: 'grid', gap: 8,
  padding: 22, border: '1px solid #B8D0A8', borderRadius: 20, background: '#FBFDF8',
  boxShadow: '0 18px 55px rgba(25,45,20,0.28)',
};
const modalTitleStyle: React.CSSProperties = { margin: '0 0 8px', color: '#2A4A1A', fontSize: 20 };
const fieldLabelStyle: React.CSSProperties = { color: '#53684B', fontSize: 13, fontWeight: 700 };
const fieldStyle: React.CSSProperties = {
  width: '100%', minHeight: 38, boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #C8D8B8', borderRadius: 10, background: 'white', color: '#3A5A2A', font: 'inherit',
};
const modalActionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 };
const settingsSectionStyle: React.CSSProperties = { display: 'grid', gap: 8, padding: '12px 0', borderTop: '1px solid #E2EBDD' };
const settingsSectionTitleStyle: React.CSSProperties = { margin: 0, color: '#3A5A2A', fontSize: 15 };
const settingsFormStyle: React.CSSProperties = { display: 'grid', gap: 6 };
const settingsEntryRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
const settingsDescriptionStyle: React.CSSProperties = { margin: 0, color: '#819578', fontSize: 12 };

export default App;
