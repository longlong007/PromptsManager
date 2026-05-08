export const manifest = {
  manifest_version: 3,
  name: 'AI Prompt Manager',
  version: '1.0.0',
  description: 'Manage prompts, categories, search and AI optimization in a browser side panel.',
  action: {
    default_title: 'AI Prompt Manager',
    default_popup: 'popup.html',
  },
  side_panel: {
    default_path: 'sidepanel.html',
  },
  options_page: 'options.html',
  permissions: ['storage', 'sidePanel', 'clipboardWrite'],
  host_permissions: ['https://*.supabase.co/*'],
} as const
