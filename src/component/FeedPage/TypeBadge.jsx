import './TypeBadge.scss';

const LABELS = {
  milestone:    'Milestone',
  editorial:    'Editorial',
  cover:        'Cover Drop',
  announcement: 'Announcement',
  review:       'Review',
};

export default function TypeBadge({ type }) {
  return (
    <span className={`type-badge type-badge--${type}`}>
      <span className="type-badge__dot" />
      {LABELS[type] ?? 'Post'}
    </span>
  );
}
