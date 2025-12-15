import { useState } from 'react';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useClients';
import ClientList from '../components/clients/ClientList';
import ClientModal from '../components/clients/ClientModal';

export default function ClientsPage() {
  const { data: clientsResponse, isLoading, error } = useClients();
  const clients = clientsResponse || [];

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleCreate = () => {
    setSelectedClient(null);
    setModalOpen(true);
    setActionError('');
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
    setActionError('');
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedClient) {
        await updateClient.mutateAsync({ id: selectedClient.id, data });
      } else {
        await createClient.mutateAsync(data);
      }
      setModalOpen(false);
      setSelectedClient(null);
      setActionError('');
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDelete = async (client) => {
    if (client.project_count > 0) {
      if (!confirm(`Client "${client.name}" has ${client.project_count} project(s). Are you sure you want to delete it? All associated projects will also be deleted.`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete client "${client.name}"?`)) {
        return;
      }
    }

    try {
      await deleteClient.mutateAsync(client.id);
    } catch (error) {
      alert(`Error deleting client: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
    setActionError('');
  };

  if (isLoading) {
    return <div className="loading">Loading clients...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
        <p style={{ color: '#991b1b' }}>Error loading clients: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-2">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Clients</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          + New Client
        </button>
      </div>

      {actionError && (
        <div className="card mb-1" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
          <p style={{ color: '#991b1b', margin: 0 }}>{actionError}</p>
        </div>
      )}

      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <ClientModal
          client={selectedClient}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
