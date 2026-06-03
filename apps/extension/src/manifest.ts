export const manifest = {
  manifest_version: 3,
  name: 'AI Prompt Manager',
  version: '1.0.0',
  description: 'Manage prompts, categories, search and AI optimization in a browser side panel.',
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_title: 'AI Prompt Manager',
  },
  side_panel: {
    default_path: 'sidepanel.html',
  },
  options_page: 'options.html',
  permissions: ['storage', 'sidePanel', 'clipboardWrite', 'identity', 'alarms', 'contextMenus', 'scripting', 'activeTab'],
  host_permissions: ['https://*/*', 'http://*/*'],
} as const
