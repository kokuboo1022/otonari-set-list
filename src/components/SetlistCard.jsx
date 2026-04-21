import { Link } from 'react-router-dom';

function formatTotal(sec) {
  if (!sec) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SetlistCard({ setlist, songs, onDelete }) {
  const songList = (setlist.songIds || [])
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean);
  const totalSec = songList.reduce((sum, s) => sum + (s?.durationSec || 0), 0);

  const displayDate = setlist.date
    ? new Date(setlist.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="setlist-card">
      <Link to={`/setlist/${setlist.id}`} className="setlist-card-link">
        <div className="setlist-card-header">
          <h2 className="setlist-card-name">{setlist.name || '無題のセットリスト'}</h2>
          {displayDate && <span className="setlist-card-date">{displayDate}</span>}
        </div>
        {setlist.venue && <p className="setlist-card-venue">{setlist.venue}</p>}
        <div className="setlist-card-meta">
          <span>{(setlist.songIds || []).length}曲</span>
          <span>合計 {formatTotal(totalSec)}</span>
        </div>
      </Link>
      <button className="btn btn--danger btn--sm setlist-card-delete" onClick={() => onDelete(setlist)}>
        削除
      </button>
    </div>
  );
}
