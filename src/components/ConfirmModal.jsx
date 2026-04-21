export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onCancel}>キャンセル</button>
          <button className="btn btn--danger" onClick={onConfirm}>削除する</button>
        </div>
      </div>
    </div>
  );
}
