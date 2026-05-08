export function isExtensionRuntimeAvailable() {
  return typeof chrome !== 'undefined' && Boolean(chrome?.storage?.local)
}
