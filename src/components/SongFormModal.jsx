import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useMembers } from '../hooks/useMembers';
import MemberAvatar from './MemberAvatar';
import { instrumentEmoji } from '../constants';
import { storage } from '../firebase';

function parseDuration(str) {
  if (!str) return 0;
  const parts = str.split(':');
  if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  return parseInt(str) || 0;
}

function formatDuration(sec) {
  if (!sec) return '';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function SongFormModal({ initial = {}, onSave, onClose, existingTags = [] }) {
  const { members } = useMembers();
  const [title, setTitle] = useState(initial.title || '');
  const [nickname, setNickname] = useState(initial.nickname || '');
  const [artist, setArtist] = useState(initial.artist || '');
  const [duration, setDuration] = useState(formatDuration(initial.durationSec));
  const [tempo, setTempo] = useState(initial.tempo || '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [rank, setRank] = useState(initial.rank || 0);
  const [instruments, setInstruments] = useState(initial.instruments || {});
  const [tags, setTags] = useState([...(initial.tags || [])]);
  const [referenceUrl, setReferenceUrl] = useState(initial.referenceUrl || '');
  const [referenceFileUrl, setReferenceFileUrl] = useState(initial.referenceFileUrl || '');
  const [referenceFileName, setReferenceFileName] = useState(initial.referenceFileName || '');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial.id && members.length > 0) {
      setInstruments(prev => {
        const defaults = {};
        members.forEach(m => { if (m.mainInstrument) defaults[m.id] = m.mainInstrument; });
        return Object.keys(prev).length === 0 ? defaults : prev;
      });
    }
  }, [members]);
  const [tagInput, setTagInput] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const tagSuggestions = tagInput.trim()
    ? existingTags.filter(t => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase().trim()))
    : [];

  const selectSuggestion = tag => {
    if (!tags.includes(tag)) setTags(prev => [...prev, tag]);
    setTagInput('');
    setSuggestionIndex(-1);
  };

  const addTag = () => {
    if (suggestionIndex >= 0 && tagSuggestions[suggestionIndex]) {
      selectSuggestion(tagSuggestions[suggestionIndex]);
      return;
    }
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag]);
    setTagInput('');
    setSuggestionIndex(-1);
  };

  const removeTag = tag => setTags(tags.filter(t => t !== tag));

  const handleTagKeyDown = e => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex(i => tagSuggestions.length ? Math.min(i + 1, tagSuggestions.length - 1) : -1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex(i => Math.max(i - 1, -1));
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setTagInput('');
      setSuggestionIndex(-1);
      return;
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      addTag();
    }
  };

  const setMemberInstrument = (id, val) =>
    setInstruments(prev => ({ ...prev, [id]: val }));

  const handleFileChange = e => {
    const file = e.target.files[0] || null;
    setFileToUpload(file);
  };

  const handleRemoveFile = () => {
    setReferenceFileUrl('');
    setReferenceFileName('');
    setFileToUpload(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) return;

    let fileUrl = referenceFileUrl;
    let fileName = referenceFileName;

    if (fileToUpload) {
      setUploading(true);
      try {
        const storageRef = ref(storage, `songs/${Date.now()}_${fileToUpload.name}`);
        await uploadBytes(storageRef, fileToUpload);
        fileUrl = await getDownloadURL(storageRef);
        fileName = fileToUpload.name;
      } finally {
        setUploading(false);
      }
    }

    onSave({
      title: title.trim(),
      nickname: nickname.trim(),
      artist: artist.trim(),
      durationSec: parseDuration(duration),
      tempo,
      notes: notes.trim(),
      rank,
      instruments,
      tags,
      referenceUrl: referenceUrl.trim(),
      referenceFileUrl: fileUrl,
      referenceFileName: fileName,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{initial.title ? '曲を編集' : '曲を追加'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span className="field-label">曲名 *</span>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="例: The Bucks of Oranmore" required autoFocus />
          </label>
          <label className="field">
            <span className="field-label">通称・別名</span>
            <input className="input" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="例: バックスオブオラン" />
          </label>
          <label className="field">
            <span className="field-label">アーティスト / トラッド</span>
            <input className="input" value={artist} onChange={e => setArtist(e.target.value)}
              placeholder="例: Traditional" />
          </label>
          <div className="field-row">
            <label className="field">
              <span className="field-label">演奏時間（M:SS）</span>
              <input className="input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="3:30" />
            </label>
            <label className="field">
              <span className="field-label">ジャンル</span>
              <select className="input" value={tempo} onChange={e => setTempo(e.target.value)}>
                <option value="">未設定</option>
                <option value="jig">ジグ</option>
                <option value="polka">ポルカ</option>
                <option value="waltz">ワルツ</option>
                <option value="reel">リール</option>
                <option value="hornpipe">ホーンパイプ</option>
                <option value="slip_jig">スリップジグ</option>
                <option value="other">その他</option>
              </select>
            </label>
          </div>

          {members.length > 0 && (
            <div className="field">
              <span className="field-label">使用楽器</span>
              <div className="instrument-assign-list">
                {members.map((m, i) => {
                  const val = instruments[m.id] ?? '';
                  const isOff = val === '降り番';
                  const memberInstruments = m.instruments || [];
                  return (
                    <div key={m.id} className={`instrument-assign-row ${isOff ? 'instrument-assign-row--off' : ''}`}>
                      <MemberAvatar name={m.name} order={m.order ?? i} size={34} />
                      <span className="instrument-assign-name">{m.name}</span>
                      <select
                        className="input instrument-assign-select"
                        value={isOff ? '降り番' : val}
                        onChange={e => setMemberInstrument(m.id, e.target.value)}
                        disabled={isOff}
                      >
                        <option value="">— 未設定 —</option>
                        {memberInstruments.map(v => (
                          <option key={v} value={v}>{instrumentEmoji(v)} {v}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={`btn btn--sm ${isOff ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setMemberInstrument(m.id, isOff ? '' : '降り番')}
                      >
                        {isOff ? '復帰' : '降り番'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="field">
            <span className="field-label">タグ</span>
            <div className="tag-input-wrap">
              {tags.map(t => (
                <span key={t} className="tag tag--removable">
                  {t}
                  <button type="button" className="tag-remove" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                className="tag-input"
                value={tagInput}
                onChange={e => { setTagInput(e.target.value); setSuggestionIndex(-1); }}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  setSuggestionIndex(-1);
                  const tag = tagInput.trim();
                  if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag]);
                  setTagInput('');
                }}
                placeholder="タグ入力 → Enter"
                autoComplete="off"
              />
            </div>
            {tagSuggestions.length > 0 && (
              <div className="tag-suggestions">
                {tagSuggestions.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    className={`tag-suggestion-item ${i === suggestionIndex ? 'tag-suggestion-item--active' : ''}`}
                    onMouseDown={e => { e.preventDefault(); selectSuggestion(t); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {!tagInput.trim() && existingTags.filter(t => !tags.includes(t)).length > 0 && (
              <div className="tag-candidates">
                {existingTags.filter(t => !tags.includes(t)).map(t => (
                  <button key={t} type="button" className="tag tag--candidate"
                    onClick={() => setTags(prev => [...prev, t])}>
                    + {t}
                  </button>
                ))}
              </div>
            )}
            <p className="field-hint">Enter またはカンマで追加、↑↓で候補を選択</p>
          </div>

          <div className="field">
            <span className="field-label">得意度</span>
            <div className="rank-select">
              <button
                type="button"
                className={`rank-candidate-btn ${rank === 0 ? 'rank-candidate-btn--active' : ''}`}
                onClick={() => setRank(0)}
              >
                候補曲
              </button>
              <div className={`star-input ${rank > 0 ? 'star-input--has-rank' : ''}`}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    className={`star-btn ${n <= rank ? 'star-btn--on' : ''}`}
                    onClick={() => setRank(n === rank ? 0 : n)}>★</button>
                ))}
              </div>
            </div>
            <p className="field-hint">得意度未設定の曲は「候補曲リスト」に表示されます</p>
          </div>

          <label className="field">
            <span className="field-label">メモ・注意事項</span>
            <textarea className="input textarea" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="例: イントロは D→G→A、2番からハーモニーあり" rows={3} />
          </label>

          <div className="field ref-section">
            <span className="field-label">参考音源</span>
            <label className="field">
              <span className="field-sublabel">URL（YouTube・SoundCloud など）</span>
              <input
                className="input"
                type="url"
                value={referenceUrl}
                onChange={e => setReferenceUrl(e.target.value)}
                placeholder="https://youtu.be/..."
              />
            </label>
            <div className="field">
              <span className="field-sublabel">音源ファイル（音声・動画）</span>
              {referenceFileUrl && !fileToUpload && (
                <div className="ref-file-current">
                  <a href={referenceFileUrl} target="_blank" rel="noreferrer" className="ref-file-name">
                    {referenceFileName || 'アップロード済みファイル'}
                  </a>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={handleRemoveFile}>
                    削除
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="file-input"
              />
              {fileToUpload && (
                <p className="field-hint">{fileToUpload.name} をアップロードします</p>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={uploading}>
              キャンセル
            </button>
            <button type="submit" className="btn btn--primary" disabled={uploading}>
              {uploading ? 'アップロード中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
