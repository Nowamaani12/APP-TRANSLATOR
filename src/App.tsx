import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { LanguageBar } from "./components/LanguageBar";
import { TranslationInput } from "./components/TranslationInput";
import { TranslationResultCard } from "./components/TranslationResultCard";
import { PhrasebookModal } from "./components/PhrasebookModal";
import { SavedModal } from "./components/SavedModal";
import { LinguisticGuideModal } from "./components/LinguisticGuideModal";
import { Language, Formality, TranslationResult, SavedTranslation, PhraseItem } from "./types";
import { AlertCircle, RotateCcw } from "lucide-react";

const STORAGE_KEY = "runyankole_translator_saved_v1";

export default function App() {
  const [sourceText, setSourceText] = useState<string>("Good morning, how did you sleep?");
  const [sourceLang, setSourceLang] = useState<Language>("en");
  const [targetLang, setTargetLang] = useState<Language>("nyn");
  const [formality, setFormality] = useState<Formality>("standard");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const [savedList, setSavedList] = useState<SavedTranslation[]>([]);
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState<boolean>(false);
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Load saved translations on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedList(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading saved translations:", e);
    }
  }, []);

  // Save to localStorage whenever savedList changes
  const updateSavedList = (newList: SavedTranslation[]) => {
    setSavedList(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error("Error writing saved translations:", e);
    }
  };

  const handleTranslate = useCallback(async (
    textToTranslate = sourceText,
    src = sourceLang,
    tgt = targetLang,
    currentFormality = formality
  ) => {
    if (!textToTranslate.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: src,
          targetLang: tgt,
          formality: currentFormality,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        let errorMsg = json.error || "Translation request failed.";
        try {
          const parsed = JSON.parse(errorMsg);
          if (parsed?.error?.message) {
            errorMsg = parsed.error.message;
          }
        } catch {
          // not json string
        }
        throw new Error(errorMsg);
      }

      setResult(json.data);
    } catch (err: any) {
      let cleanMsg = err.message || "Failed to translate. Please verify your connection.";
      if (cleanMsg.includes("{")) {
        try {
          const jsonMatch = cleanMsg.slice(cleanMsg.indexOf("{"));
          const parsed = JSON.parse(jsonMatch);
          if (parsed?.error?.message) {
            cleanMsg = parsed.error.message;
          }
        } catch {
          // ignore
        }
      }
      console.warn("Translation status:", cleanMsg);
      setError(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, formality]);

  // Initial translation on first load
  useEffect(() => {
    handleTranslate("Good morning, how did you sleep?", "en", "nyn", "standard");
  }, []);

  const handleSwapLanguages = () => {
    const nextSrc = targetLang;
    const nextTgt = sourceLang;
    setSourceLang(nextSrc);
    setTargetLang(nextTgt);

    if (result && result.translatedText) {
      const newText = result.translatedText;
      setSourceText(newText);
      handleTranslate(newText, nextSrc, nextTgt, formality);
    }
  };

  const handleSaveToggle = () => {
    if (!result) return;

    const existingIndex = savedList.findIndex(
      (item) =>
        item.sourceText.trim().toLowerCase() === sourceText.trim().toLowerCase() &&
        item.sourceLang === sourceLang &&
        item.targetLang === targetLang
    );

    if (existingIndex >= 0) {
      // Remove
      const filtered = savedList.filter((_, idx) => idx !== existingIndex);
      updateSavedList(filtered);
    } else {
      // Add
      const newItem: SavedTranslation = {
        id: `save-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sourceText: sourceText.trim(),
        sourceLang,
        targetText: result.translatedText,
        targetLang,
        phonetic: result.phonetic || "",
        timestamp: Date.now(),
        politenessNotes: result.politenessNotes,
      };
      updateSavedList([newItem, ...savedList]);
    }
  };

  const isCurrentSaved = Boolean(
    result &&
      savedList.some(
        (item) =>
          item.sourceText.trim().toLowerCase() === sourceText.trim().toLowerCase() &&
          item.sourceLang === sourceLang &&
          item.targetLang === targetLang
      )
  );

  const handleSelectSample = (sample: string) => {
    setSourceText(sample);
    handleTranslate(sample, sourceLang, targetLang, formality);
  };

  const handleSelectPhrasebookItem = (phrase: PhraseItem) => {
    // If phrase is Runyankole and source is English, swap or set English
    if (sourceLang === "en") {
      setSourceText(phrase.english);
      handleTranslate(phrase.english, "en", "nyn", formality);
    } else {
      setSourceText(phrase.runyankole);
      handleTranslate(phrase.runyankole, "nyn", "en", formality);
    }
  };

  const handleSelectSavedItem = (item: SavedTranslation) => {
    setSourceText(item.sourceText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    handleTranslate(item.sourceText, item.sourceLang, item.targetLang, formality);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col selection:bg-[#ccfbf1] selection:text-[#0f766e]">
      {/* Header */}
      <Header
        onOpenPhrasebook={() => setIsPhrasebookOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        savedCount={savedList.length}
      />

      {/* Main Translation Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Language & Formality Controls */}
        <LanguageBar
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSwapLanguages={handleSwapLanguages}
          onSelectSource={(lang) => {
            setSourceLang(lang);
            setTargetLang(lang === "en" ? "nyn" : "en");
          }}
          onSelectTarget={(lang) => {
            setTargetLang(lang);
            setSourceLang(lang === "en" ? "nyn" : "en");
          }}
          formality={formality}
          onChangeFormality={(f) => {
            setFormality(f);
            if (sourceText.trim()) {
              handleTranslate(sourceText, sourceLang, targetLang, f);
            }
          }}
        />

        {/* Translation Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Input Side */}
          <TranslationInput
            text={sourceText}
            onChangeText={setSourceText}
            onTranslate={() => handleTranslate()}
            isLoading={isLoading}
            sourceLang={sourceLang}
            onSelectSamplePhrase={handleSelectSample}
          />

          {/* Output Side */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-[#fef2f2] border border-[#fecaca] flex items-start gap-3 text-xs text-[#991b1b]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
                <div className="flex-1">
                  <span className="font-bold block">Translation Service Note:</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => handleTranslate()}
                  className="p-1 text-[#991b1b] hover:bg-[#fee2e2] rounded transition-colors"
                  title="Retry"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <TranslationResultCard
              result={result}
              targetLang={targetLang}
              onSave={handleSaveToggle}
              isSaved={isCurrentSaved}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Informative Banner about Ankole Culture & Runyankole */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-[#e2e0d8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-2">
              <span>About Runyankole (Orunyankore)</span>
              <span className="text-xs font-normal text-[#0f766e] bg-[#f0fdfa] px-2 py-0.5 rounded border border-[#ccfbf1]">
                Bantu Family (Zone J10)
              </span>
            </h3>
            <p className="text-xs text-[#64748b] max-w-3xl leading-relaxed">
              Runyankole is spoken by over 3 million Banyankole in Southwestern Uganda (districts including Mbarara, Bushenyi, Ntungamo, Isingiro, Kiruhura, and Rubirizi). It shares high mutual intelligibility with Rukiga, Runyoro, and Rutooro within the Runyakitara cluster.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-[#0f766e] hover:bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl transition-colors"
            >
              Explore Grammar Guide
            </button>
            <button
              onClick={() => setIsPhrasebookOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl shadow-xs transition-colors"
            >
              Open Phrasebook
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PhrasebookModal
        isOpen={isPhrasebookOpen}
        onClose={() => setIsPhrasebookOpen(false)}
        onSelectPhrase={handleSelectPhrasebookItem}
      />

      <SavedModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedList={savedList}
        onDelete={(id) => updateSavedList(savedList.filter((item) => item.id !== id))}
        onClearAll={() => updateSavedList([])}
        onSelect={handleSelectSavedItem}
      />

      <LinguisticGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
