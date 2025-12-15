import { format } from 'date-fns';

const getStatusBadgeClass = (status) => {
  const badges = {
    active: 'badge-active',
    completed: 'badge-completed',
    'on-hold': 'badge-on-hold',
    cancelled: 'badge-cancelled'
  };
  return badges[status] || 'badge-active';
};

const formatStatus = (status) => {
  return status.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function ProjectList({ projects, onEdit, onDelete }) {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <h3>No projects found</h3>
        <p>Create your first project or adjust your filters</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Job Number</th>
          <th>Client</th>
          <th>Title</th>
          <th>Status</th>
          <th>Start Date</th>
          <th>Due Date</th>
          <th style={{ width: '150px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <td>
              <strong style={{ color: 'var(--primary-color)' }}>
                {project.job_number}
              </strong>
            </td>
            <td>
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                {project.client_code}
              </span>
              <div style={{ fontSize: '0.8125rem' }}>{project.client_name}</div>
            </td>
            <td>
              <div>{project.title}</div>
              {project.description && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-500)',
                  marginTop: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px'
                }}>
                  {project.description}
                </div>
              )}
            </td>
            <td>
              <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                {formatStatus(project.status)}
              </span>
            </td>
            <td>
              {project.start_date
                ? format(new Date(project.start_date), 'MMM d, yyyy')
                : '-'}
            </td>
            <td>
              {project.due_date
                ? format(new Date(project.due_date), 'MMM d, yyyy')
                : '-'}
            </td>
            <td>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEdit(project)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(project)}
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
