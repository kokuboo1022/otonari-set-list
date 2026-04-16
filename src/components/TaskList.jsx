export default function TaskList({ category, tasks, onToggle, onEdit, onDeleteTask }) {
  const doneCount = tasks.filter(t => t.checked).length;

  return (
    <section className="task-section">
      <div className="section-header">
        <span className="section-emoji">{category.emoji}</span>
        <h2 className="section-title">{category.name}</h2>
        <span className="section-count">{doneCount}/{tasks.length}</span>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={`task-item ${task.checked ? 'checked' : ''}`}>
            <button
              className="task-check-btn"
              onClick={() => onToggle(task.id)}
              aria-label={task.checked ? 'チェックを外す' : 'チェックする'}
            >
              <span className="task-checkbox">{task.checked ? '✓' : ''}</span>
            </button>
            <span className="task-text" onClick={() => onToggle(task.id)}>
              {task.text}
              {Array.isArray(task.days) && (
                <span className="task-days-badge">
                  {task.days.map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join('・')}
                </span>
              )}
            </span>
            <button
              className="task-edit-btn"
              onClick={() => onEdit(task)}
              aria-label="編集"
            >
              ⋯
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
