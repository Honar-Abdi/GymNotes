import PRCard from './PRCard';

export default function PRGrid({ prs }) {
  if (!prs || prs.length === 0) return null;

  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
        marginBottom: 10,
      }}>
        PARHAAT NOSTOT
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {prs.filter(pr => pr.trend !== 'down').map((pr, idx) => (
          <PRCard key={pr.exercise} pr={pr} index={idx} />
        ))}
      </div>
    </div>
  );
}