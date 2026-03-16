import StatCard from './StatCard';

export default function SideStats({ s }) {
  if (!s.side_best?.right && !s.side_best?.left) return null;

  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>PARAS PER KÄSI</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {s.side_best.right && <StatCard label="OIKEA KÄSI →" value={`${s.side_best.right.weight} kg`} sub={`× ${s.side_best.right.reps} toistoa — ${s.side_best.right.date}`} />}
        {s.side_best.left && <StatCard label="VASEN KÄSI ←" value={`${s.side_best.left.weight} kg`} sub={`× ${s.side_best.left.reps} toistoa — ${s.side_best.left.date}`} />}
      </div>
    </>
  );
}