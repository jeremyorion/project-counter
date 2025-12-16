import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientsPage from './pages/ClientsPage';
import ClaimLogPage from './pages/ClaimLogPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000
    }
  }
});

export default function App() {
  const [activeTab, setActiveTab] = useState('clients');

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
    color: activeTab === tab ? 'var(--primary-color)' : 'var(--gray-600)',
    fontWeight: activeTab === tab ? '600' : '500',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s'
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <div className="container" style={{ padding: '1.5rem 1rem 0' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>
              Job Number Tracker
            </h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Claim and track job numbers by client
            </p>
          </div>
          <nav style={{ marginTop: '1rem' }}>
            <div className="container" style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                style={tabStyle('clients')}
                onClick={() => setActiveTab('clients')}
              >
                Clients
              </button>
              <button
                style={tabStyle('claim-log')}
                onClick={() => setActiveTab('claim-log')}
              >
                Activity Log
              </button>
            </div>
          </nav>
        </header>
        <div className="container" style={{ marginTop: '2rem' }}>
          {activeTab === 'clients' && <ClientsPage />}
          {activeTab === 'claim-log' && <ClaimLogPage />}
        </div>
      </div>
    </QueryClientProvider>
  );
}
