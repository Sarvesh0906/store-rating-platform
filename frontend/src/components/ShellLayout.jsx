import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardLabel, getDashboardPath } from '../utils/navigation'

function ShellLayout() {
  const { user, logout } = useAuth()
  const dashboardLabel = getDashboardLabel(user?.role)

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">SR</span>
          <span>Store Rating</span>
        </Link>

        <nav className="topnav">
          {!user ? (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Sign In
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                User Signup
              </NavLink>
            </>
          ) : null}
          {user ? (
            <NavLink to={getDashboardPath(user.role)} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {dashboardLabel}
            </NavLink>
          ) : null}
          {user?.role === 'NORMAL_USER' ? (
            <NavLink to="/stores" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Store Listings
            </NavLink>
          ) : null}
          {/* {user?.role === 'STORE_OWNER' ? (
            <NavLink to="/owner/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Owner Dashboard
            </NavLink>
          ) : null} */}
          {user ? (
            <NavLink
              to={user.role === 'STORE_OWNER' ? '/owner/change-password' : '/change-password'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Change password
            </NavLink>
          ) : null}
        </nav>

        <div className="topbar-meta">
          {user ? (
            <>
              <div className="user-chip">
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </div>
              <button type="button" className="ghost-button" onClick={logout}>
                Sign Out
              </button>
            </>
          ) : (
            <span className="muted">Guest access is limited to sign in and user signup.</span>
          )}
        </div>
      </header>

      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  )
}

export default ShellLayout
