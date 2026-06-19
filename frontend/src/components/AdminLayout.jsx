import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <section className="admin-shell">
      <Outlet />
    </section>
  )
}

export default AdminLayout
