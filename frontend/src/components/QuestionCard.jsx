export default function QuestionCard({ item, selected, onSelect }) {
  return (
    <article className="question-card glass-card">
      <div className="question-head">
        <span className="question-number">{item.id}</span>
        <h3>{item.question}</h3>
      </div>

      <button
        className={`choice ${selected === "A" ? "active" : ""}`}
        onClick={() => onSelect(item.id, "A")}
      >
        <span className="choice-leading">
          <span className="choice-check">{selected === "A" ? "✓" : ""}</span>
          <strong>A</strong>
        </span>
        <span className="choice-text">{item.optionA}</span>
      </button>
      <button
        className={`choice ${selected === "B" ? "active" : ""}`}
        onClick={() => onSelect(item.id, "B")}
      >
        <span className="choice-leading">
          <span className="choice-check">{selected === "B" ? "✓" : ""}</span>
          <strong>B</strong>
        </span>
        <span className="choice-text">{item.optionB}</span>
      </button>
    </article>
  );
}
