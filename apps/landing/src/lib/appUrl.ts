const DEFAULT_APP_URL = 'http://localhost:5173/PromptsManager'

/** Web 应用根地址（无尾部斜杠） */
export function getAppUrl(): string {
  return (import.meta.env.VITE_APP_URL || DEFAULT_APP_URL).replace(/\/$/, '')
}

/** 生成指向 Web 应用 HashRouter 路径的完整 URL */
export function appPath(hashPath: string): string {
  const path = hashPath.startsWith('/') ? hashPath : `/${hashPath}`
  return `${getAppUrl()}/#${path}`
}

export const APP_LOGIN_URL = () => appPath('/login')
