import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hexanova.app',
  appName: 'Hexanova',
  webDir: 'build',
  server: {
    // Allow navigation to external URLs (for payment links, etc.)
    allowNavigation: ['hexanova.net', '*.hexanova.net'],
    // Clear text traffic for local development
    cleartext: false,
    // Use https scheme in production
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#d4af37',
      sound: 'default',
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#1a1a2e',
  },
};

export default config;
