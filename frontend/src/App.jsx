import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Progress from './pages/Progress';
import Bulk from './pages/Bulk';

const NAV = [
  { id: 'DASHBOARD', label: 'DASHBOARD' },
  { id: 'BULK', label: 'KIRJAA' },
  { id: 'HISTORY', label: 'HISTORIA' },
  { id: 'PROGRESS', label: 'PROGRESS' },
];

export default function App() {
  const [page, setPage] = useState('DASHBOARD');

  return (
    <div style={{ maxWidth: 'min(1100px, 95vw)', margin: '0 auto', padding: '0 clamp(16px, 3vw, 32px)' }}>
      <header>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
        }}>

          {/* Logo */}
          <h1
            onClick={() => setPage('DASHBOARD')}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1,
              gap: 5,
            }}
          >
            <span>
              <span style={{ color: 'var(--accent)' }}>GYM</span>
              <span style={{ color: 'var(--text)' }}>NOTES</span>
            </span>
            <span style={{
              display: 'block',
              height: 2,
              width: '100%',
              background: 'linear-gradient(90deg, var(--accent), transparent)',
              borderRadius: 1,
            }} />
          </h1>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  padding: '8px 16px',
                  background: page === id ? 'var(--accent)' : 'transparent',
                  color: page === id ? '#000' : 'var(--muted)',
                  fontSize: '0.75rem',
                  borderRadius: 3,
                  border: 'none',
                  letterSpacing: '0.08em',
                  transition: 'all 0.15s ease',
                  fontWeight: page === id ? 700 : 600,
                }}
                onMouseEnter={e => {
                  if (page !== id) e.target.style.color = 'var(--text)';
                }}
                onMouseLeave={e => {
                  if (page !== id) e.target.style.color = 'var(--muted)';
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ padding: '32px 0', position: 'relative', zIndex: 1 }}>
        {page === 'DASHBOARD' && <Dashboard />}
        {page === 'BULK' && <Bulk />}
        {page === 'HISTORY' && <History />}
        {page === 'PROGRESS' && <Progress />}
      </main>
    </div>
  );
}