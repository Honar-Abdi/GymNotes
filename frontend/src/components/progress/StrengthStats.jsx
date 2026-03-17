import StatCard from './StatCard';
import BestWeightChart from './BestWeightChart';

export default function StrengthStats({ s, timeline }) {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOIMA</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard label="VIIMEISIN e1RM" value={`${s.last_best_e1rm?.toFixed(1)} kg`} sub="arvioitu 1RM" />
        <StatCard label="PARAS e1RM KOSKAAN" value={`${s.all_time_best_e1rm?.toFixed(1)} kg`} />
        <StatCard label="PARAS PAINO" value={`${s.all_time_best_weight} kg`} sub="korkein nostettu" />
      </div>
      <BestWeightChart timeline={timeline} isBodyweight={false} />
    </>
  );
}