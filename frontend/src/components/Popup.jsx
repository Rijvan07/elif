export default function Popup({ type = "success", message, onClose }) {
  console.log("Popup received:", { type, message, messageType: typeof message });
  
  if (!message) return null;
  
  // ABSOLUTE SAFETY - Never render anything that's not a clean string
  let safeMessage = "An error occurred. Please try again.";
  
  if (typeof message === 'string' && !message.includes('[object') && !message.includes('{') && !message.includes('}')) {
    safeMessage = message;
  }
  
  console.log("Popup safe message:", safeMessage);
  
  return (
    <div className="popup-overlay" role="alertdialog">
      <div className={`popup-card ${type}`}>
        <p>{safeMessage}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
