export default function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}