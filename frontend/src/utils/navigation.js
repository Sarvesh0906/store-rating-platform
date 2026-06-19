export function getDashboardPath(role) {
  if (role === 'SYSTEM_ADMIN') {
    return '/admin/dashboard'
  }

  if (role === 'STORE_OWNER') {
    return '/owner/dashboard'
  }

  if (role === 'NORMAL_USER') {
    return '/user'
  }

  return '/'
}

export function getDashboardLabel(role) {
  if (role === 'SYSTEM_ADMIN') {
    return 'System Administrator Dashboard'
  }

  if (role === 'STORE_OWNER') {
    return 'Store Owner Dashboard'
  }

  if (role === 'NORMAL_USER') {
    return 'User Dashboard'
  }

  return 'Dashboard'
}

export function getShellLocationLabel(pathname, role) {
  if (pathname === '/') {
    return 'Home'
  }

  if (pathname.startsWith('/login')) {
    return 'Sign In'
  }

  if (pathname.startsWith('/signup')) {
    return 'Signup'
  }

  if (pathname.startsWith('/stores/') && pathname.includes('/rate')) {
    return 'Submit Rating'
  }

  if (pathname.startsWith('/stores/') && pathname.includes('/edit-rating')) {
    return 'Modify Rating'
  }

  if (pathname.startsWith('/stores/')) {
    return 'Store Details'
  }

  if (pathname.startsWith('/stores')) {
    return pathname === '/stores' && role === 'SYSTEM_ADMIN' ? 'Manage Stores' : 'Store Listings'
  }

  if (pathname.startsWith('/users')) {
    return 'Manage Users'
  }

  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/dashboard')) {
      return 'Administration'
    }

    return 'Administration'
  }

  if (pathname.startsWith('/owner/change-password')) {
    return 'Change Password'
  }

  if (pathname.startsWith('/owner')) {
    return 'Owner Dashboard'
  }

  if (pathname.startsWith('/change-password')) {
    return 'Change Password'
  }

  if (pathname.startsWith('/user') || pathname.startsWith('/dashboard')) {
    return getDashboardLabel(role)
  }

  return 'Dashboard'
}
