import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetlists } from '../hooks/useSetlists';
import { useSongs } from '../hooks/useSongs';
import SetlistCard from '../components/SetlistCard';
import SetlistFormModal from '../components/SetlistFormModal';
import ConfirmModal from '../components/ConfirmModal';

export default function HomePage() {
  const navigate = useNavigate();
  const { setlists, loading, createSetlist, deleteSetlist } = useSetlists();
  const { songs } = useSongs();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = async data => {
    const id = await createSetlist(data);
    setShowForm(false);
    navigate(`/setlist/${id}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">セットリスト</h1>
        <button className="btn btn--primary" onClick={() => setShowForm(true)}>
          + 新しいセットリスト
        </button>
      </div>

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : setlists.length === 0 ? (
        <div className="empty-state">
          <p>セットリストがまだありません</p>
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            最初のセットリストを作成
          </button>
        </div>
      ) : (
        <div className="setlist-grid">
          {setlists.map(sl => (
            <SetlistCard
              key={sl.id}
              setlist={sl}
              songs={songs}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showForm && (
        <SetlistFormModal
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`「${deleteTarget.name}」を削除しますか？`}
          onConfirm={() => {
            deleteSetlist(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
