import { useState, useEffect } from 'react';
import { useMembers } from '../hooks/useMembers';
import MemberAvatar from './MemberAvatar';
import { instrumentEmoji } from '../constants';

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

export default function SongFormModal({ initial = {}, onSave, onClose }) {
  const { members } = useMembers();
  const [title, setTitle] = useState(initial.title || '');
  const [artist, setArtist] = useState(initial.artist || '');
  const [duration, setDuration] = useState(formatDuration(initial.durationSec));
  const [tempo, setTempo] = useState(initial.tempo || '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [rank, setRank] = useState(initial.rank || 0);
  const [instruments, setInstruments] = useState(initial.instruments || {});
  const [tags, setTags] = useState(initial.tags || []);

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

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput('');
  };
  const removeTag = tag => setTags(tags.filter(t => t !== tag));
  const handleTagKeyDown = e => {
    if ((e.key === 'Enter' || e.key === ',') && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.stopPropagation();
      addTag();
    }
  };

  const setMemberInstrument = (id, val) =>
    setInstruments(prev => ({ ...prev, [id]: val }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), artist: artist.trim(), durationSec: parseDuration(duration), tempo, notes: notes.trim(), rank, instruments, tags });
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
              <span className="field-label">テンポ</span>
              <select className="input" value={tempo} onChange={e => setTempo(e.target.value)}>
                <option value="">未設定</option>
                <option value="high">速い (High)</option>
                <option value="middle">中 (Middle)</option>
                <option value="low">遅い (Low)</option>
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
              <input className="tag-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown} onBlur={addTag} placeholder="タグ入力 → Enter" />
            </div>
            <p className="field-hint">Enter またはカンマで追加、複数可</p>
          </div>

          <div className="field">
            <span className="field-label">得意度</span>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                  className={`star-btn ${n <= rank ? 'star-btn--on' : ''}`}
                  onClick={() => setRank(n === rank ? 0 : n)}>★</button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">メモ・注意事項</span>
            <textarea className="input textarea" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="例: イントロは D→G→A、2番からハーモニーあり" rows={3} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn--primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
