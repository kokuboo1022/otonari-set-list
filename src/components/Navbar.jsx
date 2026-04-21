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
      </div>
    </nav>
  );
}
