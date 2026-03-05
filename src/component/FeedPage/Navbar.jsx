import './Navbar.scss';

export default function Navbar() {
  return (
    <header className="navbar">
      {/* Brand */}
      <div className="navbar__brand">
        <div className="navbar__logo">✦</div>
        <div>
          <span className="navbar__name">Inkwell</span>
          <span className="navbar__sub">AI Book Publishing</span>
        </div>
      </div>

      {/* Controls */}
      <div className="navbar__controls">
        <div className="navbar__search">
          <input placeholder="Search manuscripts, authors..." />
          <span className="navbar__search-hint">⌘K</span>
        </div>

        <button className="navbar__bell">
          🔔
          <span className="navbar__bell-dot" />
        </button>

        <div className="navbar__avatar">EV</div>
      </div>
    </header>
  );
}
