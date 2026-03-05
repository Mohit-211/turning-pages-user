import './LeftNav.scss';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Feed' },
  { icon: '📝', label: 'My Manuscripts' },
  { icon: '✏️', label: 'Editorial Queue' },
  { icon: '🤖', label: 'AI Tools' },
  { icon: '🎨', label: 'Cover Studio' },
  { icon: '📤', label: 'Publish' },
  { icon: '⚙️', label: 'Settings' },
];

export default function LeftNav({ active = 'Feed' }) {
  return (
    <div className="left-nav">
      <nav className="left-nav__inner">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`left-nav__item${item.label === active ? ' left-nav__item--active' : ''}`}
          >
            <span className="left-nav__item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
