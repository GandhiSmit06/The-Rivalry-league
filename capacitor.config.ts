import type { CapacitorConfig } from '@capacitor/cli'

// The app is a thin native shell around the hosted Next.js site (Vercel).
// Set CAP_SERVER_URL (e.g. https://rivalryleague.vercel.app) before `cap sync`.
const serverUrl = process.env.CAP_SERVER_URL || 'https://REPLACE-ME.vercel.app'

const config: CapacitorConfig = {
  appId: 'com.rivalryleague.app',
  appName: 'The Rivalry League',
  webDir: 'www',
  backgroundColor: '#070c16',
  server: {
    url: serverUrl,
    cleartext: false,
    errorPath: 'offline.html'
  },
  android: {
    allowMixedContent: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#070c16',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070c16'
    }
  }
}

export default config
