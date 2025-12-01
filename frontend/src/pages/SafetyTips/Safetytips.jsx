import React, { useState } from "react";
import "./SafetyTips.css";

export default function SafetyTips() {

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);

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
        comment,
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: numericRating,
          comment,
        }),
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
    <div className="safety-container">
      <h1 className="safety-title">Welcome to the Safety Page</h1>
      <p className="safety-subheading">
        Learn about ways to stay safe walking alone at night and provide feedback on your experience using our route planner. 
      </p>

      {/* Tips Section */}
      <div className="safety-section">
        <h2 className="section-title">Tips</h2>

        <h3 className="section-subtitle">Stay Alert</h3>
        <ul className="section-text">
          <li>Keep your head up</li>
          <li>Make eye contact with others</li>
          <li>Don’t wear headphones</li>
          <li>Avoid hoodies that block peripheral vision</li>
        </ul>

        <h3 className="section-subtitle">Plan Your Route</h3>
        <ul className="section-text">
          <li>Check your route ahead of time</li>
          <li>Tell someone when you expect to return</li>
          <li>Wear reflective clothing for visibility</li>
        </ul>
      </div>

      {/* Resources Section */}
      <div className="safety-section">
        <h2 className="section-title">External Resources</h2>
        <ul className="section-text">
          <li>Emergency Line: 9-1-1</li>
          <li>Non-Emergency (Suspicious Activity): 613-236-1222</li>
          <li>City of Ottawa Emergency Info: Community Planning</li>
          <li>Women & Children Shelter (Domestic Abuse): 2-1-1</li>
          <li>Indigenous Crisis Line: 1-855-242-3310</li>
        </ul>

        <h3 className="section-subtitle">Campus Emergency Lines</h3>
        <ul className="section-text">
          <li>uOttawa: 613-562-5411</li>
          <li>Carleton: 613-520-4444</li>
          <li>Algonquin College: EXT. 5000</li>
        </ul>
      </div>

      {/* Formulaire de feedback */}
      <div
        style={{
          marginTop: "15px",
          padding: "16px",
          background: "#0e243d",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>We want to hear your feedback!</h2>
        <p style={{ fontSize: "18px" }}>
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
