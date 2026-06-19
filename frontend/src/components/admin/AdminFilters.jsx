function AdminFilters({ search, onSearchChange, searchPlaceholder, selects = [] }) {
  return (
    <div className="filter-bar">
      <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} />
      {selects.map((select) => (
        <select key={select.key} value={select.value} onChange={(event) => select.onChange(event.target.value)}>
          {select.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}

export default AdminFilters
