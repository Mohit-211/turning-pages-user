import './CoverPreview.scss';

export default function CoverPreview({ colorClass, title }) {
  return (
    <div className={`cover-preview cover-preview--${colorClass}`}>
      <div className="cover-preview__dots" />
      <div className="cover-preview__glow" />

      <div className="cover-preview__meta">
        <p className="cover-preview__label">Book Cover</p>
        <p className="cover-preview__title">{title}</p>
      </div>

      <div className="cover-preview__ai-badge">TAV Generated ✦</div>
    </div>
  );
}
