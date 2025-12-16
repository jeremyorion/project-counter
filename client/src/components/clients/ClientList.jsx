export default function ClientList({ clients, onEdit, onDelete, onClaim }) {
  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <h3>No clients yet</h3>
        <p>Create your first client to get started</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Next Job Number</th>
          <th style={{ width: '280px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>
              <strong>{client.code}</strong>
            </td>
            <td>{client.name}</td>
            <td style={{ color: 'var(--gray-600)', fontSize: '0.8125rem' }}>
              <strong>{client.code}-{String(client.current_counter + 1).padStart(3, '0')}</strong>
            </td>
            <td>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onClaim(client)}
                >
                  Claim Job Number
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEdit(client)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(client)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
