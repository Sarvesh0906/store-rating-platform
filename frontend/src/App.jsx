import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ShellLayout from './components/ShellLayout'
import { ProtectedRoute, RoleRoute } from './components/RouteGuards'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import AdminDashboard from './pages/AdminDashboard'
import AdminNotFound from './pages/AdminNotFound'
import AdminStores from './pages/AdminStores'
import AdminUsers from './pages/AdminUsers'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import OwnerDashboard from './pages/OwnerDashboard'
import ChangePassword from './pages/ChangePassword'
import Signup from './pages/Signup'
import Unauthorized from './pages/Unauthorized'
import UserDashboard from './pages/UserDashboard'
import Stores from './pages/Stores'
import StoreDetail from './pages/StoreDetail'
import StoreRate from './pages/StoreRate'
import StoreEditRating from './pages/StoreEditRating'
import { getDashboardPath } from './utils/navigation'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/change-password" element={<ChangePassword />} />

              <Route element={<RoleRoute allowedRoles={['SYSTEM_ADMIN']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<AdminNotFound />} />
                </Route>
                <Route path="/users" element={<AdminUsers />} />
              </Route>

              <Route path="/stores" element={<StoresByRole />} />

              <Route element={<RoleRoute allowedRoles={['NORMAL_USER']} />}>
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/stores/:id" element={<StoreDetail />} />
                <Route path="/stores/:id/rate" element={<StoreRate />} />
                <Route path="/stores/:id/edit-rating" element={<StoreEditRating />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['STORE_OWNER']} />}>
                <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/change-password" element={<ChangePassword />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function DashboardRedirect() {
  const { user } = useAuth()

  return <Navigate to={getDashboardPath(user?.role)} replace />
}

function StoresByRole() {
  const { user } = useAuth()

  if (user?.role === 'SYSTEM_ADMIN') {
    return <AdminStores />
  }

  if (user?.role === 'NORMAL_USER') {
    return <Stores />
  }

  return <Navigate to="/unauthorized" replace />
}

export default App
