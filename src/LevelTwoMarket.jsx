import { useEffect, useMemo, useRef, useState } from "react";
import "./LevelTwoMarket.css";
import { miloService } from "./services/miloAI";

const BASE = "/assets/level-two/";
const PRODUCTS = [
  { id: "cake", name: "Cake slice", price: 30, image: BASE + "cake-slice.png" },
  { id: "strawberry", name: "Strawberry", price: 10, image: BASE + "strawberry.png" },
  { id: "toycar", name: "Toy car", price: 40, image: BASE + "toy-car.png" },
  { id: "chocolate", name: "Chocolate", price: 25, image: BASE + "chocolate.png" },
  { id: "apple", name: "Apple", price: 15, image: BASE + "apple.png" },
];
const money = (value) => "₹" + value;

export default function LevelTwoMarket({
  selectedCharacter = "Mia",
  onDone,
  onComplete,
}) {
  const [screen, setScreen] = useState("intro");
  const [cartIds, setCartIds] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [support, setSupport] = useState("standard");
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [selectedItemNotice, setSelectedItemNotice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const audio = useRef(null);
  const timer = useRef(null);

  const chosen = PRODUCTS.filter((item) => cartIds.includes(item.id));
  const spent = chosen.reduce((sum, item) => sum + item.price, 0);
  const left = 100 - spent;
  const characterPath =
    "/assets/char_" + (selectedCharacter || "Mia").toLowerCase() + ".png";

  const tokens = useMemo(() => {
    const list = [];
    let value = left;

    while (value > 0) {
      const part = Math.min(10, value);
      list.push({ id: "coin-" + list.length, value: part });
      value -= part;
    }

    return list;
  }, [left]);

  const deposited = tokens.filter((coin) => savedIds.includes(coin.id));
  const saved = deposited.reduce((sum, coin) => sum + coin.value, 0);
  const allSaved = tokens.length > 0 && deposited.length === tokens.length;

  function speak(text) {
    if (!soundOn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance(text);
    line.lang = "en-IN";
    line.rate = 0.92;
    line.pitch = 1;
    window.speechSynthesis.speak(line);
  }

  useEffect(() => {
    const narration = {
      intro:
        "Grandpa says: You helped our flower grow! Shall we visit the supermarket with Milo? You have one hundred rupees to choose some treats and toys. We can save whatever is left.",
      shop:
        "Let's shop together. Choose up to five items and stay within your one hundred rupee budget. You can open the trolley to see what you have chosen.",
      summary:
        "Thoughtful shopping! You chose items within your budget. Now let's put the money left into the piggy bank.",
      saving:
        "Put your leftover money in the piggy bank. Drag a coin from the purse to the piggy bank, or click a coin if dragging is difficult.",
    }[screen];

    if (soundOn && narration) speak(narration);

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [screen, soundOn]);

  function notify(text) {
    setMessage(text);
    speak(text);

    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => setMessage(""), 3500);
  }

  function addItem(item) {
    if (cartIds.includes(item.id)) {
      notify(item.name + " is already in your trolley.");
      return;
    }

    if (item.price > left) {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      setStreak(0);
      notify(item.name + " costs " + money(item.price) + ". You have " + money(left) + " left.");
      return;
    }

    setCartIds((current) => current.concat(item.id));
    const remaining = left - item.price;
    setSelectedItemNotice({
      name: item.name,
      remaining,
      image: item.image,
    });

    const nextStreak = streak + 1;
    setStreak(nextStreak);
    notify(item.name + " chosen. You have " + money(remaining) + " left.");
  }

  function removeItem(item) {
    setCartIds((current) => current.filter((id) => id !== item.id));
    setStreak(0);
    notify(item.name + " removed.");
  }

  async function handleMiloHint() {
    if (aiLoading) return;
    setAiLoading(true);
    notify("Milo is thinking of a hint... 🐾");
    const hint = await miloService.getShoppingHint(left, chosen, support);
    setAiLoading(false);
    notify(hint);
  }

  async function deposit(id) {
    const token = tokens.find((item) => item.id === id);
    if (!token || savedIds.includes(id)) return;

    const next = savedIds.concat(id);
    setSavedIds(next);

    if (next.length === tokens.length) {
      const praise = await miloService.getSavingPraise(left);
      notify(praise);
    } else {
      notify(money(token.value) + " safely added to the piggy bank!");
    }
  }

  return (
    <main className="l2-page">
      <header className="l2-header">
        <div>
          <p>LEVEL TWO · SMART SHOPPING</p>
          <h1>
            {screen === "intro"
              ? "A trip to the supermarket"
              : screen === "shop"
                ? "Let's shop together"
                : screen === "summary"
                  ? "Our shopping basket"
                  : "Time to save"}
          </h1>
        </div>

        <div className="l2-header-actions">
          <button
            className="l2-sound-button"
            onClick={() => setSoundOn((enabled) => !enabled)}
            aria-pressed={soundOn}
          >
            {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
          </button>

          <button
            className="l2-map-button"
            onClick={() => onDone && onDone()}
          >
            ← Back to map
          </button>
        </div>
      </header>

      {screen === "intro" && (
        <section className="l2-intro">
          <div className="l2-intro-characters">
            <img src={characterPath} alt={selectedCharacter || "Mia"} />
            <img src="/assets/milo.png" alt="Milo" />
          </div>

          <article className="l2-grandpa-card">
            <span className="l2-grandpa-icon" aria-hidden="true">👴</span>
            <p className="l2-eyebrow">GRANDPA SAYS</p>
            <h2>You helped our flower grow!</h2>
            <p>
              Shall we visit the supermarket with Milo? You have ₹100 to choose
              some treats and toys. We can save whatever is left.
            </p>
            <button
              className="l2-primary"
              onClick={() => setScreen("shop")}
            >
              Let's go shopping →
            </button>
          </article>
        </section>
      )}

      {screen === "shop" && (
        <section className="l2-market">
          <div className="l2-market-top">
            <div className="l2-money-card">
              <span>Your budget</span>
              <strong>₹100</strong>
            </div>

            <div className="l2-money-card l2-left-card" aria-live="polite">
              <span>Money left</span>
              <strong>{money(left)}</strong>
            </div>

            <button
              className="l2-cart-button"
              onClick={() => setCartOpen(true)}
              aria-label={"Open trolley, " + chosen.length + " items"}
            >
              <img src={BASE + "shopping-cart.png"} alt="" />
              <span>Trolley</span>
              <b>{chosen.length}</b>
            </button>
          </div>

          <div className="l2-market-floor">
            <div className="l2-market-characters">
              <img
                className="l2-shopper-character"
                src={characterPath}
                alt={selectedCharacter || "Mia"}
              />
              <img
                className="l2-shopper-milo"
                src="/assets/milo.png"
                alt="Milo"
              />
              <img
                className="l2-floor-cart"
                src={BASE + "shopping-cart.png"}
                alt="Shopping trolley"
              />
            </div>

            <div className="l2-prompt">
              <strong>Choose what you would like.</strong>
              <span>Stay within ₹100. You can pick up to five items.</span>

              <button
                type="button"
                onClick={handleMiloHint}
                style={{ cursor: "pointer", fontWeight: "bold", color: "#4f6f3e" }}
              >
                {aiLoading ? "Asking Milo... 🐾" : "💡 Ask Milo for a hint"}
              </button>
            </div>
          </div>

          <div className="l2-checkout-bar">
            <button
              className="l2-primary l2-checkout-button"
              disabled={!chosen.length}
              onClick={() => setScreen("summary")}
            >
              Finish purchase →
            </button>
            <span>
              {chosen.length
                ? `${chosen.length} item${chosen.length === 1 ? "" : "s"} chosen · ${money(left)} left`
                : "Choose at least one item to finish"}
            </span>
          </div>

          <div className="l2-product-tray">
            <div className="l2-tray-title">
              <span>Choose an item</span>
              <span>{chosen.length} of 5 in trolley</span>
            </div>

            <div className="l2-products">
              {PRODUCTS.map((item) => {
                const added = cartIds.includes(item.id);
                const affordable = item.price <= left;

                return (
                  <button
                    key={item.id}
                    className={"l2-product" + (added ? " added" : "")}
                    onClick={() => addItem(item)}
                    aria-pressed={added}
                  >
                    <img src={item.image} alt="" />
                    <span>{item.name}</span>
                    <strong>{money(item.price)}</strong>
                    <small>{added ? "In trolley ✓" : "Add to trolley"}</small>
                  </button>
                );
              })}
            </div>
          </div>

          {message && (
            <div className="l2-toast" role="status">
              {message}
            </div>
          )}

          {selectedItemNotice && (
            <div className="l2-choice-backdrop" role="presentation">
              <section className="l2-choice-modal">
                <p className="l2-eyebrow">ADDED TO YOUR TROLLEY</p>
                <h2>{selectedItemNotice.name} chosen!</h2>
                <div className="l2-selected-item-image">
                  <img src={selectedItemNotice.image} alt={selectedItemNotice.name} />
                </div>

                <div className="l2-choice-balance">
                  <img src={BASE + "purse.png"} alt="" />
                  <span>Money left</span>
                  <strong>{money(selectedItemNotice.remaining)}</strong>
                </div>

                <p>Lovely choice! You are keeping track of your money as you shop.</p>

                <button
                  className="l2-primary"
                  onClick={() => setSelectedItemNotice(null)}
                >
                  Continue shopping
                </button>
              </section>
            </div>
          )}

          {cartOpen && (
            <div
              className="l2-backdrop"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setCartOpen(false);
              }}
            >
              <section className="l2-cart-panel">
                <div className="l2-cart-title-row">
                  <div>
                    <p className="l2-eyebrow">SHOPPING TROLLEY</p>
                    <h2>Your items</h2>
                  </div>
                  <button
                    className="l2-close"
                    onClick={() => setCartOpen(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {chosen.length === 0 ? (
                  <p>Your trolley is empty. Choose at least one item.</p>
                ) : (
                  <ul className="l2-cart-list">
                    {chosen.map((item) => (
                      <li key={item.id}>
                        <span>{item.name}</span>
                        <strong>{money(item.price)}</strong>
                        <button onClick={() => removeItem(item)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="l2-cart-totals">
                  <span>Spent <b>{money(spent)}</b></span>
                  <span>Left <b>{money(left)}</b></span>
                </div>

                <div className="l2-cart-actions">
                  <button
                    className="l2-secondary"
                    onClick={() => setCartOpen(false)}
                  >
                    Keep shopping
                  </button>
                </div>
              </section>
            </div>
          )}
        </section>
      )}

      {screen === "summary" && (
        <section className="l2-summary">
          <article className="l2-summary-card">
            <p className="l2-eyebrow">PURCHASE COMPLETE</p>
            <h2>Thoughtful shopping!</h2>

            <ul className="l2-summary-list">
              {chosen.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <b>{money(item.price)}</b>
                </li>
              ))}
            </ul>

            <div className="l2-totals">
              <span>Money spent <b>{money(spent)}</b></span>
              <span>Money saved <b>{money(left)}</b></span>
            </div>

            <p>
              You chose items within your budget. Now let's put the money left into the piggy bank.
            </p>

            <button
              className="l2-primary"
              onClick={() => setScreen("saving")}
            >
              Save the money left →
            </button>
          </article>
        </section>
      )}

      {screen === "saving" && (
        <section className="l2-saving">
          <div className="l2-saving-copy">
            <p className="l2-eyebrow">A LITTLE SAVING GOES A LONG WAY</p>
            <h2>Put your leftover money in the piggy bank.</h2>
            <p>Drag or click a coin from the purse to save it in the piggy bank.</p>
            <strong>Saved {money(saved)} of {money(left)}</strong>
          </div>

          <div className="l2-saving-stage">
            <div className="l2-purse-area">
              <img
                className="l2-purse-image"
                src={BASE + "purse.png"}
                alt="Purse with rupee coins"
              />

              <div className="l2-coins">
                {tokens
                  .filter((coin) => !savedIds.includes(coin.id))
                  .map((coin) => (
                    <button
                      key={coin.id}
                      draggable
                      className="l2-coin"
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", coin.id)
                      }
                      onClick={() => deposit(coin.id)}
                      title={"Move " + money(coin.value) + " to the piggy bank"}
                    >
                      {money(coin.value)}
                    </button>
                  ))}
              </div>

              <span className="l2-stage-label">Purse</span>
            </div>

            <div className="l2-bank-column">
              <div
                className={"l2-bank-drop" + (allSaved ? " complete" : "")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  deposit(e.dataTransfer.getData("text/plain"));
                }}
              >
                <img src={BASE + "piggy-bank.png"} alt="Pink piggy bank" />
                <span className="l2-stage-label">Piggy bank</span>
              </div>
              {!allSaved && <span className="l2-drop-hint">Drop coins here</span>}
            </div>

            <div className="l2-saving-characters">
              <img src={characterPath} alt={selectedCharacter || "Mia"} />
              <img src="/assets/milo.png" alt="Milo" />
            </div>
          </div>

          {message && (
            <div className="l2-toast" role="status">
              {message}
            </div>
          )}

          {allSaved && (
            <button
              className="l2-primary l2-finish"
              onClick={() => (onComplete ? onComplete() : onDone && onDone())}
            >
              Back to garden →
            </button>
          )}
        </section>
      )}
    </main>
  );
}