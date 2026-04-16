// days: 'all' = 毎日, [0,1,2,3,4,5,6] = 曜日指定 (0=日, 1=月, ..., 6=土)
export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-1',
    name: '娘の準備',
    emoji: '👧',
  },
  {
    id: 'cat-2',
    name: '朝のルーティン',
    emoji: '☀️',
  },
  {
    id: 'cat-3',
    name: '曜日別タスク',
    emoji: '📅',
  },
];

export const DEFAULT_TASKS = [
  // 娘の準備
  { id: 'task-1', categoryId: 'cat-1', text: 'ご飯の用意', days: 'all', checked: false },
  { id: 'task-2', categoryId: 'cat-1', text: '箸・スプーンの用意', days: 'all', checked: false },
  { id: 'task-3', categoryId: 'cat-1', text: '着替えの確認', days: 'all', checked: false },

  // 朝のルーティン
  { id: 'task-4', categoryId: 'cat-2', text: '髪を縛る', days: 'all', checked: false },
  { id: 'task-5', categoryId: 'cat-2', text: '日焼け止めを塗る', days: 'all', checked: false },

  // 曜日別タスク（例）
  { id: 'task-6', categoryId: 'cat-3', text: '体操服を持たせる', days: [3], checked: false }, // 水曜
  { id: 'task-7', categoryId: 'cat-3', text: '連絡帳を確認', days: [1], checked: false }, // 月曜
];
