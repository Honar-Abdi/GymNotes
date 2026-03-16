import { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import MonthCalendar from '../components/dashboard/MonthCalendar';
import LastSession from '../components/dashboard/LastSession';
import PRGrid from '../components/dashboard/PRGrid';
import StreakBar from '../components/dashboard/StreakBar';
import TrainingSplit from '../components/dashboard/TrainingSplit';
import WeeklyVolume from '../components/dashboard/WeeklyVolume';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
      {[180, 120, 200, 160, 140].map((h, i) => (
        <div key={i} style={{
          height: h,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          animation: 'pulse 1.5s ease infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );

  if (!data || data.empty) return (
    <div style={{
      padding: '60px 0',
      textAlign: 'center',
      color: 'var(--muted)',
      fontFamily: 'var(--font-display)',
      fontSize: '0.9rem',
      letterSpacing: '0.1em',
    }}>
      EI TREENIDATAA — ALOITA KIRJAAMALLA ENSIMMÄINEN SESSIO
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      {/* Viikkotavoite + statsit */}
      <div className="slide-up slide-up-1">
        <StreakBar streak={data.streak} />
      </div>

      {/* 28 päivän kalenteri */}
      <div
        className="slide-up slide-up-2"
        style={{
          padding: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
        }}
      >
        <MonthCalendar calendar={data.calendar} />
      </div>

      {/* Viimeisin treeni */}
      <div className="slide-up slide-up-3">
        <LastSession lastSession={data.last_session} />
      </div>

      {/* Treenijako + viikkovolyymi rinnakkain */}
      <div
        className="slide-up slide-up-4"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <TrainingSplit data={data.training_split} />
        <WeeklyVolume data={data.weekly_volume} />
      </div>

      {/* PR-kortit */}
      <div className="slide-up slide-up-5">
        <PRGrid prs={data.prs} />
      </div>

    </div>
  );
}