import { useState } from 'react';

export default function SetlistFormModal({ initial = {}, onSave, onClose }) {
  const [name, setName] = useState(initial.name || '');
  const [date, setDate] = useState(initial.date || '');
  const [venue, setVenue] = useState(initial.venue || '');

  const handleSubmit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), date, venue: venue.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{initial.name ? 'セットリストを編集' : '新しいセットリスト'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span className="field-label">セットリスト名 *</span>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: 渋谷ライブ Vol.1"
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field-label">日付</span>
            <input
              className="input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">会場</span>
            <input
              className="input"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="例: Club Shamrock"
            />
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
