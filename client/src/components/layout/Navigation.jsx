import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const navStyle = {
    backgroundColor: 'white',
    borderBottom: '1px solid var(--gray-200)',
    marginBottom: '2rem'
  };

  const navListStyle = {
    display: 'flex',
    listStyle: 'none',
    gap: '2rem'
  };

  const getLinkStyle = (path) => ({
    display: 'block',
    padding: '1rem 0',
    textDecoration: 'none',
    color: location.pathname === path ? 'var(--primary-color)' : 'var(--gray-600)',
    fontWeight: location.pathname === path ? '600' : '500',
    fontSize: '0.875rem',
    borderBottom: location.pathname === path ? '2px solid var(--primary-color)' : '2px solid transparent',
    transition: 'color 0.2s'
  });

  return (
    <nav style={navStyle}>
      <div className="container">
        <ul style={navListStyle}>
          <li>
            <Link to="/" style={getLinkStyle('/')}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/projects" style={getLinkStyle('/projects')}>
              Projects
            </Link>
          </li>
          <li>
            <Link to="/clients" style={getLinkStyle('/clients')}>
              Clients
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
