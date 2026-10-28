import { useState } from "react";
import "./ParentGuide.css";

const API = "http://localhost:5000/api/milo/parent-guide";
const EXAMPLES = [
  "How can I make homework less overwhelming?",
  "How can I help my child follow a morning routine?",
  "How can I make learning colours more engaging?",
];
const SECTIONS = [
  ["perspective", "Understanding your child's perspective", "perspective", "💛"],
  ["strategies", "3 practical strategies to try", "strategies", "🌿"],
  ["activitySteps", "Step-by-step activity to do together", "activity", "🪴"],
  ["phrases", "Gentle phrases you can use", "phrases", "💬"],
  ["adaptations", "Ways to simplify or adapt", "adaptations", "🧩"],
  ["breakSigns", "Signs your child may need a break", "breaks", "☁️"],
  ["reflectionQuestion", "A reflection question for you", "reflection", "🌱"],
];

function AnswerText({ value }) {
  if (Array.isArray(value)) {
    return <ol>{value.map((item, index) => <li key={index}>{item}</li>)}</ol>;
  }
  return <p>{value}</p>;
}

export default function ParentGuide() {
  const [question, setQuestion] = useState("");
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState("");
  const [activityType, setActivityType] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryRequest, setRetryRequest] = useState(null);

  async function requestGuide(payload, isFollowUp) {
    if (!payload.question.trim() || loading) return;
    setLoading(true);
    setError("");
    setRetryRequest({ payload, isFollowUp });
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          history: (isFollowUp ? conversation.slice(-6) : []).map((turn) => ({
            question: turn.question,
            answer: turn.sections,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "MILO couldn't get a response. Please try again.");
      if (!data.sections) throw new Error("MILO's response was incomplete. Please try again.");
      setConversation((current) => [...current, { question: payload.question, sections: data.sections }]);
      if (isFollowUp) setFollowUp("");
      else setQuestion("");
    } catch (err) {
      setError(err.message || "MILO couldn't get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function submitQuestion(event) {
    event.preventDefault();
    if (!question.trim()) { setError("Please describe what you would like help with."); return; }
    setConversation([]);
    requestGuide({ question: question.trim(), learningGoal: goal, interests: interests.trim(), activityType }, false);
  }

  function submitFollowUp(event) {
    event.preventDefault();
    if (!followUp.trim()) { setError("Type a follow-up question first."); return; }
    requestGuide({ question: followUp.trim(), learningGoal: goal, interests: interests.trim(), activityType }, true);
  }

  function retry() {
    if (retryRequest) requestGuide(retryRequest.payload, retryRequest.isFollowUp);
  }

  return (
    <section className="milo-parent-guide dashboard-section" aria-labelledby="milo-guide-title">
      <header className="milo-guide-heading">
        <img src="/assets/milo.png" alt="" />
        <div><span className="eyebrow">PARENT SUPPORT</span><h2 id="milo-guide-title">Ask MILO</h2><p>Explore practical ideas for your child's learning, together.</p></div>
      </header>

      <form className="milo-guide-form" onSubmit={submitQuestion}>
        <label htmlFor="milo-question">What would you like help with?</label>
        <textarea id="milo-question" value={question} maxLength={1000} required onChange={(e) => setQuestion(e.target.value)} placeholder="Describe the learning moment in your own words…" />
        <small>{question.length}/1000. Please leave out names and identifying details.</small>
        <div className="milo-guide-examples">{EXAMPLES.map((example) => <button type="button" key={example} onClick={() => setQuestion(example)}>{example}</button>)}</div>
        <div className="milo-guide-options">
          <div><label htmlFor="milo-goal">Learning goal (optional)</label><select id="milo-goal" value={goal} onChange={(e) => setGoal(e.target.value)}><option value="">Choose a goal</option><option>Reading and language</option><option>Following routines</option><option>Communication</option><option>Early maths</option><option>Emotional understanding</option><option>Daily independence</option></select></div>
          <div><label htmlFor="milo-interests">Child's interests (optional)</label><input id="milo-interests" value={interests} maxLength={120} onChange={(e) => setInterests(e.target.value)} placeholder="Flowers, trains, music…" /></div>
          <div><label htmlFor="milo-activity">Activity style (optional)</label><select id="milo-activity" value={activityType} onChange={(e) => setActivityType(e.target.value)}><option value="">Choose a style</option><option>Story-based</option><option>Movement-based</option><option>Hands-on</option><option>Drawing or making</option><option>Quiet conversation</option></select></div>
        </div>
        <button className="primary-button milo-guide-submit" disabled={loading}>{loading && conversation.length === 0 ? "MILO is thinking…" : "Ask MILO"}</button>
      </form>

      {error && <div className="milo-guide-error" role="alert"><p>{error}</p><button type="button" disabled={loading || !retryRequest} onClick={retry}>Try again</button></div>}

      {conversation.map((turn, index) => (
        <article className="milo-guide-turn" key={index}>
          {index > 0 && <p className="milo-followup-question"><strong>Follow-up:</strong> {turn.question}</p>}
          <h3>MILO's ideas for you</h3>
          <div className="milo-guide-answer-grid">
            {SECTIONS.map(([key, title, color, icon]) => turn.sections[key] ? (
              <section className={"milo-answer-block answer-" + color} key={key}>
                <h4><span aria-hidden="true">{icon}</span>{title}</h4>
                <AnswerText value={turn.sections[key]} />
              </section>
            ) : null)}
          </div>
        </article>
      ))}

      {conversation.length > 0 && <form className="milo-followup-form" onSubmit={submitFollowUp}>
        <label htmlFor="milo-followup">Ask another question about this advice</label>
        <textarea id="milo-followup" maxLength={1000} value={followUp} onChange={(e) => setFollowUp(e.target.value)} placeholder="For example: How can I make the activity shorter?" />
        <button className="primary-button milo-guide-submit" disabled={loading}>{loading ? "MILO is thinking…" : "Ask follow-up"}</button>
      </form>}

      <p className="milo-guide-disclaimer">MILO offers educational ideas, not diagnosis or medical care. Every child is different. Adapt or stop an activity to suit your child, and consult a qualified professional when you need specialised support.</p>
    </section>
  );
}
