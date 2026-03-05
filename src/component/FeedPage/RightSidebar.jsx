import './RightSidebar.scss';

const STEPS = [
  { label: 'Draft',     done: true },
  { label: 'AI Review', done: true },
  { label: 'Dev Edit',  done: false, active: true },
  { label: 'Proofread', done: false },
  { label: 'Publish',   done: false },
];

const TRENDING = [
  { tag: '#AIWriting',       count: '2.4k posts' },
  { tag: '#DevEditTips',     count: '1.1k posts' },
  { tag: '#CoverDesign',     count: '893 posts'  },
  { tag: '#FantasyAuthors',  count: '742 posts'  },
  { tag: '#ManuscriptReady', count: '601 posts'  },
];

const EDITORS = [
  { name: 'Marcus Aldren', status: 'Dev Editing',  color: '#059669' },
  { name: 'Diane Lowe',    status: 'Proofreading', color: '#db2777' },
  { name: 'Ravi Mehta',    status: 'Copyediting',  color: '#2563eb' },
];

export default function RightSidebar() {
  return (
    <aside className="right-sidebar">

      {/* Active Project */}
      <div className="right-sidebar__card">
        <h3 className="right-sidebar__card-title">My Active Project</h3>
        <div className="right-sidebar__project-header">
          <div className="right-sidebar__book-thumb">📖</div>
          <div>
            <p className="right-sidebar__book-title">The Infinite Cartographer</p>
            <p className="right-sidebar__book-meta">Fantasy · 94,200 words</p>
          </div>
        </div>
        <div className="right-sidebar__steps">
          {STEPS.map((s) => (
            <div key={s.label} className="right-sidebar__step">
              <div className={`right-sidebar__step-dot right-sidebar__step-dot--${s.done ? 'done' : 'pending'}`}>
                {s.done && '✓'}
              </div>
              <span className={`right-sidebar__step-label right-sidebar__step-label--${s.done ? 'done' : 'pending'}`}>
                {s.label}
              </span>
              {s.active && <span className="right-sidebar__step-status">In Queue</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="right-sidebar__card">
        <h3 className="right-sidebar__card-title">Trending</h3>
        <div className="right-sidebar__trending-list">
          {TRENDING.map((t) => (
            <div key={t.tag} className="right-sidebar__trending-row">
              <span className="right-sidebar__trending-tag">{t.tag}</span>
              <span className="right-sidebar__trending-count">{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Editors */}
      <div className="right-sidebar__card">
        <h3 className="right-sidebar__card-title">Active Editors</h3>
        <div className="right-sidebar__editors-list">
          {EDITORS.map((e) => (
            <div key={e.name} className="right-sidebar__editor-row">
              <div
                className="right-sidebar__editor-avatar"
                style={{
                  background: `${e.color}15`,
                  color:       e.color,
                  border:      `1px solid ${e.color}30`,
                }}
              >
                {e.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="right-sidebar__editor-name">{e.name}</p>
                <p className="right-sidebar__editor-status">{e.status}</p>
              </div>
              <div className="right-sidebar__online-dot" />
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
