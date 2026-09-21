import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "runyankole-translator" });
});

// Comprehensive local fallback dictionary for common greetings, phrases, and vocabulary
const LOCAL_DICTIONARY = [
  {
    en: "good morning, how did you sleep?",
    nyn: "Oraire ota?",
    phonetic: "oh-RAI-reh OH-tah",
    ipa: "o.ɾaí.ɾe o.tá",
    literal: "How have you spent the night?",
    notes: "Singular informal greeting used in the morning until midday. For elders, parents, or a group, always say 'Muraire muta?'. Response: 'Ndaire gye' (I slept well).",
    cultural: "In Ankole culture, mornings begin with inquiring after the night's peace and health of the household and cattle.",
    breakdown: [
      { word: "O-", partOfSpeech: "Subject Prefix", meaning: "You (2nd person singular)", morphology: "o-" },
      { word: "-raire", partOfSpeech: "Verb stem", meaning: "have spent the night / slept", morphology: "-raara (sleep)" },
      { word: "ota?", partOfSpeech: "Interrogative", meaning: "how? / in what manner?", morphology: "ota" }
    ],
    alternatives: [
      { text: "Muraire muta?", context: "Respectful form for elders, leaders, or a group" },
      { text: "Oraire gye?", context: "Informal variation: 'Did you sleep well?'" }
    ]
  },
  {
    en: "good morning",
    nyn: "Oraire ota?",
    phonetic: "oh-RAI-reh OH-tah",
    ipa: "o.ɾaí.ɾe o.tá",
    literal: "How have you spent the night?",
    notes: "Singular morning greeting. For elders or groups use 'Muraire muta?'. Response: 'Ndaire gye'.",
    cultural: "Morning greetings are an essential courtesy throughout Western Uganda.",
    breakdown: [
      { word: "Oraire", partOfSpeech: "Verb", meaning: "You have spent the night" },
      { word: "ota?", partOfSpeech: "Adverb", meaning: "how?" }
    ],
    alternatives: [
      { text: "Muraire muta?", context: "Plural / Respectful to elders" }
    ]
  },
  {
    en: "how are you?",
    nyn: "Agandi?",
    phonetic: "ah-GAHN-dee",
    ipa: "a.ɡáː.ⁿdi",
    literal: "What is the news?",
    notes: "Universal informal greeting across Ankole. Reply: 'Ni marungi' (It is fine/good).",
    cultural: "Used casually among peers, neighbors, and friends at any hour.",
    breakdown: [
      { word: "Agandi?", partOfSpeech: "Interrogative Greeting", meaning: "How are you? / What news?" }
    ],
    alternatives: [
      { text: "Oraire ota?", context: "Morning greeting" },
      { text: "Osiibire ota?", context: "Afternoon greeting" }
    ]
  },
  {
    en: "good afternoon",
    nyn: "Osiibire ota?",
    phonetic: "oh-SEE-bee-reh OH-tah",
    ipa: "o.siː.bí.ɾe o.tá",
    literal: "How have you spent the day?",
    notes: "Used from noon onwards. For elders, use 'Musiibire muta?'. Reply: 'Nsiibire gye'.",
    cultural: "Afternoon inquiry after the day's tasks, farming, or herd grazing.",
    breakdown: [
      { word: "O-", partOfSpeech: "Subject Prefix", meaning: "You" },
      { word: "-siibire", partOfSpeech: "Verb stem", meaning: "have spent the day", morphology: "-siiba (spend day)" },
      { word: "ota?", partOfSpeech: "Interrogative", meaning: "how?" }
    ],
    alternatives: [
      { text: "Musiibire muta?", context: "Plural / Honorific form for elders" }
    ]
  },
  {
    en: "thank you very much",
    nyn: "Webale munonga",
    phonetic: "weh-BAH-leh moo-NOHN-gah",
    ipa: "we.baː.le mu.nóː.ŋga",
    literal: "You have done well exceedingly",
    notes: "Respectful / plural version: 'Mwebale munonga'.",
    cultural: "Gratitude is deeply valued in the Banyankole tradition of reciprocity and neighborliness.",
    breakdown: [
      { word: "Webale", partOfSpeech: "Expression", meaning: "Thank you" },
      { word: "munonga", partOfSpeech: "Adverb", meaning: "very much / greatly" }
    ],
    alternatives: [
      { text: "Mwebale munonga", context: "To elders or multiple people" }
    ]
  },
  {
    en: "thank you",
    nyn: "Webale",
    phonetic: "weh-BAH-leh",
    ipa: "we.baː.le",
    literal: "You have done well",
    notes: "Singular address. For plural or elders, use 'Mwebale'.",
    cultural: "Standard polite acknowledgment.",
    breakdown: [
      { word: "Webale", partOfSpeech: "Interjection", meaning: "Thank you" }
    ],
    alternatives: [
      { text: "Mwebale", context: "Plural or respectful address" }
    ]
  },
  {
    en: "i love you",
    nyn: "Ninkukunda",
    phonetic: "neen-koo-KOON-dah",
    ipa: "niːŋ.ku.kúː.ⁿda",
    literal: "I am loving you",
    notes: "Agglutinative verb: Ni- (continuous) + -n- (I) + -ku- (you) + -kunda (love). Plural/respectful: 'Nimbakunda'.",
    cultural: "Warmly expressed to family, spouse, and loved ones.",
    breakdown: [
      { word: "Ni-", partOfSpeech: "Tense Prefix", meaning: "Continuous present marker" },
      { word: "-n-", partOfSpeech: "Subject Prefix", meaning: "I (1st person singular)" },
      { word: "-ku-", partOfSpeech: "Object Infix", meaning: "you (2nd person singular)" },
      { word: "-kunda", partOfSpeech: "Verb stem", meaning: "love / like" }
    ],
    alternatives: [
      { text: "Ninkukunda munonga", context: "I love you very much" },
      { text: "Nimbakunda", context: "I love you all (plural/respectful)" }
    ]
  },
  {
    en: "welcome",
    nyn: "Tukwakiire",
    phonetic: "too-kwah-KEE-reh",
    ipa: "tu.kwaː.kíː.ɾe",
    literal: "We have received you",
    notes: "Said when welcoming visitors into a home. Response: 'Mwebale'.",
    cultural: "Hospitality (*obugyenyi*) is sacred in Ankole; visitors are typically offered fresh milk or tea.",
    breakdown: [
      { word: "Tu-", partOfSpeech: "Subject Prefix", meaning: "We" },
      { word: "-ku-", partOfSpeech: "Object Infix", meaning: "you" },
      { word: "-akiire", partOfSpeech: "Verb stem", meaning: "have received / welcomed", morphology: "-akira" }
    ],
    alternatives: [
      { text: "Twakwakiira", context: "We welcome you (alternative form)" }
    ]
  },
  {
    en: "yes",
    nyn: "Eego",
    phonetic: "EH-goh",
    ipa: "eː.ɡo",
    literal: "Yes",
    notes: "Common affirmative response.",
    cultural: "Spoken clearly, often with a polite slight nod.",
    breakdown: [{ word: "Eego", partOfSpeech: "Affirmative", meaning: "Yes" }],
    alternatives: []
  },
  {
    en: "no",
    nyn: "Ngaaha",
    phonetic: "NGAH-hah",
    ipa: "ŋaː.ha",
    literal: "No",
    notes: "Polite refusal.",
    cultural: "Often softened with 'Mbwenu' or explanation to maintain warmth.",
    breakdown: [{ word: "Ngaaha", partOfSpeech: "Negative", meaning: "No" }],
    alternatives: []
  },
  {
    en: "please",
    nyn: "Ninkushaba",
    phonetic: "neen-koo-SHAH-bah",
    ipa: "niːŋ.ku.ʃá.ba",
    literal: "I am begging / requesting you",
    notes: "Respectful request form.",
    cultural: "Polite discourse is paramount when making requests.",
    breakdown: [
      { word: "Ni-n-ku-shaba", partOfSpeech: "Verb", meaning: "I request you", morphology: "Ni- + -n- + -ku- + -shaba" }
    ],
    alternatives: []
  }
];

function findDictionaryMatch(query: string, isEngToNyn: boolean) {
  const clean = query.trim().toLowerCase().replace(/[.,!?;:]/g, "");
  return LOCAL_DICTIONARY.find((item) => {
    const candidate = isEngToNyn ? item.en.toLowerCase().replace(/[.,!?;:]/g, "") : item.nyn.toLowerCase().replace(/[.,!?;:]/g, "");
    return candidate === clean;
  });
}

function extractErrorMessage(err: any): string {
  if (!err) return "Service temporarily unavailable. Please try again.";
  const raw = err.message || String(err);
  try {
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      const parsed = JSON.parse(raw.slice(jsonStart));
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch {
    // fallback
  }
  return raw;
}

// Translation Endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang = "en", targetLang = "nyn", formality = "standard" } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required for translation." });
    }

    const ai = getGeminiClient();

    const isEngToNyn = sourceLang === "en" && targetLang === "nyn";
    const sourceName = isEngToNyn ? "English" : "Runyankole (Runyankore/Nkore)";
    const targetName = isEngToNyn ? "Runyankole (Runyankore/Nkore)" : "English";

    const systemInstruction = `You are a master linguist and native speaker expert in Runyankole (also known as Runyankore, Olunyankole), a major Bantu language spoken in southwestern Uganda (Ankole region: Mbarara, Bushenyi, Ntungamo, Isingiro, Kiruhura, Rukungiri, Sheema, etc.).
Your job is to provide exceptionally accurate, culturally nuanced, and grammatically precise translations between ${sourceName} and ${targetName}.

Key Linguistic & Cultural Rules for Runyankole:
1. Adhere to authentic Runyankole-Rukiga orthography and noun class agreements (prefixes: omu-/aba-, eki-/ebi-, omu-/emi-, eri-/ama-, etc.).
2. Runyankole is an agglutinative Bantu language where prefixes denote subject, tense, aspect, and object markers (e.g., "Ni-n-ku-kunda" = I-love-you).
3. Distinguish singular vs plural/respectful address:
   - Greetings: "Oraire ota?" (singular / informal) vs "Muraire muta?" (plural / respectful to elders/group).
   - "Osiibire ota?" (afternoon singular) vs "Musiibire muta?" (afternoon plural/honorific).
   - "Webale" (thank you singular) vs "Mwebale" (thank you plural/respectful).
4. Provide phonetic pronunciation guide with stressed syllables capitalized (e.g. "Oh-RAI-reh OH-tah").
5. Break down the key words with their grammatical parts of speech, noun class or verbal prefixes where applicable.
6. Share brief cultural context or etiquette when relevant (e.g., greetings depend on time of day, hospitality traditions, respectful demeanor to elders).
7. If the input has multiple interpretations, offer natural alternative phrases.`;

    const prompt = `Translate the following text from ${sourceName} to ${targetName}.
Formality/Tone requested: ${formality}.
Input text: "${text.trim()}"

Provide the output strictly complying with the specified JSON schema.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        translatedText: {
          type: Type.STRING,
          description: "The primary high-accuracy translation into the target language.",
        },
        phonetic: {
          type: Type.STRING,
          description: "Phonetic pronunciation guide formatted with hyphenated syllables and uppercase stress (e.g. Oh-RY-reh OH-tah).",
        },
        ipa: {
          type: Type.STRING,
          description: "IPA phonetic transcription.",
        },
        literalMeaning: {
          type: Type.STRING,
          description: "Literal or morpheme-by-morpheme translation if different from colloquial meaning.",
        },
        grammaticalBreakdown: {
          type: Type.ARRAY,
          description: "Breakdown of individual words or morphemes.",
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "Word or stem in the translated or source text." },
              partOfSpeech: { type: Type.STRING, description: "Part of speech (e.g., Noun (Class 1/2), Subject Prefix, Verb stem, Adjective, Greeting)." },
              meaning: { type: Type.STRING, description: "Direct meaning or grammatical function." },
              morphology: { type: Type.STRING, description: "Morphological breakdown if applicable (e.g., omu- [prefix] + ntu [person])." },
            },
            required: ["word", "partOfSpeech", "meaning"],
          },
        },
        politenessNotes: {
          type: Type.STRING,
          description: "Notes regarding respect, singular vs plural address, or honorifics.",
        },
        culturalContext: {
          type: Type.STRING,
          description: "Cultural insight, traditional Ankole etiquette, or context in Western Uganda.",
        },
        alternativeTranslations: {
          type: Type.ARRAY,
          description: "Alternative ways to express the same thought in different tones or contexts.",
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              context: { type: Type.STRING, description: "When to use this alternative (e.g., casual with friends, formal with elders, written)." },
            },
            required: ["text", "context"],
          },
        },
        exampleSentences: {
          type: Type.ARRAY,
          description: "1-2 practical real-world usage examples featuring this phrase.",
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              translation: { type: Type.STRING },
            },
            required: ["original", "translation"],
          },
        },
      },
      required: ["translatedText", "phonetic"],
    };

    // Primary: gemini-3.6-flash (verified active, zero latency spike)
    // Fallbacks: gemini-3.1-flash-lite, gemini-flash-latest, gemini-3.8-flash
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-3.8-flash"
    ];

    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} unavailable: ${extractErrorMessage(err)}. Trying fallback...`);
      }
    }

    if (!response || !response.text) {
      // Check local dictionary fallback
      const match = findDictionaryMatch(text, isEngToNyn);
      if (match) {
        return res.json({
          success: true,
          data: {
            translatedText: isEngToNyn ? match.nyn : match.en,
            phonetic: match.phonetic,
            ipa: match.ipa,
            literalMeaning: match.literal,
            politenessNotes: match.notes,
            culturalContext: match.cultural,
            grammaticalBreakdown: match.breakdown,
            alternativeTranslations: match.alternatives || [],
            exampleSentences: [],
          },
        });
      }

      const cleanError = extractErrorMessage(lastError);
      return res.status(503).json({
        success: false,
        error: cleanError.includes("high demand")
          ? "The AI translation model is temporarily experiencing high traffic. Please tap retry in a moment."
          : cleanError,
      });
    }

    const outputText = response.text?.trim();
    if (!outputText) {
      throw new Error("No response returned from translation model.");
    }

    const result = JSON.parse(outputText);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return res.status(500).json({
      success: false,
      error: extractErrorMessage(error),
    });
  }
});

// Text-To-Speech Pronunciation Endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGeminiClient();

    // Use Gemini 3.1 Flash TTS
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [
        {
          parts: [
            {
              text: `Pronounce this Runyankole / African text clearly and naturally with proper African phonetic articulation: "${text}"`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName as "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr",
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "TTS audio generation returned no data." });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: "audio/pcm;rate=24000",
    });
  } catch (err: any) {
    console.warn("TTS generation fallback to browser speech:", err?.message || err);
    return res.json({
      success: false,
      fallbackToBrowser: true,
      error: "Using device speech synthesis fallback.",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Runyankole Translator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
