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

export default function SongsPage() {
  const { songs, loading, addSong, updateSong, deleteSong } = useSongs();
  const { members } = useMembers();
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState(null);
  const [filterUrl, setFilterUrl] = useState(false);
  const [filterFile, setFilterFile] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [search, setSearch] = useState('');

  const allTags = useMemo(() => {
    const set = new Set();
    songs.forEach(s => s.tags?.forEach(t => set.add(t)));
    return [...set].sort();
  }, [songs]);

  const toggleTag = tag =>
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const filtered = useMemo(() => {
    let list = songs;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        s => s.title?.toLowerCase().includes(q)
          || s.nickname?.toLowerCase().includes(q)
          || s.artist?.toLowerCase().includes(q)
      );
    }
    if (selectedTags.length > 0) {
      list = list.filter(s => selectedTags.some(t => s.tags?.includes(t)));
    }
    if (selectedRank !== null) {
      list = list.filter(s => (s.rank || 0) === selectedRank);
    }
    if (filterUrl) {
      list = list.filter(s => !!s.referenceUrl);
    }
    if (filterFile) {
      list = list.filter(s => !!s.referenceFileUrl);
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'ja');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '', 'ja');
      if (sortBy === 'duration') return (b.durationSec || 0) - (a.durationSec || 0);
      if (sortBy === 'usage') return (b.usageCount || 0) - (a.usageCount || 0);
      return 0;
    });
  }, [songs, search, selectedTags, selectedRank, filterUrl, filterFile, sortBy]);

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
        <h1 className="page-title">曲ライブラリ</h1>
        <button className="btn btn--primary" onClick={() => setFormTarget('new')}>
          + 曲を追加
        </button>
      </div>

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
          <option value="duration">演奏時間順</option>
          <option value="usage">採用回数順</option>
        </select>
      </div>

      {allTags.length > 0 && (
        <div className="tag-accordion">
          <button
            className={`tag-accordion-toggle ${selectedTags.length > 0 ? 'tag-accordion-toggle--active' : ''}`}
            onClick={() => setTagsOpen(v => !v)}
          >
            <span>タグで絞り込む{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}</span>
            <span className="tag-accordion-arrow">{tagsOpen ? '▲' : '▼'}</span>
          </button>
          {tagsOpen && (
            <div className="tag-filter">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag ${selectedTags.includes(tag) ? 'tag--active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button className="tag tag--clear" onClick={() => setSelectedTags([])}>
                  × クリア
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rank-filter">
        <span className="rank-filter-label">得意度</span>
        {[0, 1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            className={`rank-filter-btn ${selectedRank === n ? 'rank-filter-btn--active' : ''}`}
            onClick={() => setSelectedRank(selectedRank === n ? null : n)}
          >
            {n === 0 ? '未' : '★'.repeat(n)}
          </button>
        ))}
        {selectedRank !== null && (
          <button className="tag tag--clear" onClick={() => setSelectedRank(null)}>
            × クリア
          </button>
        )}
      </div>

      <div className="ref-filter">
        <span className="rank-filter-label">音源</span>
        <button
          className={`rank-filter-btn ${filterUrl ? 'rank-filter-btn--active' : ''}`}
          onClick={() => setFilterUrl(v => !v)}
        >
          URL あり
        </button>
        <button
          className={`rank-filter-btn ${filterFile ? 'rank-filter-btn--active' : ''}`}
          onClick={() => setFilterFile(v => !v)}
        >
          ファイルあり
        </button>
        {(filterUrl || filterFile) && (
          <button className="tag tag--clear" onClick={() => { setFilterUrl(false); setFilterFile(false); }}>
            × クリア
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {songs.length === 0 ? (
            <>
              <p>曲がまだありません</p>
              <button className="btn btn--primary" onClick={() => setFormTarget('new')}>
                最初の曲を追加
              </button>
            </>
          ) : (
            <p>条件に一致する曲が見つかりません</p>
          )}
        </div>
      ) : (
        <div className="song-list">
          {filtered.map(song => (
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
                <div className="song-item-row2">
                  {song.artist && <span className="song-item-artist">{song.artist}</span>}
                  {song.rank > 0 && (
                    <span className="song-rank">
                      {'★'.repeat(song.rank)}{'☆'.repeat(5 - song.rank)}
                    </span>
                  )}
                </div>
                <div className="song-item-meta">
                  <span>{formatDuration(song.durationSec)}</span>
                  {(song.usageCount || 0) > 0 && (
                    <span className="song-meta-usage">採用：{song.usageCount}</span>
                  )}
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
                      <a
                        href={song.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ref-badge"
                        onClick={e => e.stopPropagation()}
                      >
                        参考URL
                      </a>
                    )}
                    {song.referenceFileUrl && (
                      <a
                        href={song.referenceFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ref-badge ref-badge--file"
                        onClick={e => e.stopPropagation()}
                      >
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
          initial={formTarget === 'new' ? {} : formTarget}
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
