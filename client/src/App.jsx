import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientsPage from './pages/ClientsPage';

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
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid var(--gray-200)',
          marginBottom: '2rem'
        }}>
          <div className="container" style={{ padding: '1.5rem 1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>
              Job Number Tracker
            </h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Claim and track job numbers by client
            </p>
          </div>
        </header>
        <div className="container">
          <ClientsPage />
        </div>
      </div>
    </QueryClientProvider>
  );
}
