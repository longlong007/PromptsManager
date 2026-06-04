import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './ErrorBoundary'
import './styles.css'

console.log('[APM-IDE] bundle 已加载', new Date().toISOString())

// 不用 StrictMode：避免重复 mount 触发 acquireVsCodeApi 二次调用导致白屏
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
