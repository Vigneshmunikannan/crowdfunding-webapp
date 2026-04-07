import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleRoute } from './components/RoleRoute'
import { AuthLayout } from './layouts/AuthLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { DonorLayout } from './layouts/DonorLayout'
import { MainLayout } from './layouts/MainLayout'
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage'
import { AdminHomePage } from './pages/admin/AdminHomePage'
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage'
import { AdminOpportunitiesPage } from './pages/admin/AdminOpportunitiesPage'
import { ApprovedCampaignsPage } from './pages/donor/ApprovedCampaignsPage'
import { CreateRequestPage } from './pages/donor/CreateRequestPage'
import { DonorHomePage } from './pages/donor/DonorHomePage'
import { FundingDealsPage } from './pages/donor/FundingDealsPage'
import { MyRequestsPage } from './pages/donor/MyRequestsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['donor']}>
                <DonorLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<DonorHomePage />} />
          <Route path="create" element={<CreateRequestPage />} />
          <Route path="deals" element={<FundingDealsPage />} />
          <Route path="requests" element={<MyRequestsPage />} />
          <Route path="campaigns" element={<ApprovedCampaignsPage />} />
        </Route>
        <Route path="donor" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHomePage />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="opportunities" element={<AdminOpportunitiesPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
