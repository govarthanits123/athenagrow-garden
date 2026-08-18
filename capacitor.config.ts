import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.athenagrow.app',
  appName: 'AthenaGrow',
  webDir: 'dist',
  // Capacitor's built-in web server handles SPA fallback (serves index.html
  // for all routes that don't match a file), so browser-history routing works.
  server: {
    androidScheme: 'https',
  },
};

export default config;
