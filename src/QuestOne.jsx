import PlantingGame from "./PlantingGame";
import { useEffect, useState } from "react";
import "./QuestOne.css";
import { miloService } from "./services/miloAI";

const scenes = [
  {
    title: "The Empty Pot",
    image: "scene1-sad-empty-pot.png",
    speaker: "girl",
    dialogue: "Grandpa, look at my pot. There is no flower. I feel so sad.",
    question: "How is the little girl feeling?",
    choices: [
      { text: "She feels sad 😢", correct: true },
      { text: "She feels sleepy 😴", correct: false },
    ],
    response: "That's right! She feels sad because her pot has no flower.",
    next: 1,
  },
  {
    title: "Grandpa's Idea",
    image: "scene2-grandpa-prepares-soil.png",
    speaker: "grandpa",
    dialogue: "Don't be sad, little one! We can grow a flower together. Let's prepare the soil.",
    question: "What should we put in the pot first?",
    choices: [
      { text: "Good soil 🌱", correct: true },
      { text: "Toys and candy 🍬", correct: false },
    ],
    response: "Wonderful! Plants grow in soil.",
    next: 2,
  },
  {
    title: "Plant the Seed",
    image: "scene3-plant-the-seed.png",
    speaker: "girl",
    dialogue: "I have a tiny seed, Grandpa! I will gently place it in the soil.",
    question: "What should we plant?",
    choices: [
      { text: "A tiny seed 🌰", correct: true },
      { text: "A little stone 🪨", correct: false },
    ],
    response: "Yes! A seed can grow into a beautiful plant.",
    next: 3,
  },
  {
    title: "Time to Water",
    image: "scene4-water-the-pot.png",
    speaker: "grandpa",
    dialogue: "Well done! Now let's give our seed some water. Plants need water to grow.",
    question: "What should we give our seed?",
    choices: [
      { text: "Water 💧", correct: true },
      { text: "Soft drinks 🥤", correct: false },
    ],
    response: "Correct! Water helps our little seed grow.",
    next: 4,
  },
  {
    title: "A Little Sprout",
    image: "scene5-sprout-and-sunlight.png",
    speaker: "girl",
    dialogue: "Grandpa! Look! A tiny green sprout is growing. The sunshine is so warm!",
    question: "What helps a plant grow?",
    choices: [
      { text: "Sunlight and water ☀️💧", correct: true },
      { text: "Keeping it in the dark 🌑", correct: false },
    ],
    response: "Amazing! Plants need sunlight, water, air, and time to grow.",
    next: 5,
  },
  {
    title: "The Flower Blooms!",
    image: "scene6-happy-flower.png",
    speaker: "girl",
    dialogue: "Hooray! Our flower has bloomed! Thank you, Grandpa. I am so happy!",
    question: "How did the little girl grow her flower?",
    choices: [
      { text: "With care and patience 💗", correct: true },
      { text: "By forgetting about it 🌵", correct: false },
    ],
    response: "You did it! You helped the little girl grow a beautiful flower. Quest complete!",
    next: null,
  },
];

export default function QuestOne({ onBack, selectedCharacter = "Mia", onNextLevel }) {
  const [stage, setStage] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showPlantingGame, setShowPlantingGame] = useState(false);
  const [miloThinking, setMiloThinking] = useState(false);

  const scene = scenes[stage];

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (showPlantingGame) {
    return (
      <PlantingGame
        selectedCharacter={selectedCharacter}
        onNextLevel={onNextLevel}
        onDone={() => {
          setShowPlantingGame(false);
          setCompleted(false);
          onBack?.();
        }}
      />
    );
  }

  function speak(text, speaker = "girl") {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = speaker === "grandpa" ? 0.85 : 1.12;
    window.speechSynthesis.speak(utterance);
  }

  function chooseAnswer(choice) {
    if (answered) return;
    setAnswered(true);
    setFeedback(choice.correct ? scene.response : "Not quite! Let's try again. 🌱");
    if (choice.correct && stage === scenes.length - 1) {
      setCompleted(true);
    }
  }

  function continueStory() {
    if (!answered || completed) return;
    setStage(scene.next);
    setFeedback("");
    setAnswered(false);
  }

  function replayDialogue() {
    speak(scene.dialogue, scene.speaker);
  }

  async function askMiloClue() {
    if (miloThinking) return;
    setMiloThinking(true);
    setFeedback("Milo is whispering a clue... 🐾");
    const clue = await miloService.getQuestHint(scene.title, scene.question);
    setMiloThinking(false);
    setFeedback(clue);
    speak(clue, "grandpa");
  }

  return (
    <main className="quest-page">
      <header className="quest-header">
        <button className="quest-back" onClick={onBack || (() => window.history.back())}>
          ← Back
        </button>
        <div>
          <p className="quest-eyebrow">MILO'S GARDEN ADVENTURE</p>
          <h1>Quest 1 – The Little Seed 🌱</h1>
        </div>
        <span className="quest-progress">{stage + 1} / {scenes.length}</span>
      </header>

      <div className="quest-progress-track">
        <div
          className="quest-progress-fill"
          style={{ width: `${((stage + 1) / scenes.length) * 100}%` }}
        />
      </div>

      <section className="quest-content">
        <div className="quest-scene-card">
          <img
            key={scene.image}
            className="quest-scene-image"
            src={`/assets/quest1/${scene.image}`}
            alt={scene.title}
          />
          <div className="quest-scene-caption">
            <span>CHAPTER {stage + 1}</span>
            <h2>{scene.title}</h2>
          </div>
        </div>

        <section className="quest-story-card">
          <div className="quest-speaker-row">
            <div className="quest-speaker-avatar">
              {scene.speaker === "grandpa" ? "👴" : "👧"}
            </div>
            <div className="quest-dialogue">
              <strong>{scene.speaker === "grandpa" ? "Grandpa" : "Little Girl"}</strong>
              <p>{scene.dialogue}</p>
            </div>
            <button
              className="quest-audio-button"
              onClick={replayDialogue}
              aria-label="Play dialogue audio"
            >
              🔊
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
            <button className="quest-listen-button" style={{ marginTop: 0 }} onClick={replayDialogue}>
              ▶ Listen to story
            </button>
            <button
              className="quest-listen-button"
              style={{ marginTop: 0, background: "#fef7e4", borderColor: "#edd68a" }}
              onClick={askMiloClue}
            >
              🐾 Ask Milo for a clue
            </button>
          </div>

          {!completed && (
            <>
              <h3 className="quest-question">{scene.question}</h3>
              <div className="quest-choices">
                {scene.choices.map((choice, index) => (
                  <button
                    key={choice.text}
                    className={`quest-choice ${answered && choice.correct ? "choice-correct" : ""}`}
                    onClick={() => chooseAnswer(choice)}
                    disabled={answered}
                  >
                    <span className="choice-number">{index + 1}</span>
                    {choice.text}
                  </button>
                ))}
              </div>
            </>
          )}

          {feedback && (
            <div className={`quest-feedback ${completed ? "quest-success" : ""}`} role="status">
              {feedback}
            </div>
          )}

          {answered && !completed && (
            <button className="quest-next-button" onClick={continueStory}>
              Continue Story →
            </button>
          )}

          {completed && (
            <div className="quest-finish">
              <div className="quest-celebration">🌸 🌱 🐶</div>
              <h2>Quest Story Complete!</h2>
              <p>Great job! Would you like to hear the story again or help the flower grow?</p>

              <div className="quest-finish-actions">
                <button
                  className="quest-next-button"
                  onClick={() => {
                    setStage(0);
                    setFeedback("");
                    setAnswered(false);
                    setCompleted(false);
                  }}
                >
                  📖 Play Story Again
                </button>
                <button
                  className="quest-plant-button"
                  onClick={() => setShowPlantingGame(true)}
                >
                  🌱 Play Interactive Planting Game
                </button>
                <button className="quest-back-garden" onClick={onBack}>
                  🏡 Back to Garden
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}