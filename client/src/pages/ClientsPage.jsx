import { useState } from 'react';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, useClaimJobNumber } from '../hooks/useClients';
import ClientList from '../components/clients/ClientList';
import ClientModal from '../components/clients/ClientModal';

export default function ClientsPage() {
  const { data: clientsResponse, isLoading, error } = useClients();
  const clients = clientsResponse || [];

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const claimJobNumber = useClaimJobNumber();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    if (!confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      return;
    }

    try {
      await deleteClient.mutateAsync(client.id);
    } catch (error) {
      alert(`Error deleting client: ${error.message}`);
    }
  };

  const handleClaim = async (client) => {
    try {
      const result = await claimJobNumber.mutateAsync(client.id);
      const jobNumber = result.jobNumber;

      // Copy to clipboard
      await navigator.clipboard.writeText(jobNumber);

      // Show success message
      setSuccessMessage(`Job number ${jobNumber} copied to clipboard!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert(`Error claiming job number: ${error.message}`);
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
        <div></div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + New Client
        </button>
      </div>

      {actionError && (
        <div className="card mb-1" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
          <p style={{ color: '#991b1b', margin: 0 }}>{actionError}</p>
        </div>
      )}

      {successMessage && (
        <div className="card mb-1" style={{ backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }}>
          <p style={{ color: '#065f46', margin: 0 }}>{successMessage}</p>
        </div>
      )}

      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClaim={handleClaim}
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
