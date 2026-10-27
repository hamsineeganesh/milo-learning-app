
import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("5");
  const [hasProfile, setHasProfile] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState("Mia");
  const [selectedLevel, setSelectedLevel] = useState(1);

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
  <main className="character-page">
    <header className="character-header">
      <button className="back-button" onClick={() => setPage("home")}>
        ← Back to Home
      </button>

      <div className="character-brand">
        <span className="brand-pill">MILO</span>
        <span>EXPLORER: {childName || "Explorer"}</span>
      </div>

      <button
        className="garden-button"
        onClick={() => setPage("garden")}
      >
        Garden Map →
      </button>
    </header>

    <section className="character-intro">
      <span className="character-eyebrow">
        ✨ CHOOSE YOUR ADVENTURE FRIEND
      </span>
      <h1>Pick your character</h1>
      <p>Your friend explores each story right alongside puppy Milo!</p>
    </section>

    <section className="character-grid">
      {[
        {
          name: "Chutki",
          emoji: "🌸",
          label: "Curious & Nature Lover",
          description:
            "Wears her blue beret & overalls, loves tucking seeds into warm soil.",
          image: "/assets/char_chutki.png",
        },
        {
          name: "Mia",
          emoji: "💗",
          label: "Gentle & Creative",
          description:
            "Cozy lavender sweater with bunny pouch, loves sunny colors and kindness.",
          image: "/assets/char_mia.png",
        },
        {
          name: "Levi",
          emoji: "🌞",
          label: "Energetic Explorer",
          description:
            "Sunny yellow hoodie and bright smile, eager to explore every secret garden path.",
          image: "/assets/char_levi.png",
        },
        {
          name: "Ash",
          emoji: "⭐",
          label: "Clever & Patient",
          description:
            "Comfy casual style, loves solving puzzles, listening to birds, and steady steps.",
          image: "/assets/char_ash.png",
        },
      ].map((character) => (
        <article
          className={`character-card ${
            selectedCharacter === character.name ? "selected" : ""
          }`}
          key={character.name}
        >
          <span className="character-tag">
            {character.emoji} {character.name.toUpperCase()}
          </span>

          <div className="character-image">
            <img
              src={character.image}
              alt={`${character.name}, MILO adventure character`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextElementSibling.style.display = "grid";
              }}
            />
            <span className="character-fallback">
              {character.name === "Chutki"
                ? "👧🏻"
                : character.name === "Mia"
                ? "👧🏼"
                : character.name === "Levi"
                ? "🧒🏻"
                : "🧒🏽"}
            </span>
          </div>

          <h2>{character.name}</h2>
          <p className="character-label">{character.label}</p>
          <p className="character-description">{character.description}</p>

          <button
            className={
              selectedCharacter === character.name
                ? "character-select selected-button"
                : "character-select"
            }
            onClick={() => setSelectedCharacter(character.name)}
          >
            {selectedCharacter === character.name
              ? "Selected ✓"
              : `Choose ${character.name}`}
          </button>
        </article>
      ))}
    </section>

    <footer className="character-footer">
      <div className="puppy-message">
        <span className="puppy-emoji">🐶</span>
        <p>
          <strong>Puppy Milo:</strong>{" "}
          {selectedCharacter
            ? `“Woof! ${selectedCharacter} is ready for a wonderful adventure!” 💗`
            : "“Woof! Let's choose an adventure friend!”"}
        </p>
      </div>

      <button
        className="start-story-button"
        onClick={() => setPage("garden")}
      >
        Start Story on Map →
      </button>
    </footer>
  </main>
)}

{page === "garden" && (
  <main className="garden-world">
    

    

    <section className="garden-scroll">
      <div className="garden-map-canvas">
        <img
          className="garden-background"
          src="/assets/garden_map.jpg"
          alt="Illustrated MILO learning garden map"
        />

        {[
  { number: 1, title: "The Little Seed", top: 40, left: 21 },
  { number: 2, title: "Gentle Rain", top: 72, left: 25 },
  { number: 3, title: "Butterfly Meadow", top: 50, left: 54 },
  { number: 4, title: "The Rainbow Path", top: 65, left: 68 },
  { number: 5, title: "Friendship Bridge", top: 83, left: 48 },
  { number: 6, title: "The Flower Field", top: 30, left: 76 },
  { number: 7, title: "The Forest Trail", top: 18, left: 43 },
  { number: 8, title: "The Big Garden Tree", top: 90, left: 78 },
].map((level) => (
          <div
            className={`map-level ${
              selectedLevel === level.number ? "active-level" : ""
            }`}
            key={level.number}
            style={{
              top: `${level.top}%`,
              left: `${level.left}%`,
            }}
          >
            <div className="map-companions">
              <img
                className="map-hero-character"
                src={`/assets/char_${(
                  selectedCharacter || "Mia"
                ).toLowerCase()}.png`}
                alt={selectedCharacter || "Mia"}
              />

              <img
                className="map-puppy"
                src="/assets/milo.png"
                alt="Puppy Milo"
              />
            </div>

            <button
              className="level-marker"
              onClick={() => setSelectedLevel(level.number)}
              aria-label={`Select level ${level.number}: ${level.title}`}
            >
              <span className="level-number">{level.number}</span>
              <span className="level-star">
                {selectedLevel === level.number ? "⭐" : "🌱"}
              </span>
            </button>

            <button
              className="map-level-label"
              onClick={() => setSelectedLevel(level.number)}
            >
              {level.title}
            </button>
          </div>
        ))}
      </div>
    </section>

    
  </main>
)}

    </div>
   );
}

export default App;
