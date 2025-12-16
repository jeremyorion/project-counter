import { useClaimLog } from '../hooks/useClaimLog';
import { format } from 'date-fns';

export default function ClaimLogPage() {
  const { data: claimLogResponse, isLoading, error } = useClaimLog();
  const claimLog = claimLogResponse || [];

  if (isLoading) {
    return <div className="loading">Loading claim log...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
        <p style={{ color: '#991b1b' }}>Error loading claim log: {error.message}</p>
      </div>
    );
  }

  if (claimLog.length === 0) {
    return (
      <div className="empty-state">
        <h3>No claimed job numbers yet</h3>
        <p>Claim your first job number to see it here</p>
      </div>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Job Number</th>
            <th>Client</th>
            <th>Claimed At</th>
          </tr>
        </thead>
        <tbody>
          {claimLog.map((entry) => (
            <tr key={entry.id}>
              <td>
                <strong style={{ color: 'var(--primary-color)' }}>
                  {entry.job_number}
                </strong>
              </td>
              <td>
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                  {entry.client_code}
                </span>
                <div style={{ fontSize: '0.8125rem' }}>{entry.client_name}</div>
              </td>
              <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                {format(new Date(entry.claimed_at), 'MMM d, yyyy h:mm a')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
