function StoreTable({ items = [] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.email || '-'}</td>
                <td>{store.address}</td>
                <td>{Number.isFinite(Number(store.overall_rating)) ? `${Number(store.overall_rating).toFixed(1)} / 5` : '0.0 / 5'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No registered stores found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default StoreTable
