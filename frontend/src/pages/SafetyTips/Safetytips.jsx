import React, { useEffect, useState } from "react";
import { fetchSafetyTips, sendFeedback } from "../../api/client";

export default function SafetyTips() {
  const [tips, setTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [tipsError, setTipsError] = useState(null);

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);

  // Charger les safety tips depuis le backend
  useEffect(() => {
    async function loadTips() {
      try {
        setLoadingTips(true);
        setTipsError(null);
        const data = await fetchSafetyTips();
        setTips(data.tips || []);
      } catch (err) {
        console.error(err);
        setTipsError("Could not load safety tips.");
      } finally {
        setLoadingTips(false);
      }
    }

    loadTips();
  }, []);

  // Soumission du feedback
  async function handleSubmit(e) {
    e.preventDefault();
    setFeedbackMessage(null);
    setFeedbackError(null);

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      setFeedbackError("Please choose a rating between 0 and 5.");
      return;
    }

    try {
      setSending(true);
      await sendFeedback({
        rating: numericRating,
        comment,
        flags: [],
      });

      setFeedbackMessage("Thank you for your feedback!");
      setRating("");
      setComment("");
    } catch (err) {
      console.error(err);
      setFeedbackError("Could not send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="safetytips-container"
      style={{ padding: "16px", color: "white" }}
    >
      <h1>Safety tips</h1>

      {/* Liste des tips */}
      {loadingTips && <p>Loading safety tips...</p>}
      {tipsError && <p style={{ color: "salmon" }}>{tipsError}</p>}

      {!loadingTips && !tipsError && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "12px" }}>
          {tips.map((tip) => (
            <li
              key={tip.id}
              style={{
                background: "#0e243d",
                padding: "12px 14px",
                borderRadius: "10px",
                marginBottom: "8px",
              }}
            >
              <strong>{tip.category}</strong>
              <br />
              <span>{tip.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Formulaire de feedback */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#0e243d",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>Give us your feedback</h2>
        <p style={{ fontSize: "14px" }}>
          Rate how safe your last walk felt (0–5) and add a short comment if you
          want.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "12px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Rating (0–5):{" "}
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "6px" }}
              >
                <option value="">Select</option>
                <option value="0">0 – Very unsafe</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3 – Neutral</option>
                <option value="4">4</option>
                <option value="5">5 – Very safe</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Comment (optional):
              <br />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  borderRadius: "8px",
                  padding: "8px",
                }}
                placeholder="For example: The route felt safe but one segment was a bit dark..."
              />
            </label>
          </div>

          {feedbackError && (
            <p style={{ color: "salmon", marginBottom: "8px" }}>
              {feedbackError}
            </p>
          )}
          {feedbackMessage && (
            <p style={{ color: "lightgreen", marginBottom: "8px" }}>
              {feedbackMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: "#fddc5c",
              color: "#0e243d",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {sending ? "Sending..." : "Send feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
