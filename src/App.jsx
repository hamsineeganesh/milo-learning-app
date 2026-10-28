import { useState } from "react";
import QuestOne from "./QuestOne";
import LevelTwoMarket from "./LevelTwoMarket";
import "./App.css";
import { miloService } from "./services/miloAI";
import ParentGuide from "./ParentGuide";
function App() {
  const [page, setPage] = useState("home");
  
  const [childName, setChildName] = useState(() => localStorage.getItem("miloChildName") || "");
  const [hasProfile, setHasProfile] = useState(
  () => localStorage.getItem("miloHasProfile") === "true");
 const [childAge, setChildAge] = useState(
  () => localStorage.getItem("miloChildAge") || "5");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileReturnPage, setProfileReturnPage] = useState("home");
  const [selectedCharacter, setSelectedCharacter] = useState("Mia");
  const [selectedLevel, setSelectedLevel] = useState(() => Number(localStorage.getItem("miloSelectedLevel") || 1));
  const [completedLevels, setCompletedLevels] = useState(() => { try { return JSON.parse(localStorage.getItem("miloCompletedLevels") || "[]"); } catch { return []; } });
  const [dashboardTab, setDashboardTab] = useState("dashboard");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("miloSoundEnabled") !== "false");
  const [narrationEnabled, setNarrationEnabled] = useState(() => localStorage.getItem("miloNarrationEnabled") !== "false");
  const [visualTheme, setVisualTheme] = useState(() => localStorage.getItem("miloVisualTheme") || "warm");
  const progressPercent = Math.round(completedLevels.length / 5 * 100);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(() => Math.max(1, Number(localStorage.getItem("miloHighestUnlockedLevel") || 1)));
  const [miloSpeech, setMiloSpeech] = useState("");
  function saveChildProfile(event) {
  event.preventDefault();

  const name = childName.trim();
  if (!name) return;

  localStorage.setItem("miloChildName", name);
  localStorage.setItem("miloChildAge", childAge);
  localStorage.setItem("miloHasProfile", "true");

  setChildName(name);
  setHasProfile(true);
  setShowProfileForm(false);
  setPage(profileReturnPage);
}

function openChildArea() {
  if (hasProfile) {
    setPage("characters");
  } else {
    setProfileReturnPage("home");
    setShowProfileForm(true);
  }
}

function openProfileForm() {
  setProfileReturnPage(page);
  setPage("home");
  setShowProfileForm(true);
}

function closeProfileForm() {
  setShowProfileForm(false);
  setPage(profileReturnPage);
}
  async function pickCharacter(name) {
    setSelectedCharacter(name);
    const cheer = await miloService.getCharacterCheer(name);
    setMiloSpeech(cheer);
  }

  function recordCompletedLevel(level, title, skills, note) {
    setCompletedLevels((old) => { const previous = old.find((item) => item.level === level); const entry = { level, title, skills, note, completedAt: previous ? previous.completedAt : new Date().toISOString() }; const next = previous ? old.map((item) => item.level === level ? entry : item) : [entry, ...old]; localStorage.setItem("miloCompletedLevels", JSON.stringify(next)); return next; });
    const unlocked = Math.max(highestUnlockedLevel, level + 1); setHighestUnlockedLevel(unlocked); localStorage.setItem("miloHighestUnlockedLevel", String(unlocked)); setSelectedLevel(Math.min(level + 1, 5)); localStorage.setItem("miloSelectedLevel", String(Math.min(level + 1, 5)));
  }

  return (
    <div className={"app-shell theme-" + visualTheme}>
      {page === "home" && (
        <main className="home-page">
          <header className="home-header">
            <button className="brand" onClick={() => setPage("home")} aria-label="MILO home">
              <span className="brand-mark">M</span>
              <span>
                MILO<span className="brand-dot">.</span>
              </span>
            </button>
          </header>

          <section className="home-content">
            <div className="hero-heading">
              <span className="eyebrow">✦ A GENTLE WORLD TO EXPLORE</span>
              <h1>
                Your learning<br />
                <span className="gold-text">adventure</span><br />
                starts here.
              </h1>
            </div>

            <div className="home-tiles">
              <button className="home-tile child-tile" onClick={openChildArea}>
                <span className="tile-icon">🌻</span>
                <span className="tile-label">CHILD</span>
                <strong>{hasProfile ? "Continue adventure" : "Start adventure"}</strong>
                <span className="tile-description">
                  {hasProfile ? `Ready to explore, ${childName}!` : "Choose your character and explore"}
                </span>
                <span className="tile-arrow" aria-hidden="true">→</span>
              </button>

              <button className="home-tile caregiver-tile" onClick={() => setPage("caregiver")}>
                <span className="tile-icon">🪴</span>
                <span className="tile-label">CAREGIVER</span>
                <strong>Caregiver space</strong>
                <span className="tile-description">Create a child profile and view progress</span>
                <span className="tile-arrow" aria-hidden="true">→</span>
              </button>
            </div>

            <p className="home-footnote">A small adventure made for curious minds.</p>
          </section>

          {showProfileForm && (
            <div
              className="modal-backdrop"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeProfileForm();
              }}
            >
              <section className="profile-modal" role="dialog">
                <button
                  className="modal-close"
                  onClick={closeProfileForm}
                >
                  ×
                </button>
                <span className="tile-icon">🌱</span>
                <h2>Meet our explorer!</h2>
                <p>Let's make a little space for your adventure.</p>

                <form onSubmit={saveChildProfile}>
                  <label htmlFor="child-name">Child's name</label>
                  <input
                    id="child-name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter a name"
                    required
                    maxLength={30}
                  />

                  <label htmlFor="child-age">Child's age</label>
                  <select
                    id="child-age"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
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
            <button className="brand dashboard-brand" onClick={() => setPage("home")}>
              <span className="brand-mark">M</span>
              <span>MILO<span className="brand-dot">.</span></span>
            </button>
            <p className="sidebar-caption">CAREGIVER SPACE</p>
            <button className={"sidebar-link " + (dashboardTab === "dashboard" ? "active" : "")} onClick={() => setDashboardTab("dashboard")}><span>⌂</span> Dashboard</button>
            <button className="sidebar-link" onClick={() => setDashboardTab("profile")}><span>♡</span> Child Profile</button>
            <button className={"sidebar-link " + (dashboardTab === "progress" ? "active" : "")} onClick={() => setDashboardTab("progress")}><span>◷</span> Progress & Growth</button>
            <button className={"sidebar-link " + (dashboardTab === "skills" ? "active" : "")} onClick={() => setDashboardTab("skills")}><span>✿</span> Skills</button><button className="sidebar-link" onClick={() => setDashboardTab("history")}><span>☷</span> Learning History</button><button className="sidebar-link" onClick={() => setDashboardTab("recommendations")}><span>✧</span> Recommendations</button><button className="sidebar-link" onClick={() => setDashboardTab("settings")}><span>⚙</span> Settings</button>
            <div className="sidebar-bottom">
              <span>MADE FOR LITTLE MINDS</span>
              <p>Small steps, real progress.</p>
              <button onClick={() => setPage("home")}>← Back to home</button>
            </div>
          </aside>

          <section className="dashboard-main">
            <header className="dashboard-header">
              <div>
                <span className="eyebrow">YOUR CAREGIVER SPACE</span>
                <h1>Learning & growth</h1>
              </div>
              <button className="primary-button small-button" onClick={openProfileForm}>
                + Add child
              </button>
            </header>

            <section className="dashboard-section children-section">
              <h2>Your children</h2>
              {hasProfile ? (
                <article className="child-profile-card">
                  <div className="child-avatar">🌼</div>
                  <div className="child-profile-info">
                    <h3>{childName}</h3>
                    <p>Age {childAge} · Little explorer</p>
                    <div className="progress-track"><span style={{ width: progressPercent + "%" }} /></div>
                    <small>{completedLevels.length} levels completed · Level {highestUnlockedLevel} unlocked</small>
                  </div>
                </article>
              ) : (
                <div className="empty-state">
                  <span className="empty-illustration">🌷</span>
                  <h3>Your first little explorer</h3>
                  <button className="primary-button" onClick={openProfileForm}>
                    Create child profile →
                  </button>
                </div>
              )}
            </section>
            {dashboardTab === "progress" && <section className="dashboard-section children-section"><span className="eyebrow">PROGRESS &amp; GROWTH</span><h2>Progress has many shapes.</h2><p>Completed learning moments for {childName || "your explorer"}.</p><div className="progress-summary-row"><div><strong>{completedLevels.length}</strong><span>levels completed</span></div><div><strong>{highestUnlockedLevel}</strong><span>level unlocked</span></div><div><strong>{progressPercent}%</strong><span>adventure progress</span></div></div><div className="progress-track large-progress-track"><span style={{ width: progressPercent + "%" }} /></div>{completedLevels.length ? completedLevels.map((item) => <article className="progress-moment-card" key={item.level}><h3>{item.title}</h3><p>{item.skills.join(" · ")}</p><small>{item.note}</small></article>) : <p>Your first completed activity will appear here after a level is finished.</p>}</section>}
            {dashboardTab === "skills" && <section className="dashboard-section children-section"><span className="eyebrow">SKILLS</span><h2>Skills grow in stories.</h2><div className="skill-grid">{["Emotional understanding","Sequencing","Communication","Planning","Money choices"].map((skill) => { const done=completedLevels.some((item)=>item.skills.includes(skill)); return <article className={"skill-card "+(done?"skill-ready":"")} key={skill}><h3>{skill}</h3><small>{done?"Practised in a completed level":"Ready when they are"}</small></article>; })}</div></section>}
            {dashboardTab === "history" && <section className="dashboard-section children-section"><span className="eyebrow">LEARNING HISTORY</span><h2>A gentle timeline of practice.</h2>{completedLevels.length ? completedLevels.map((item)=><article className="timeline-entry-card" key={item.level}><small>{new Date(item.completedAt).toLocaleDateString()}</small><h3>{item.title}</h3><p>{item.note}</p><small>Skills: {item.skills.join(", ")}</small></article>) : <p>Your first completed activity will appear here with its skills and a short note.</p>}</section>}
            {dashboardTab === "recommendations" && <section className="dashboard-section children-section"><span className="eyebrow">RECOMMENDATIONS</span><h2>Support that fits the moment.</h2><p>Choose a familiar activity and let your child set the pace.</p><button className="secondary-button" onClick={() => setPage("garden")}>View the garden map →</button></section>}
            {dashboardTab === "settings" && <section className="dashboard-section children-section"><span className="eyebrow">SETTINGS</span><h2>A comfortable space for learning.</h2><p>These preferences are saved on this device.</p><div className="settings-grid"><label className="setting-card">Sound effects <input type="checkbox" checked={soundEnabled} onChange={(e) => { setSoundEnabled(e.target.checked); localStorage.setItem("miloSoundEnabled", String(e.target.checked)); }} /></label><label className="setting-card">Narration <input type="checkbox" checked={narrationEnabled} onChange={(e) => { setNarrationEnabled(e.target.checked); localStorage.setItem("miloNarrationEnabled", String(e.target.checked)); }} /></label><label className="setting-card">Visual comfort <select value={visualTheme} onChange={(e) => { setVisualTheme(e.target.value); localStorage.setItem("miloVisualTheme", e.target.value); }}><option value="warm">Warm light</option><option value="soft">Soft green</option><option value="lavender">Soft lavender</option></select></label></div></section>}
            {dashboardTab === "dashboard" && <ParentGuide />}
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
            <button className="garden-button" onClick={() => setPage("garden")}>
              Garden Map →
            </button>
          </header>

          <section className="character-intro">
            <span className="character-eyebrow">✨ CHOOSE YOUR ADVENTURE FRIEND</span>
            <h1>Pick your character</h1>
            <p>Your friend explores each story right alongside puppy Milo!</p>
          </section>

          <section className="character-grid">
            {[
              {
                name: "Chutki",
                emoji: "🌸",
                label: "Curious & Nature Lover",
                description: "Wears her blue beret & overalls, loves tucking seeds into warm soil.",
                image: "/assets/char_chutki.png",
              },
              {
                name: "Mia",
                emoji: "💗",
                label: "Gentle & Creative",
                description: "Cozy lavender sweater with bunny pouch, loves sunny colors and kindness.",
                image: "/assets/char_mia.png",
              },
              {
                name: "Levi",
                emoji: "🌞",
                label: "Energetic Explorer",
                description: "Sunny yellow hoodie and bright smile, eager to explore every secret garden path.",
                image: "/assets/char_levi.png",
              },
              {
                name: "Ash",
                emoji: "⭐",
                label: "Clever & Patient",
                description: "Comfy casual style, loves solving puzzles, listening to birds, and steady steps.",
                image: "/assets/char_ash.png",
              },
            ].map((character) => (
              <article
                className={`character-card ${selectedCharacter === character.name ? "selected" : ""}`}
                key={character.name}
              >
                <span className="character-tag">{character.emoji} {character.name.toUpperCase()}</span>
                <div className="character-image">
                  <img src={character.image} alt={character.name} />
                </div>
                <h2>{character.name}</h2>
                <p className="character-label">{character.label}</p>
                <p className="character-description">{character.description}</p>
                <button
                  className={selectedCharacter === character.name ? "character-select selected-button" : "character-select"}
                  onClick={() => pickCharacter(character.name)}
                >
                  {selectedCharacter === character.name ? "Selected ✓" : `Choose ${character.name}`}
                </button>
              </article>
            ))}
          </section>

          <footer className="character-footer">
            <div className="puppy-message">
              <span className="puppy-emoji">🐶</span>
              <p>
                <strong>Puppy Milo:</strong>{" "}
                {miloSpeech || (selectedCharacter
                  ? `“Woof! ${selectedCharacter} is ready for a wonderful adventure!” 💗`
                  : "“Woof! Let's choose an adventure friend!”")}
              </p>
            </div>
            <button className="start-story-button" onClick={() => setPage("garden")}>
              Start Story on Map →
            </button>
          </footer>
        </main>
      )}

      {page === "garden" && (
        <main className="garden-world">
          <button
  className="garden-home-button"
  onClick={() => setPage("home")}
  aria-label="Return to the MILO home page"
>
  ← Home
</button>
          <section className="garden-scroll">
            <div className="garden-map-canvas">
              <img
                className="garden-background"
                src="/assets/garden_map.jpg"
                alt="Illustrated MILO learning garden map"
              />

              {[
                { level: 1, top: "13%", left: "23%" },
                { level: 2, top: "29%", left: "51%" },
                { level: 3, top: "43%", left: "45%" },
                { level: 4, top: "58%", left: "55%" },
                { level: 5, top: "73%", left: "40%" },
              ].map(({ level, top, left }) => {
                const unlocked = level <= highestUnlockedLevel;
                return (
                  <div key={level} className="garden-level-position" style={{ top, left }}>
                    {selectedLevel === level && (
                      <div className="playing-companions">
                        <img
                          src={`/assets/char_${(selectedCharacter || "Mia").toLowerCase()}.png`}
                          alt={selectedCharacter}
                          className="playing-character"
                        />
                        <img src="/assets/milo.png" alt="Milo" className="playing-milo" />
                      </div>
                    )}
                    <button
                      className={`garden-level-button level-${level} ${selectedLevel === level ? "currently-playing" : ""}`}
                      disabled={!unlocked}
                      onClick={() => {
                        if (!unlocked) return;
                        setSelectedLevel(level); localStorage.setItem("miloSelectedLevel", String(level));
                        if (level === 1) setPage("story");
                        if (level === 2) setPage("level2");
                      }}
                    >
                      {level}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {page === "story" && (
        <QuestOne
          selectedCharacter={selectedCharacter}
          onBack={() => setPage("garden")}
          onNextLevel={() => {
            recordCompletedLevel(1, "The Little Seed", ["Emotional understanding", "Sequencing"], "Practised caring for a seed and following story steps.");
            setSelectedLevel(2);
            setPage("level2");
          }}
        />
      )}

      {page === "level2" && (
        <LevelTwoMarket
          selectedCharacter={selectedCharacter}
          onDone={() => setPage("garden")}
          onComplete={() => {
            recordCompletedLevel(2, "Smart Shopping", ["Money choices", "Planning", "Decision making"], "Practised choosing items within budget and saving the rest.");
            setSelectedLevel(3);
            setPage("garden");
          }}
        />
      )}
    </div>
  );
}

export default App;