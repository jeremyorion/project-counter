export default function Header() {
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid var(--gray-200)',
      marginBottom: '2rem'
    }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>
          Project Counter
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Manage projects and assign job numbers
        </p>
      </div>
    </header>
  );
}
