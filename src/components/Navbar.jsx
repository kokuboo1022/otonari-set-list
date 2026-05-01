import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const loc = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-primary">Setlist</span>
        <span className="navbar-logo-sub">Builder</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${loc.pathname === '/' ? 'nav-link--active' : ''}`}>
          セットリスト
        </Link>
        <Link to="/songs" className={`nav-link ${loc.pathname === '/songs' ? 'nav-link--active' : ''}`}>
          曲ライブラリ
        </Link>
        <Link to="/candidates" className={`nav-link ${loc.pathname === '/candidates' ? 'nav-link--active' : ''}`}>
          候補曲
        </Link>
        <Link to="/members" className={`nav-link ${loc.pathname === '/members' ? 'nav-link--active' : ''}`}>
          メンバー
        </Link>
      </div>
    </nav>
  );
}
