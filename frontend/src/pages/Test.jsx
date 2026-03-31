import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Popup from "../components/Popup";
import QuestionCard from "../components/QuestionCard";
import { questions } from "../data/questions";
import api from "../services/api";

export default function Test() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("elif_user") || "null");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "success" });

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const groupedQuestions = useMemo(() => {
    const groups = [
      {
        key: "self_block",
        title: "Self-Awareness & Self-Management",
        dimensions: ["self_awareness", "self_management"],
      },
      {
        key: "social_block",
        title: "Social Awareness",
        dimensions: ["social_awareness"],
      },
      {
        key: "relationship_block",
        title: "Relationship Management",
        dimensions: ["relationship_management"],
      },
    ];

    return groups.map((group) => ({
      ...group,
      items: questions.filter((item) => group.dimensions.includes(item.dimension)),
    }));
  }, []);

  const handleSelect = (questionId, choice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (answeredCount !== questions.length) {
      setPopup({ message: "Please answer all questions to submit.", type: "error" });
      return;
    }

    const payload = {
      user_id: user.id,
      answers: questions.map((q) => ({
        question_id: q.id,
        dimension: q.dimension,
        choice: answers[q.id],
      })),
    };

    try {
      setLoading(true);
      await api.post("/submit-test", payload);
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
      // Give the browser a moment to start the download before navigation.
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (error) {
      const msg = error?.response?.data?.detail || "Failed to submit test.";
      setPopup({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <Navbar />
      <section className="assessment-intro glass-card">
        <h2>
          Emotional <span className="title-accent">Intelligence</span> Assessment
        </h2>
        <p>
          This is a forced-choice test - for each pair, select the statement that best describes you.
          Do not over-analyse or think of exceptions. Be spontaneous.
        </p>
        <p>
          If a question feels very close, you may revisit it after completing the others. Answer
          honestly for the most accurate reflection of your EI profile.
        </p>
      </section>

      <section className="test-header">
        <p className="progress-text">{answeredCount}/{questions.length} answered</p>
      </section>

      {groupedQuestions.map((group) => (
        <section key={group.key} className="question-section">
          <div className="question-section-head">
            <h3>{group.title.toUpperCase()}</h3>
          </div>
          <section className="questions-grid">
            {group.items.map((item) => (
              <QuestionCard
                key={item.id}
                item={item}
                selected={answers[item.id]}
                onSelect={handleSelect}
              />
            ))}
          </section>
        </section>
      ))}

      <div className="submit-area">
        <button className="btn-primary test-submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <span className="submit-check">✓</span>
              <span>Score My Test</span>
            </>
          )}
        </button>
      </div>

      <Popup
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ message: "", type: "success" })}
      />
    </main>
  );
}
