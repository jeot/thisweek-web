import { Routes, Route, Navigate } from 'react-router-dom'
import App from '@/App'
import AuthenticatedRouteOnlineCheck from '@/components/AuthenticatedRouteOnlineCheck'
import AuthInfo from './AuthInfo'

export function AppPage() {

  return (
    <Routes>
      {/* Main app entry */}
      <Route path="/" element={<App />} />
      {/* these are like: thisweek.me/app/test */}
      <Route path="/test" element={"test"} />
      <Route path="/login" element={<Navigate to="/app" state={{ openLogin: true }} replace />} />
      <Route path="/auth" element={<AuthenticatedRouteOnlineCheck />} />
      <Route path="/authinfo" element={<AuthInfo />} />

      {/* Optional real subroutes here */}
      {/* <Route path="dashboard" element={<Dashboard />} /> */}
      {/* <Route path="profile" element={<Profile />} /> */}

      {/* Catch all unknown /app/* → redirect to /app */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

