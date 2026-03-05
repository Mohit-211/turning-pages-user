import './FeedTabs.scss';

const TABS = ['All', 'Authors', 'Editorial', 'Announcements', 'Covers'];

export default function FeedTabs({ activeTab, onTabChange }) {
  return (
    <div className="feed-tabs">
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`feed-tabs__btn${activeTab === tab.toLowerCase() ? ' feed-tabs__btn--active' : ''}`}
          onClick={() => onTabChange(tab.toLowerCase())}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
