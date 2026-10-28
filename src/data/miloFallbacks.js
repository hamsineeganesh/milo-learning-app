
export const MILO_FALLBACKS = {
  shopping: [
    "Woof! Look at your coins—saving even ₹10 or ₹20 gives our piggy bank a happy snack! 🛒✨",
    "Smart thinking! Check the prices to make sure you have coins left for saving! 🐶🪙",
    "You are doing great! Let's choose our favorites and keep some coins safe! 🐾💛",
  ],
  character: {
    Chutki: "Woof! Chutki loves nature! Let's go plant seeds and smell flowers together! 🌸🐾",
    Mia: "Woof! Mia has the kindest heart! Let's have a cozy, sunny adventure! 💗🐶",
    Levi: "Woof woof! Levi is so fast and cheerful! Let's run down the garden trail! 🌞🐾",
    Ash: "Woof! Ash is super clever! We will solve all the garden puzzles together! ⭐🐶",
  },
  quest: [
    "Seeds love warm sunshine, fresh soil, and gentle water drops! 🌱✨",
    "Take your time, friend! Watching things grow is the best part! 🌸🐾",
  ],
  saving: [
    "Hooray! Every coin saved in your piggy bank helps big dreams grow! 🐷💰✨",
    "Woof! You are a super saver! Grandpa and I are so proud of you! 🐾🎉",
  ],
};

export function getRandomFallback(category, key = null) {
  if (key && MILO_FALLBACKS[category]?.[key]) {
    return MILO_FALLBACKS[category][key];
  }
  const list = MILO_FALLBACKS[category] || MILO_FALLBACKS.shopping;
  return list[Math.floor(Math.random() * list.length)];
}