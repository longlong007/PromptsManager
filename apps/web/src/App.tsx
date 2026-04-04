import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PromptProvider } from './contexts/PromptContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PromptListPage from './pages/PromptListPage'
import PromptDetailPage from './pages/PromptDetailPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PromptProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/prompts" element={<PromptListPage />} />
            <Route path="/prompts/:id" element={<PromptDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PromptProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
