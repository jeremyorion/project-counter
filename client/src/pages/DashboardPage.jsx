import { Link } from 'react-router-dom';
import { useProjectStats, useRecentProjects } from '../hooks/useProjects';
import { format } from 'date-fns';

const StatCard = ({ title, value, color }) => (
  <div className="card">
    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
      {title}
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
      {value}
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: statsResponse, isLoading: statsLoading } = useProjectStats();
  const stats = statsResponse || {};

  const { data: recentResponse, isLoading: recentLoading } = useRecentProjects(5);
  const recentProjects = recentResponse || [];

  if (statsLoading || recentLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Dashboard
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Projects"
          value={stats.totalProjects || 0}
          color="var(--primary-color)"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects || 0}
          color="var(--success-color)"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients || 0}
          color="var(--gray-700)"
        />
      </div>

      <div className="card">
        <div className="flex-between mb-1">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Projects</h3>
          <Link to="/projects" className="btn btn-sm btn-secondary">
            View All
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
            <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Project
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job Number</th>
                <th>Client</th>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-color)' }}>
                      {project.job_number}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem' }}>
                      {project.client_code}
                    </span>
                  </td>
                  <td>{project.title}</td>
                  <td>
                    <span className={`badge badge-${project.status}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                    {format(new Date(project.created_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <Link to="/projects" className="card" style={{
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Manage Projects
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            View, create, and manage your projects with auto-generated job numbers
          </p>
        </Link>

        <Link to="/clients" className="card" style={{
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Manage Clients
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            Add and manage clients with their unique 3-letter codes
          </p>
        </Link>
      </div>
    </div>
  );
}
