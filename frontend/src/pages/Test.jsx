import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import ResultsDisplay from "../components/ResultsDisplay";
import { questions } from "../data/questions";
import api from "../services/api";

export default function Test() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("elif_user") || "null");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "success" });
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const handleSelect = (questionId, choice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (answeredCount !== questions.length) {
      const errorMsg = "Please answer all questions to submit.";
      console.log("Setting popup with:", errorMsg);
      setPopup({ message: errorMsg, type: "error" });
      return;
    }

    const payload = {
      user_id: user.id,
      answers: questions.map((q) => ({
        question_id: q.id,
        dimension: q.dimension,
        choice: answers[q.id].toUpperCase(),
      })),
    };

    try {
      setLoading(true);
      
      // Submit test to API
      const response = await api.post("/submit-test", payload);
      
      // Show results after successful submission
      setResults(response.data);
      setShowResults(true);
      
      // Download PDF
      const pdfResponse = await api.get(`/results/${user.id}/pdf`, {
        responseType: "blob",
      });
      const pdfBlob =
        pdfResponse.data instanceof Blob
          ? pdfResponse.data
          : new Blob([pdfResponse.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `EI_Result_User_${user.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(pdfUrl);
      
    } catch (error) {
      console.log("Error object:", error);
      console.log("Error response:", error?.response);
      console.log("Error data:", error?.response?.data);
      
      let msg = "Failed to submit test.";
      
      // Try to extract message from various error formats
      if (error?.response?.data?.detail && typeof error.response.data.detail === 'string') {
        msg = error.response.data.detail;
      } else if (error?.response?.data?.msg && typeof error.response.data.msg === 'string') {
        msg = error.response.data.msg;
      } else if (error?.response?.data?.msg && typeof error.response.data.msg === 'object') {
        // Handle case where msg is an object - extract the actual message
        const msgObj = error.response.data.msg;
        if (msgObj?.msg && typeof msgObj.msg === 'string') {
          msg = msgObj.msg;
        } else if (msgObj?.detail && typeof msgObj.detail === 'string') {
          msg = msgObj.detail;
        } else {
          msg = "Validation error occurred.";
        }
      } else if (error?.response?.data && typeof error.response.data === 'object') {
        // Handle case where the entire data object is the error
        const dataObj = error.response.data;
        console.log("Data object:", dataObj);
        
        if (dataObj?.msg && typeof dataObj.msg === 'string') {
          msg = dataObj.msg;
        } else if (dataObj?.detail && typeof dataObj.detail === 'string') {
          msg = dataObj.detail;
        } else if (dataObj?.msg && typeof dataObj.msg === 'object') {
          // Handle nested msg object
          const nestedMsg = dataObj.msg;
          if (nestedMsg?.msg && typeof nestedMsg.msg === 'string') {
            msg = nestedMsg.msg;
          } else if (nestedMsg?.detail && typeof nestedMsg.detail === 'string') {
            msg = nestedMsg.detail;
          } else {
            msg = "Validation error: Please check your input.";
          }
        } else {
          msg = "API error occurred. Please try again.";
        }
      } else if (error?.message && typeof error.message === 'string') {
        msg = error.message;
      } else if (error?.msg && typeof error.msg === 'string') {
        msg = error.msg;
      } else if (typeof error === 'string') {
        msg = error;
      } else {
        // If we can't extract a proper string, use a generic message
        msg = "There was an error submitting your test. Please try again.";
      }
      
      console.log("Final message type:", typeof msg);
      console.log("Final message value:", msg);
      
      // ABSOLUTE SAFETY - Never pass anything that's not a clean string
      let safeMessage = "An error occurred. Please try again.";
      
      if (typeof msg === 'string' && !msg.includes('[object') && !msg.includes('{') && !msg.includes('}')) {
        safeMessage = msg;
      }
      
      console.log("Safe message:", safeMessage);
      setPopup({ message: safeMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("elif_user");
    navigate("/login");
  };

  // If results are shown, display results page
  if (showResults && results) {
    return (
      <main className="page">
        {/* Simple Logout Button Only */}
        <div style={{ position: 'fixed', top: '56px', right: '40px', zIndex: 1000 }}>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <ResultsDisplay results={results} user={user} />

        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup({ message: "", type: "success" })}
        />
      </main>
    );
  }

  return (
    <main className="page">
      {/* Simple Logout Button Only */}
      <div style={{ position: 'fixed', top: '56px', right: '40px', zIndex: 1000 }}>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Header from HTML reference */}
      <header id="testHeader">
        <div className="brand">
          <div className="brand-dot"></div>
          <span className="brand-name">Elif Healthcare</span>
        </div>
        <h1>Emotional <em>Intelligence</em><br />Assessment</h1>
        <p className="subtitle"></p>
      </header>

      {/* Progress Bar */}
      <div className="progress-wrap" id="progressWrap">
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" id="progressFill" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
        </div>
        <div className="progress-label" id="progressLabel">{answeredCount} / {questions.length}</div>
      </div>

      {/* Info Chips */}
      <div className="intro-card" id="introCard" style={{ opacity: 1, transform: 'none' }}>
        <div className="card">
          <p>This is a <strong>forced-choice</strong> test — for each pair, select the statement that best describes you. Do not over-analyse or think of exceptions. Be spontaneous.</p>
          <p>If a question feels very close, you may revisit it after completing the others. Answer honestly for the most accurate reflection of your EI profile.</p>
        </div>
      </div>

      {/* Questions */}
      <div className="questions-wrap" id="questionsWrap">
        {/* Self-Awareness & Self-Management Section */}
        <div className="section-label">Self-Awareness & Self-Management</div>
        {questions.slice(0, 20).map((q, index) => (
          <div key={q.id} className={`question-card ${answers[q.id] ? 'answered' : ''}`} id={`qc${index}`} style={{ opacity: 1, transform: 'none' }}>
            <div className="q-header">
              <div className="q-num" id={`qn${index}`}>{index + 1}</div>
              <div className="q-text">{q.question}</div>
            </div>
            <div className="options">
              <label className={`option-label ${answers[q.id] === 'a' ? 'selected' : ''}`} id={`oa${index}`} onClick={() => handleSelect(q.id, 'a')}>
                <input type="radio" name={`q${q.id}`} value="a" />
                <div className="radio-custom"><div className="radio-dot"></div></div>
                <span className="opt-letter">A</span>
                <span className="opt-text">{q.optionA}</span>
              </label>
              <label className={`option-label ${answers[q.id] === 'b' ? 'selected' : ''}`} id={`ob${index}`} onClick={() => handleSelect(q.id, 'b')}>
                <input type="radio" name={`q${q.id}`} value="b" />
                <div className="radio-custom"><div className="radio-dot"></div></div>
                <span className="opt-letter">B</span>
                <span className="opt-text">{q.optionB}</span>
              </label>
            </div>
          </div>
        ))}

        {/* Social Awareness Section */}
        <div className="section-label">Social Awareness</div>
        {questions.slice(20, 25).map((q, index) => {
          const globalIndex = index + 20;
          return (
            <div key={q.id} className={`question-card ${answers[q.id] ? 'answered' : ''}`} id={`qc${globalIndex}`} style={{ opacity: 1, transform: 'none' }}>
              <div className="q-header">
                <div className="q-num" id={`qn${globalIndex}`}>{globalIndex + 1}</div>
                <div className="q-text">{q.question}</div>
              </div>
              <div className="options">
                <label className={`option-label ${answers[q.id] === 'a' ? 'selected' : ''}`} id={`oa${globalIndex}`} onClick={() => handleSelect(q.id, 'a')}>
                  <input type="radio" name={`q${q.id}`} value="a" />
                  <div className="radio-custom"><div className="radio-dot"></div></div>
                  <span className="opt-letter">A</span>
                  <span className="opt-text">{q.optionA}</span>
                </label>
                <label className={`option-label ${answers[q.id] === 'b' ? 'selected' : ''}`} id={`ob${globalIndex}`} onClick={() => handleSelect(q.id, 'b')}>
                  <input type="radio" name={`q${q.id}`} value="b" />
                  <div className="radio-custom"><div className="radio-dot"></div></div>
                  <span className="opt-letter">B</span>
                  <span className="opt-text">{q.optionB}</span>
                </label>
              </div>
            </div>
          );
        })}

        {/* Relationship Management Section */}
        <div className="section-label">Relationship Management</div>
        {questions.slice(25, 40).map((q, index) => {
          const globalIndex = index + 25;
          return (
            <div key={q.id} className={`question-card ${answers[q.id] ? 'answered' : ''}`} id={`qc${globalIndex}`} style={{ opacity: 1, transform: 'none' }}>
              <div className="q-header">
                <div className="q-num" id={`qn${globalIndex}`}>{globalIndex + 1}</div>
                <div className="q-text">{q.question}</div>
              </div>
              <div className="options">
                <label className={`option-label ${answers[q.id] === 'a' ? 'selected' : ''}`} id={`oa${globalIndex}`} onClick={() => handleSelect(q.id, 'a')}>
                  <input type="radio" name={`q${q.id}`} value="a" />
                  <div className="radio-custom"><div className="radio-dot"></div></div>
                  <span className="opt-letter">A</span>
                  <span className="opt-text">{q.optionA}</span>
                </label>
                <label className={`option-label ${answers[q.id] === 'b' ? 'selected' : ''}`} id={`ob${globalIndex}`} onClick={() => handleSelect(q.id, 'b')}>
                  <input type="radio" name={`q${q.id}`} value="b" />
                  <div className="radio-custom"><div className="radio-dot"></div></div>
                  <span className="opt-letter">B</span>
                  <span className="opt-text">{q.optionB}</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="submit-wrap" id="submitWrap">
        <button className="submit-btn" id="submitBtn" onClick={handleSubmit} disabled={loading || answeredCount !== questions.length}>
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Score My Test
            </>
          )}
        </button>
        <div className="unanswered-note" id="unansweredNote">
          {answeredCount === questions.length ? "All 40 answered — ready to score!" : `${questions.length - answeredCount} question${questions.length - answeredCount === 1 ? '' : 's'} remaining.`}
        </div>
      </div>

      <Popup
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ message: "", type: "success" })}
      />
    </main>
  );
}
