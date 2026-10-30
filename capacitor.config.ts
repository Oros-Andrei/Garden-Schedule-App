import type { CapacitorConfig } from '@capacitor/cli';

// Package the existing React build as a native Android WebView app.
const config: CapacitorConfig = {
  appId: 'com.andrei.gardenschedule',
  appName: 'Garden Schedule',
  webDir: 'dist',
};

export default config;
