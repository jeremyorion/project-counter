import { useClaimLog } from '../hooks/useClaimLog';
import { format } from 'date-fns';

export default function ClaimLogPage() {
  const { data: claimLogResponse, isLoading, error } = useClaimLog();
  const activityLog = claimLogResponse || [];

  if (isLoading) {
    return <div className="loading">Loading activity log...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
        <p style={{ color: '#991b1b' }}>Error loading activity log: {error.message}</p>
      </div>
    );
  }

  if (activityLog.length === 0) {
    return (
      <div className="empty-state">
        <h3>No activity yet</h3>
        <p>Claim job numbers or edit clients to see activity here</p>
      </div>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Client</th>
            <th>Details</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {activityLog.map((entry, index) => (
            <tr key={`${entry.activity_type}-${entry.id}-${index}`}>
              <td>
                {entry.activity_type === 'claim' ? (
                  <span className="badge badge-active">Claim</span>
                ) : (
                  <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                    Edit
                  </span>
                )}
              </td>
              <td>
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                  {entry.client_code}
                </span>
                <div style={{ fontSize: '0.8125rem' }}>{entry.client_name}</div>
              </td>
              <td>
                {entry.activity_type === 'claim' ? (
                  <strong style={{ color: 'var(--primary-color)' }}>
                    {entry.job_number}
                  </strong>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                    {entry.change_description}
                  </span>
                )}
              </td>
              <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                {format(new Date(entry.activity_at), 'MMM d, yyyy h:mm a')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
