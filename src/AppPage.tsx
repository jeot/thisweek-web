import { Routes, Route, Navigate } from 'react-router-dom'
import App from '@/App'
import AuthenticatedRoute from './AuthenticatedRoute'

export function AppPage() {
  return (
    <Routes>
      {/* Main app entry */}
      <Route path="/" element={<App />} />
      {/* these are like: thisweek.me/app/login */}
      <Route path="/test" element={"test"} />
      <Route path="/login" element={"login"} />
      <Route path="/auth" element={<AuthenticatedRoute />} />

      {/* Optional real subroutes here */}
      {/* <Route path="dashboard" element={<Dashboard />} /> */}
      {/* <Route path="profile" element={<Profile />} /> */}

      {/* Catch all unknown /app/* → redirect to /app */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

