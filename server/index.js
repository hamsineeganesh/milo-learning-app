import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "32kb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const SYSTEM_INSTRUCTION = `
You are Milo, an encouraging, friendly puppy companion in "MILO", a learning game for children aged 5-9.
Rules:
1. Keep replies cheerful, warm, and 1 to 2 short sentences (maximum 25 words).
2. Use simple, gentle words suitable for young kids and include 1 emoji.
3. Be encouraging—never use negative words like "wrong" or "failed".
4. Do not ask for or repeat personal information.
5. Focus on the learning goal: healthy choices, garden growing, spending within the ₹100 budget, and saving coins.
`;

async function askMilo(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing API key");
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    contents: SYSTEM_INSTRUCTION + "\n\nTask:\n" + prompt,
  });

  return response.text ? response.text.trim() : null;
}

/* Structured response format for the Parent Guide */
const parentGuideSchema = {
  type: "object",
  properties: {
    perspective: { type: "string" },
    strategies: { type: "array", items: { type: "string" } },
    activitySteps: { type: "array", items: { type: "string" } },
    phrases: { type: "array", items: { type: "string" } },
    adaptations: { type: "array", items: { type: "string" } },
    breakSigns: { type: "array", items: { type: "string" } },
    reflectionQuestion: { type: "string" },
  },
  required: [
    "perspective",
    "strategies",
    "activitySteps",
    "phrases",
    "adaptations",
    "breakSigns",
    "reflectionQuestion",
  ],
  additionalProperties: false,
};

function makeParentGuidePrompt(details, history) {
  const recentConversation = history
    .slice(-6)
    .map((turn) => {
      const priorQuestion =
        typeof turn.question === "string"
          ? turn.question.slice(0, 1000)
          : "";

      const priorAnswer =
        turn.answer && typeof turn.answer === "object"
          ? JSON.stringify(turn.answer).slice(0, 2500)
          : "";

      return (
        "Caregiver asked: " +
        priorQuestion +
        "\nMILO answered: " +
        priorAnswer
      );
    })
    .join("\n\n");

  return [
    "You are MILO, a warm, practical educational guide for caregivers.",
    "Write a detailed, useful response tailored to the caregiver's question and optional preferences.",
    "Treat each child as an individual. Offer options; do not assume all neurodivergent children learn alike.",
    "Do not diagnose, infer a condition, assign a developmental age, or guarantee an outcome.",
    "Do not recommend changing prescribed treatment or replacing professional care.",
    "Do not ask for or repeat a child's name, identifying details, or sensitive information.",
    "Return one JSON object following the provided schema. Fill every field.",
    "perspective: 2 to 4 caring sentences about how this situation might feel from the child's perspective. Use possibility language, not assumptions.",
    "strategies: exactly 3 practical strategies. Make each a specific mini-paragraph and include an example.",
    "activitySteps: 5 to 7 ordered steps, each in its own array entry. Include materials, an easy beginning, a choice for the child, and a calm ending.",
    "phrases: 3 to 5 short, gentle phrases the caregiver can say.",
    "adaptations: 3 to 5 concrete ways to make the activity easier, shorter, quieter, or more engaging.",
    "breakSigns: 3 to 5 possible cues that a child may want a break. Explain that cues vary and do not prove a diagnosis.",
    "reflectionQuestion: one short, open-ended question for the caregiver to consider afterward.",
    "Use warm, plain language and avoid repeating the same advice.",
    "",
    "Caregiver question: " + details.question,
    "Optional learning goal: " + (details.learningGoal || "not provided"),
    "Child interests voluntarily shared: " + (details.interests || "not provided"),
    "Preferred activity style: " + (details.activityType || "not provided"),
    "",
    "Recent conversation, to answer a follow-up consistently:",
    recentConversation || "This is the first question in this conversation.",
  ].join("\n");
}

async function generateParentGuide(prompt, model) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      maxOutputTokens: 4000,
      responseMimeType: "application/json",
      responseJsonSchema: parentGuideSchema,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty Parent Guide response");
  }

  return JSON.parse(response.text);
}

async function askParentGuide(details, history) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing API key");
  }

  const prompt = makeParentGuidePrompt(details, history);
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    return await generateParentGuide(prompt, primaryModel);
  } catch (error) {
    const errorText = String(error?.message || error);

    if (!errorText.includes("503") && !errorText.includes("UNAVAILABLE")) {
      throw error;
    }

    console.warn("Gemini is busy; trying Gemini 3.6 Flash.");
    return generateParentGuide(prompt, "gemini-3.6-flash");
  }
}

/* Level 2 Shopping Hint */
app.post("/api/milo/shopping-hint", async (req, res) => {
  try {
    const {
      remainingBudget = 100,
      selectedItems = [],
      supportMode = "standard",
    } = req.body;

    const itemsText = selectedItems.length
      ? selectedItems
          .map((item) => item.name + " (₹" + item.price + ")")
          .join(", ")
      : "cart is empty";

    const prompt =
      "Give a shopping hint. Budget: ₹100. Money left: ₹" +
      remainingBudget +
      ". Items chosen: " +
      itemsText +
      ". Mode: " +
      supportMode +
      ". Remind the child to save some coins for the piggy bank.";

    const message = await askMilo(prompt);
    return res.json({ message });
  } catch (error) {
    console.error("Shopping hint failed:", error.message);
    return res.json({ fallback: true });
  }
});

/* Character Selection Cheer */
app.post("/api/milo/character-cheer", async (req, res) => {
  try {
    const characterName =
      typeof req.body.characterName === "string"
        ? req.body.characterName.slice(0, 40)
        : "Mia";

    const message = await askMilo(
      "The child picked " +
        characterName +
        " as their adventure friend. Welcome them with puppy excitement!"
    );

    return res.json({ message });
  } catch (error) {
    console.error("Character cheer failed:", error.message);
    return res.json({ fallback: true });
  }
});

/* Quest 1 Story Clue */
app.post("/api/milo/quest-hint", async (req, res) => {
  try {
    const chapterTitle =
      typeof req.body.chapterTitle === "string"
        ? req.body.chapterTitle.slice(0, 100)
        : "";

    const question =
      typeof req.body.question === "string"
        ? req.body.question.slice(0, 500)
        : "";

    const message = await askMilo(
      'In Quest 1: The Little Seed (Chapter: "' +
        chapterTitle +
        '"), the question asks: "' +
        question +
        '". Give a gentle, playful clue!'
    );

    return res.json({ message });
  } catch (error) {
    console.error("Quest hint failed:", error.message);
    return res.json({ fallback: true });
  }
});

/* Piggy Bank Savings Praise */
app.post("/api/milo/saving-praise", async (req, res) => {
  try {
    const savedAmount = Number(req.body.savedAmount) || 0;

    const message = await askMilo(
      "The child finished shopping and saved ₹" +
        savedAmount +
        " into their piggy bank. Cheer for their saving choice!"
    );

    return res.json({ message });
  } catch (error) {
    console.error("Saving praise failed:", error.message);
    return res.json({ fallback: true });
  }
});

/* Parent Guide request limit: 5 requests per minute per client */
const parentGuideRequests = new Map();

app.post("/api/milo/parent-guide", async (req, res) => {
  const now = Date.now();
  const clientId = req.ip || req.socket.remoteAddress || "local";

  const recentRequests = (parentGuideRequests.get(clientId) || []).filter(
    (time) => now - time < 60_000
  );

  if (recentRequests.length >= 5) {
    return res.status(429).json({
      error: "Please wait a moment before asking MILO again.",
    });
  }

  const body = req.body || {};
  const clean = (value, limit) =>
    typeof value === "string" ? value.trim().slice(0, limit) : "";

  const details = {
    question: clean(body.question || body.concern, 1000),
    learningGoal: clean(body.learningGoal, 100),
    interests: clean(body.interests, 120),
    activityType: clean(body.activityType, 100),
  };

  if (!details.question) {
    return res.status(400).json({
      error: "Please describe what you would like help with.",
    });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  recentRequests.push(now);
  parentGuideRequests.set(clientId, recentRequests);

  try {
    const sections = await askParentGuide(details, history);

    const requiredSections = [
      "perspective",
      "strategies",
      "activitySteps",
      "phrases",
      "adaptations",
      "breakSigns",
      "reflectionQuestion",
    ];

    if (!requiredSections.every((key) => sections[key])) {
      throw new Error("Gemini returned an incomplete Parent Guide response");
    }

    return res.json({ sections });
  } catch (error) {
    console.error("Parent Guide request failed:", error.message);
    return res.status(502).json({
      error: "MILO couldn’t get a complete Gemini response just now. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log("🐾 Milo AI Server running on http://localhost:" + PORT);
});