import { useState, useMemo } from 'react';
import { useSongs } from '../hooks/useSongs';
import { useMembers } from '../hooks/useMembers';
import SongFormModal from '../components/SongFormModal';
import ConfirmModal from '../components/ConfirmModal';
import MemberAvatar from '../components/MemberAvatar';
import { instrumentEmoji } from '../constants';

function formatDuration(sec) {
  if (!sec) return '--:--';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function CandidatesPage() {
  const { songs, loading, addSong, updateSong, deleteSong } = useSongs();
  const { members } = useMembers();
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const allTags = useMemo(() => {
    const set = new Set();
    songs.forEach(s => s.tags?.forEach(t => set.add(t)));
    return [...set].sort();
  }, [songs]);

  const candidates = useMemo(() => {
    let list = songs.filter(s => (s.rank || 0) === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        s => s.title?.toLowerCase().includes(q)
          || s.nickname?.toLowerCase().includes(q)
          || s.artist?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'ja');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '', 'ja');
      return 0;
    });
  }, [songs, search, sortBy]);

  const handleSave = async data => {
    if (formTarget === 'new') {
      await addSong(data);
    } else {
      await updateSong(formTarget.id, data);
    }
    setFormTarget(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">候補曲リスト</h1>
        <button className="btn btn--primary" onClick={() => setFormTarget('new')}>
          + 曲を追加
        </button>
      </div>
      <p className="page-desc">メンバーから要望があった曲・いつか演奏したい曲（得意度「未」の曲）</p>

      <div className="toolbar">
        <input
          className="input search-input"
          placeholder="曲名・通称・アーティストで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="title">曲名順</option>
          <option value="artist">アーティスト順</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          {search.trim() ? (
            <p>条件に一致する曲が見つかりません</p>
          ) : (
            <>
              <p>候補曲はまだありません</p>
              <button className="btn btn--primary" onClick={() => setFormTarget('new')}>
                候補曲を追加
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="song-list">
          {candidates.map(song => (
            <div key={song.id} className="song-item">
              <div className="song-item-main">
                <div className="song-item-title">
                  <span className="song-title-text">
                    {song.title}
                    {song.nickname && <span className="song-item-nickname">（{song.nickname}）</span>}
                  </span>
                  {song.tempo && (
                    <span className="song-genre-badge">
                      {{ jig: 'ジグ', polka: 'ポルカ', waltz: 'ワルツ', reel: 'リール', hornpipe: 'ホーンパイプ', slip_jig: 'スリップジグ', other: 'その他' }[song.tempo] ?? song.tempo}
                    </span>
                  )}
                </div>
                {song.artist && (
                  <div className="song-item-row2">
                    <span className="song-item-artist">{song.artist}</span>
                  </div>
                )}
                <div className="song-item-meta">
                  <span>{formatDuration(song.durationSec)}</span>
                </div>
                {song.tags?.length > 0 && (
                  <div className="song-item-tags">
                    {song.tags.map(t => <span key={t} className="tag tag--sm">{t}</span>)}
                  </div>
                )}
                {song.notes && <div className="song-item-notes">{song.notes}</div>}
                {(song.referenceUrl || song.referenceFileUrl) && (
                  <div className="song-item-refs">
                    {song.referenceUrl && (
                      <a href={song.referenceUrl} target="_blank" rel="noreferrer" className="ref-badge" onClick={e => e.stopPropagation()}>
                        参考URL
                      </a>
                    )}
                    {song.referenceFileUrl && (
                      <a href={song.referenceFileUrl} target="_blank" rel="noreferrer" className="ref-badge ref-badge--file" onClick={e => e.stopPropagation()}>
                        {song.referenceFileName || '音源ファイル'}
                      </a>
                    )}
                  </div>
                )}
                {members.length > 0 && song.instruments && Object.keys(song.instruments).length > 0 && (
                  <div className="member-cards">
                    {members.map((m, i) => {
                      const val = song.instruments[m.id];
                      if (val === undefined) return null;
                      const isOff = val === '降り番';
                      const label = isOff ? '降り番' : (val || '');
                      return (
                        <div key={m.id} className={`member-card ${isOff ? 'member-card--off' : ''}`}>
                          <MemberAvatar name={m.name} order={m.order ?? i} size={28} photoURL={m.photoURL} />
                          <span className="member-card-name">{m.name}</span>
                          <span className="member-card-instrument">
                            {!isOff && label && <>{instrumentEmoji(label)} </>}{label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="song-item-actions">
                <button className="btn btn--ghost btn--sm" onClick={() => setFormTarget(song)}>
                  編集
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(song)}>
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formTarget && (
        <SongFormModal
          initial={formTarget === 'new' ? { rank: 0 } : formTarget}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
          existingTags={allTags}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`「${deleteTarget.title}」を削除しますか？`}
          onConfirm={() => {
            deleteSong(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
