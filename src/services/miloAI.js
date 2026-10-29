
import { getRandomFallback } from "../data/miloFallbacks";

const SERVER_URL =
  import.meta.env.VITE_MILO_API_URL || "http://localhost:5000/api/milo";

async function postWithFallback(endpoint, body, fallbackCategory, fallbackKey = null) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${SERVER_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    if (data.fallback || !data.message) {
      return getRandomFallback(fallbackCategory, fallbackKey);
    }
    return data.message;
  } catch {
    return getRandomFallback(fallbackCategory, fallbackKey);
  }
}

export const miloService = {
  getShoppingHint: (remainingBudget, selectedItems, supportMode) =>
    postWithFallback("shopping-hint", { remainingBudget, selectedItems, supportMode }, "shopping"),

  getCharacterCheer: (characterName) =>
    postWithFallback("character-cheer", { characterName }, "character", characterName),

  getQuestHint: (chapterTitle, question) =>
    postWithFallback("quest-hint", { chapterTitle, question }, "quest"),

  getSavingPraise: (savedAmount) =>
    postWithFallback("saving-praise", { savedAmount }, "saving"),
    getParentGuide: async (details) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${SERVER_URL}/parent-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "MILO could not respond.");
      }

      if (!data.message) {
        throw new Error("MILO returned an empty response.");
      }

      return data.message;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("MILO took too long to respond.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  },
};