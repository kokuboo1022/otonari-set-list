import { memberColor } from '../constants';

export default function MemberAvatar({ name, order, size = 36, photoURL }) {
  const initial = name ? [...name][0] : '?';
  const bg = memberColor(order ?? 0);
  return (
    <div
      className="member-avatar"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
      title={name}
    >
      {photoURL
        ? <img src={photoURL} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
        : initial}
    </div>
  );
}
