import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.promptmanager.app',
  appName: 'Prompt Manager',
  webDir: '../web/dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
