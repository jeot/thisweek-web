import { Routes, Route, Navigate } from 'react-router-dom'
import App from '@/App'

export function AppPage() {
  return (
    <Routes>
      {/* Main app entry */}
      <Route path="/" element={<App />} />

      {/* Optional real subroutes here */}
      {/* <Route path="dashboard" element={<Dashboard />} /> */}
      {/* <Route path="profile" element={<Profile />} /> */}

      {/* Catch all unknown /app/* → redirect to /app */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

