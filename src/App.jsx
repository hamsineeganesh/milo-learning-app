

import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("5");
  const [hasProfile, setHasProfile] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  function saveChildProfile(event) {
    event.preventDefault();

    if (!childName.trim()) return;

    setHasProfile(true);
    setShowProfileForm(false);
    setPage("home");
  }

  function openChildArea() {
    if (hasProfile) {
      setPage("characters");
    } else {
      setShowProfileForm(true);
    }
  }

  function openProfileForm() {
    setPage("home");
    setShowProfileForm(true);
  }

  return (
    <div className="app-shell">
      {page === "home" && (
        <main className="home-page">
          <header className="home-header">
            <button
              className="brand"
              onClick={() => setPage("home")}
              aria-label="MILO home"
            >
              <span className="brand-mark">M</span>
              <span>
                MILO<span className="brand-dot">.</span>
              </span>
            </button>
          </header>

          <section className="home-content">
            <div className="hero-heading">
              <span className="eyebrow">
                ✦ A GENTLE WORLD TO EXPLORE
              </span>

              <h1>
                Your learning
                <br />
                <span className="gold-text">adventure</span>
                <br />
                starts here.
              </h1>
            </div>

            <div className="home-tiles">
              <button
                className="home-tile child-tile"
                onClick={openChildArea}
              >
                <span className="tile-icon">🌻</span>
                <span className="tile-label">CHILD</span>

                <strong>
                  {hasProfile
                    ? "Continue adventure"
                    : "Start adventure"}
                </strong>

                <span className="tile-description">
                  {hasProfile
                    ? `Ready to explore, ${childName}!`
                    : "Choose your character and explore"}
                </span>

                <span className="tile-arrow" aria-hidden="true">
                  →
                </span>
              </button>

              <button
                className="home-tile caregiver-tile"
                onClick={() => setPage("caregiver")}
              >
                <span className="tile-icon">🪴</span>
                <span className="tile-label">CAREGIVER</span>

                <strong>Caregiver space</strong>

                <span className="tile-description">
                  Create a child profile and view progress
                </span>

                <span className="tile-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>

            <p className="home-footnote">
              A small adventure made for curious minds.
            </p>
          </section>

          {showProfileForm && (
            <div
              className="modal-backdrop"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setShowProfileForm(false);
                }
              }}
            >
              <section
                className="profile-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-heading"
              >
                <button
                  className="modal-close"
                  onClick={() => setShowProfileForm(false)}
                  aria-label="Close profile form"
                >
                  ×
                </button>

                <span className="tile-icon">🌱</span>
                <h2 id="profile-heading">Meet our explorer!</h2>
                <p>
                  Let's make a little space for your adventure.
                </p>

                <form onSubmit={saveChildProfile}>
                  <label htmlFor="child-name">Child's name</label>
                  <input
                    id="child-name"
                    value={childName}
                    onChange={(event) =>
                      setChildName(event.target.value)
                    }
                    placeholder="Enter a name"
                    required
                    maxLength={30}
                  />

                  <label htmlFor="child-age">Child's age</label>
                  <select
                    id="child-age"
                    value={childAge}
                    onChange={(event) =>
                      setChildAge(event.target.value)
                    }
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                      <option key={age} value={String(age)}>
                        {age} years old
                      </option>
                    ))}
                  </select>

                  <button className="primary-button" type="submit">
                    Create profile
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      )}

      {page === "caregiver" && (
        <main className="dashboard">
          <aside className="sidebar">
            <button
              className="brand dashboard-brand"
              onClick={() => setPage("home")}
            >
              <span className="brand-mark">M</span>
              <span>
                MILO<span className="brand-dot">.</span>
              </span>
            </button>

            <p className="sidebar-caption">CAREGIVER SPACE</p>

            <button className="sidebar-link active">
              <span>⌂</span> Dashboard
            </button>
            <button
              className="sidebar-link"
              onClick={openProfileForm}
            >
              <span>♡</span> Child Profile
            </button>
            <button className="sidebar-link">
              <span>◷</span> Progress & Growth
            </button>
            <button className="sidebar-link">
              <span>✿</span> Skills
            </button>
            <button className="sidebar-link">
              <span>▤</span> Learning History
            </button>
            <button className="sidebar-link">
              <span>✧</span> Recommendations
            </button>
            <button className="sidebar-link">
              <span>⚙</span> Settings
            </button>

            <div className="sidebar-bottom">
              <span>MADE FOR LITTLE MINDS</span>
              <p>Small steps, real progress.</p>
              <button onClick={() => setPage("home")}>
                ← Back to home
              </button>
            </div>
          </aside>

          <section className="dashboard-main">
            <header className="dashboard-header">
              <div>
                <span className="eyebrow">YOUR CAREGIVER SPACE</span>
                <h1>Learning & growth</h1>
              </div>

              <button
                className="primary-button small-button"
                onClick={openProfileForm}
              >
                + Add child
              </button>
            </header>

            <section className="dashboard-section children-section">
              <span className="eyebrow">YOUR LITTLE EXPLORERS</span>
              <h2>Your children</h2>
              <p>
                Each child has their own adventure and progress.
              </p>

              {hasProfile ? (
                <article className="child-profile-card">
                  <div className="child-avatar">🌼</div>

                  <div className="child-profile-info">
                    <h3>{childName}</h3>
                    <p>Age {childAge} · Little explorer</p>

                    <div className="progress-track">
                      <span style={{ width: "10%" }} />
                    </div>

                    <small>Getting started</small>
                  </div>
                </article>
              ) : (
                <div className="empty-state">
                  <span className="empty-illustration">🌷</span>
                  <h3>Your first little explorer</h3>
                  <p>
                    Create a child profile to begin tracking learning
                    activities and progress.
                  </p>
                  <button
                    className="primary-button"
                    onClick={openProfileForm}
                  >
                    Create child profile →
                  </button>
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <span className="eyebrow">A LITTLE AT A TIME</span>
              <h2>Shape the adventure together.</h2>
              <p className="section-description">
                Start with gentle settings that fit your child's needs.
              </p>

              <div className="settings-grid">
                <article className="setting-card">
                  <span className="setting-icon mint">♫</span>
                  <div>
                    <h3>Sound & narration</h3>
                    <p>Choose a comfortable sound level.</p>
                  </div>
                  <span className="setting-value">Soft</span>
                </article>

                <article className="setting-card">
                  <span className="setting-icon blue">☼</span>
                  <div>
                    <h3>Visual comfort</h3>
                    <p>Keep the experience calm and clear.</p>
                  </div>
                  <span className="setting-value">Minimal</span>
                </article>

                <article className="setting-card">
                  <span className="setting-icon yellow">◷</span>
                  <div>
                    <h3>Session plan</h3>
                    <p>Choose a gentle learning duration.</p>
                  </div>
                  <span className="setting-value">5 minutes</span>
                </article>

                <article className="setting-card">
                  <span className="setting-icon lavender">♡</span>
                  <div>
                    <h3>Learning style</h3>
                    <p>Support learning with pictures and words.</p>
                  </div>
                  <span className="setting-value">Both</span>
                </article>
              </div>
            </section>

            <footer className="dashboard-footer">
              This is a local demo. Progress is not sent to a server.
            </footer>
          </section>
        </main>
      )}

      {page === "characters" && (
        <main className="coming-soon">
          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Home
          </button>

          <span className="eyebrow">YOUR ADVENTURE BEGINS</span>
          <h1>Choose your explorer, {childName}!</h1>
          <p>
            Next, we'll add the four illustrated characters here.
          </p>

          <div className="coming-soon-card">
            <span>🌷</span>
            <h2>Choose your favourite</h2>
            <p>
              This is a placeholder for the character selection screen.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
