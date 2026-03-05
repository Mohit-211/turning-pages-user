import './BookProgress.scss';

export default function BookProgress({ title, progress, from, to }) {
  return (
    <div className="book-progress">
      <div className="book-progress__header">
        <span className="book-progress__title">{title}</span>
        <span className="book-progress__pct">{progress}%</span>
      </div>
      <div className="book-progress__track">
        <div
          className="book-progress__fill"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(to right, ${from}, ${to})`,
          }}
        />
      </div>
    </div>
  );
}
