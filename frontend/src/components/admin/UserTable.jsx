function UserTable({ items = [], onViewProfile }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.role}</td>
                <td>
                  <button type="button" className="secondary-button" onClick={() => onViewProfile(user)}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No registered users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
