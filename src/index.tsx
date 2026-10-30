import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const startApp = async () => {
  try {
    const data = await window.gardenDesktop?.load();
    if (data) {
      // Mirror custom data and removed-default IDs so the renderer has one loading path.
      localStorage.setItem('garden-custom-categories', JSON.stringify(data.categories ?? []));
      localStorage.setItem('garden-custom-plants', JSON.stringify(data.plants.filter(plant => plant.source === 'custom')));
      // Mirror built-in guidance overrides separately so catalog defaults stay immutable.
      localStorage.setItem('garden-built-in-profile-overrides', JSON.stringify(data.plants.filter(plant =>
        plant.source === 'built-in' && (plant.details || plant.fertilizer || plant.tricks || plant.diseases))));
      localStorage.setItem('garden-custom-options', JSON.stringify(data.customOptions ?? { fertilizers: [], potMaterials: [], soils: [] }));
      localStorage.setItem('garden-deleted-plant-ids', JSON.stringify(data.deletedPlantIds ?? []));
      localStorage.setItem('garden-deleted-category-ids', JSON.stringify(data.deletedCategoryIds ?? []));
      // Pass desktop photos directly to React without copying them into localStorage.
      window.gardenInitialPhotos = data.plants.reduce<Record<string, string>>((photos, plant) => {
        if (typeof plant.photo === 'string') photos[plant.id] = plant.photo;
        return photos;
      }, {});
    }
    data?.plants.forEach(plant => {
      if (plant.setup) {
        localStorage.setItem(`garden-setup-${plant.id}`, JSON.stringify(plant.setup));
      }
      if (plant.careEvents) {
        localStorage.setItem(`garden-care-events-${plant.id}`, JSON.stringify(plant.careEvents));
      }
    });
  } catch (error) {
    console.error('Unable to load the garden data file.', error);
    window.alert('Garden data could not be loaded. Your existing data file was left unchanged.');
  }

  root.render(<React.StrictMode><App /></React.StrictMode>);
};

void startApp();
