export default function TrendBadge({ pct, label }) {
  if (pct == null) return null;
  const positive = pct > 0;
  const neutral = pct === 0;
  return (
    <span style={{
      fontSize: '0.75rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: neutral ? 'var(--muted)' : positive ? 'var(--success)' : 'var(--accent2)',
      background: neutral ? '#1a1a1a' : positive ? '#001a0d' : '#1a0800',
      border: `1px solid ${neutral ? 'var(--border)' : positive ? 'var(--success)' : 'var(--accent2)'}`,
      padding: '2px 8px',
      borderRadius: 3,
    }}>
      {positive ? '▲' : pct < 0 ? '▼' : '='} {positive ? '+' : ''}{pct}% {label}
    </span>
  );
}