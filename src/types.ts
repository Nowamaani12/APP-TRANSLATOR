export type Language = "en" | "nyn";

export type Formality = "standard" | "respectful" | "casual";

export interface GrammaticalBreakdown {
  word: string;
  partOfSpeech: string;
  meaning: string;
  morphology?: string;
}

export interface AlternativeTranslation {
  text: string;
  context: string;
}

export interface ExampleSentence {
  original: string;
  translation: string;
}

export interface TranslationResult {
  translatedText: string;
  phonetic: string;
  ipa?: string;
  literalMeaning?: string;
  grammaticalBreakdown?: GrammaticalBreakdown[];
  politenessNotes?: string;
  culturalContext?: string;
  alternativeTranslations?: AlternativeTranslation[];
  exampleSentences?: ExampleSentence[];
}

export interface SavedTranslation {
  id: string;
  sourceText: string;
  sourceLang: Language;
  targetText: string;
  targetLang: Language;
  phonetic: string;
  timestamp: number;
  politenessNotes?: string;
}

export interface PhraseItem {
  id: string;
  english: string;
  runyankole: string;
  phonetic: string;
  category: "Greetings" | "Daily Life" | "Travel & Directions" | "Market & Numbers" | "Food & Culture" | "Emergency & Health";
  context?: string;
  literal?: string;
}
