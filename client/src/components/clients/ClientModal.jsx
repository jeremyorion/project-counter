import ClientForm from './ClientForm';

export default function ClientModal({ client, onSubmit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{client ? 'Edit Client' : 'New Client'}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--gray-500)'
            }}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <ClientForm
            client={client}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
