

import { useState } from "react";
import "./PlantingGame.css";

const stages = [
  {
    image: "garden-step-1-empty-pot.png",
    title: "A little empty pot",
    message: "Let's plant a tiny seed together!",
    button: "🌰 Plant the seed",
    voice: "Let's plant a tiny seed together!",
    speaker: "girl",
  },
  {
    image: "garden-step-2-seed-planted.png",
    title: "The tiny seed",
    message: "Great job! Our tiny seed is in the pot.",
    button: "🪴 Cover with soil",
    voice: "Great job! Our tiny seed is in the pot.",
    speaker: "girl",
  },
  {
    image: "garden-step-3-covered-soil.png",
    title: "A cosy little home",
    message: "Now the seed is tucked safely into the soil.",
    button: "💧 Water the seed",
    voice: "Now the seed is tucked safely into the soil.",
    speaker: "grandpa",
  },
  {
    image: "garden-step-4-watering.png",
    title: "A little drink",
    message: "Plants need water to grow. Well done!",
    button: "☀️ Give it sunlight",
    voice: "Plants need water to grow. Well done!",
    speaker: "grandpa",
  },
  {
    image: "garden-step-5-sprout-sunlight.png",
    title: "A tiny green sprout",
    message: "Look! A little sprout is growing!",
    button: "🌸 Help it bloom",
    voice: "Look! A little sprout is growing!",
    speaker: "girl",
  },
  {
    image: "garden-step-6-flower-bloom.png",
    title: "Our flower has bloomed!",
    message: "We did it! With care and patience, our flower grew.",
    button: "🌱 Grow another flower",
    voice: "Hooray! Our flower has bloomed! We did it together!",
    speaker: "girl",
  },
];

export default function PlantingGame({
  selectedCharacter = "Mia",
  onDone,
  onNextLevel,
}) {
  const [step, setStep] = useState(0);
  const [showCharacter, setShowCharacter] = useState(true);

  const current = stages[step];
  const finished = step === stages.length - 1;

  function speak(text, speaker) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const english = voices.filter((v) =>
      v.lang.toLowerCase().startsWith("en")
    );

    const preferred = speaker === "grandpa"
      ? /david|daniel|james|mark|guy/i
      : /samantha|aria|jenny|zira|susan/i;

    utterance.voice =
      english.find((v) => preferred.test(v.name)) ||
      english[0] ||
      null;
    utterance.rate = 0.88;
    utterance.pitch = speaker === "grandpa" ? 0.85 : 1.1;

    window.speechSynthesis.speak(utterance);
  }

  function advance() {
    if (finished) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (onNextLevel) {
    onNextLevel();
  } else if (onDone) {
    onDone();
  } else {
    setStep(0);
  }

  return;
}

    const next = step + 1;
    setStep(next);
    speak(stages[next].voice, stages[next].speaker);
  }

  return (
    <main className="plant-game-page">
      <header className="plant-game-header">
  <div className="plant-game-heading">
    <p>MILO'S GARDEN ADVENTURE</p>
    <h1>Quest 1 — The Little Seed 🌱</h1>
    <span>Gardening time · Step {step + 1} of 6</span>
  </div>

  <button
    className="plant-game-map-button"
    type="button"
    onClick={() => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      onDone?.();
    }}
  >
    ← Back to map
  </button>
</header>

      <div className="plant-game-progress">
        <div
          style={{ width: `${((step + 1) / 6) * 100}%` }}
        />
      </div>

      <section className="plant-game-card">
        <div className={`plant-game-scene plant-game-stage-${step + 1}`} key={current.image}>
          <img
            key={current.image}
            className="plant-game-background"
            src={`/assets/plant-story/${current.image}`}
            alt={current.title}
          />

          {showCharacter && (
            <img
              className="plant-game-character"
              src={`/assets/char_${(
                selectedCharacter || "Mia"
              ).toLowerCase()}.png`}
              alt={selectedCharacter || "Mia"}
              onError={() => setShowCharacter(false)}
            />
          )}
        </div>

        <div className="plant-game-story">
          <h2>{current.title}</h2>
          <p>{current.message}</p>

          <button
            className="plant-game-listen"
            onClick={() => speak(current.voice, current.speaker)}
          >
            🔊 Listen to the story
          </button>

          {finished ? (
            <div className="plant-game-celebration">
              <span>🌸</span>
              <p>Wonderful work! You helped the flower grow.</p>
            </div>
          ) : null}

          <button
            className="plant-game-action"
            onClick={advance}
          >
            {finished
  ? onNextLevel
    ? "Continue→"
    : "Finish Quest ✓"
  : current.button}
          </button>

          
        </div>
      </section>
    </main>
  );
}

