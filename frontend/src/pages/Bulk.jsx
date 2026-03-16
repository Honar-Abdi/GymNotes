import { useState } from 'react';
import TreeniForm from '../components/bulk/TreeniForm';
import AerobinenForm from '../components/bulk/AerobinenForm';

export default function Bulk() {
  const [tab, setTab] = useState('treeni');

  const tabStyle = (t) => ({
    flex: 1,
    padding: '12px',
    background: tab === t ? 'var(--accent)' : 'var(--surface2)',
    color: tab === t ? '#000' : 'var(--muted)',
    border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 4,
    fontSize: '0.8rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'background 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
      <div className="slide-up slide-up-1" style={{ display: 'flex', gap: 8 }}>
        <button style={tabStyle('treeni')} onClick={() => setTab('treeni')}>TREENI</button>
        <button style={tabStyle('aerobinen')} onClick={() => setTab('aerobinen')}>AEROBINEN</button>
      </div>

      {tab === 'treeni' && <TreeniForm />}
      {tab === 'aerobinen' && <AerobinenForm />}
    </div>
  );
}