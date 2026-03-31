export default function Popup({ type = "success", message, onClose }) {
  if (!message) return null;

  return (
    <div className="popup-overlay" role="alertdialog">
      <div className={`popup-card ${type}`}>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
