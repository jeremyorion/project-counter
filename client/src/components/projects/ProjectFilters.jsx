import { useClients } from '../../hooks/useClients';

export default function ProjectFilters({ filters, onFilterChange }) {
  const { data: clientsResponse } = useClients();
  const clients = clientsResponse || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClear = () => {
    onFilterChange({ client_id: '', status: '', search: '' });
  };

  const hasActiveFilters = filters.client_id || filters.status || filters.search;

  return (
    <div className="card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="search" style={{ marginBottom: '0.5rem' }}>Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Job number, title..."
          />
        </div>

        <div>
          <label htmlFor="client_id" style={{ marginBottom: '0.5rem' }}>Client</label>
          <select
            id="client_id"
            name="client_id"
            value={filters.client_id}
            onChange={handleChange}
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.code} - {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" style={{ marginBottom: '0.5rem' }}>Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            style={{ width: '100%' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
