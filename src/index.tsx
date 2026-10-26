import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const startApp = async () => {
  try {
    const data = await window.gardenDesktop?.load();
    data?.plants.forEach(plant => {
      if (plant.setup) {
        localStorage.setItem(`garden-setup-${plant.id}`, JSON.stringify(plant.setup));
      }
    });
  } catch (error) {
    console.error('Unable to load the garden data file.', error);
    window.alert('Garden data could not be loaded. Your existing data file was left unchanged.');
  }

  root.render(<React.StrictMode><App /></React.StrictMode>);
};

void startApp();
