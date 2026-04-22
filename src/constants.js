export const INSTRUMENT_OPTIONS = [
  { label: 'ギター',         emoji: '🎸' },
  { label: 'G・ギター',      emoji: '🎸' },
  { label: 'フィドル',       emoji: '🎻' },
  { label: 'ピアノ',         emoji: '🎹' },
  { label: 'アコーディオン', emoji: '🪗' },
  { label: 'D・アコ', emoji: '🪗' },
  { label: 'バウロン',       emoji: '🥁' },
  { label: 'フルート',       emoji: '🪈' },
  { label: 'I・フルート',    emoji: '🪈' },
  { label: 'ホイッスル', emoji: '🪈' },
];

export const MEMBER_COLORS = [
  '#3d7a56',
  '#2e6fa8',
  '#b84c37',
  '#7048a8',
  '#a88730',
  '#2e9898',
];

export const instrumentEmoji = label => {
  const found = INSTRUMENT_OPTIONS.find(i => i.label === label);
  return found?.emoji ?? '🎵';
};

export const memberColor = order =>
  MEMBER_COLORS[order % MEMBER_COLORS.length];
