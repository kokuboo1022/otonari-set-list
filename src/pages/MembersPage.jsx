import { useState, useRef } from 'react';
import { useMembers } from '../hooks/useMembers';
import ConfirmModal from '../components/ConfirmModal';
import MemberAvatar from '../components/MemberAvatar';
import { INSTRUMENT_OPTIONS, instrumentEmoji } from '../constants';

function resizeToBase64(file, maxSize = 240) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });
}

function MemberForm({ initial = {}, order = 0, onSave, onCancel }) {
  const [name, setName] = useState(initial.name || '');
  const [instruments, setInstruments] = useState(initial.instruments || []);
  const [mainInstrument, setMainInstrument] = useState(initial.mainInstrument || '');
  const [input, setInput] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initial.photoURL || '');
  const fileInputRef = useRef();

  const addInstrument = val => {
    if (val && !instruments.includes(val)) setInstruments(prev => [...prev, val]);
    setInput('');
  };
  const removeInstrument = v => {
    setInstruments(prev => prev.filter(i => i !== v));
    if (mainInstrument === v) setMainInstrument('');
  };
  const toggleMain = v => setMainInstrument(prev => prev === v ? '' : v);

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), instruments, mainInstrument, photoFile, photoURL: photoPreview });
  };

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <div className="member-form-top">
        <button type="button" className="avatar-upload-btn" onClick={() => fileInputRef.current.click()} title="写真を変更">
          <MemberAvatar name={name || '?'} order={order} size={52} photoURL={photoPreview} />
          <span className="avatar-upload-overlay">📷</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="名前"
          required
          autoFocus
        />
      </div>
      <div className="field">
        <span className="field-label">担当楽器</span>
        <div className="instrument-picker">
          {INSTRUMENT_OPTIONS.map(opt => (
            <button
              key={opt.label}
              type="button"
              className={`instrument-chip ${instruments.includes(opt.label) ? 'instrument-chip--on' : ''}`}
              onClick={() =>
                instruments.includes(opt.label)
                  ? removeInstrument(opt.label)
                  : addInstrument(opt.label)
              }
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
        <div className="instrument-custom">
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="その他（自由入力）"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                addInstrument(input.trim());
              }
            }}
          />
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => addInstrument(input.trim())}>
            追加
          </button>
        </div>
        {instruments.length > 0 && (
          <div className="selected-instruments">
            <p className="field-hint">★ をクリックしてメイン楽器を設定</p>
            {instruments.map(v => {
              const isMain = mainInstrument === v;
              return (
                <span key={v} className={`tag tag--removable ${isMain ? 'tag--main' : ''}`}>
                  <button type="button" className="main-flag-btn" onClick={() => toggleMain(v)}
                    title={isMain ? 'メイン解除' : 'メインに設定'}>
                    {isMain ? '★' : '☆'}
                  </button>
                  {instrumentEmoji(v)} {v}
                  <button type="button" className="tag-remove" onClick={() => removeInstrument(v)}>×</button>
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="member-form-actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn btn--primary btn--sm">保存</button>
      </div>
    </form>
  );
}

export default function MembersPage() {
  const { members, loading, addMember, updateMember, deleteMember } = useMembers();
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAdd = async ({ photoFile, ...data }) => {
    if (photoFile) data.photoURL = await resizeToBase64(photoFile);
    await addMember(data);
    setAdding(false);
  };

  const handleEdit = async ({ photoFile, ...data }) => {
    if (photoFile) data.photoURL = await resizeToBase64(photoFile);
    await updateMember(editTarget.id, data);
    setEditTarget(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">メンバー</h1>
        {!adding && (
          <button className="btn btn--primary" onClick={() => setAdding(true)}>
            + メンバー追加
          </button>
        )}
      </div>

      {adding && (
        <MemberForm
          order={members.length}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : members.length === 0 && !adding ? (
        <div className="empty-state">
          <p>メンバーがまだいません</p>
          <button className="btn btn--primary" onClick={() => setAdding(true)}>
            最初のメンバーを追加
          </button>
        </div>
      ) : (
        <div className="member-list">
          {members.map((member, i) => (
            <div key={member.id} className="member-item">
              {editTarget?.id === member.id ? (
                <MemberForm
                  initial={member}
                  order={member.order ?? i}
                  onSave={handleEdit}
                  onCancel={() => setEditTarget(null)}
                />
              ) : (
                <>
                  <div className="member-item-info">
                    <MemberAvatar name={member.name} order={member.order ?? i} size={44} photoURL={member.photoURL} />
                    <div>
                      <div className="member-item-name">{member.name}</div>
                      {member.instruments?.length > 0 && (
                        <div className="member-item-instruments">
                          {member.instruments.map(v => (
                            <span key={v} className={`member-instrument-badge ${member.mainInstrument === v ? 'member-instrument-badge--main' : ''}`}>
                              {member.mainInstrument === v && '★'}{instrumentEmoji(v)} {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="member-item-actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditTarget(member)}>
                      編集
                    </button>
                    <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(member)}>
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`「${deleteTarget.name}」を削除しますか？`}
          onConfirm={() => { deleteMember(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
