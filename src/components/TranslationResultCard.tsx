import React, { useState } from "react";
import {
  Volume2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Info,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  Loader2,
} from "lucide-react";
import { TranslationResult, Language } from "../types";
import { playPcmFromBase64, playBrowserSpeech, stopCurrentAudio } from "../utils/audio";

interface TranslationResultCardProps {
  result: TranslationResult | null;
  targetLang: Language;
  onSave: () => void;
  isSaved: boolean;
  isLoading: boolean;
}

export const TranslationResultCard: React.FC<TranslationResultCardProps> = ({
  result,
  targetLang,
  onSave,
  isSaved,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#e2e0d8] shadow-xs flex flex-col items-center justify-center min-h-[260px] text-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#ccfbf1] flex items-center justify-center text-[#0f766e] animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1e293b]">
            Consulting Runyankole Linguistic Engine
          </h3>
          <p className="text-xs text-[#64748b] max-w-sm mt-1">
            Analyzing Bantu noun class agreements, tense prefixes, and authentic Ankole cultural context...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white/60 rounded-2xl p-8 border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center min-h-[220px] text-center">
        <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#64748b] mb-3">
          <BookOpen className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-[#475569]">
          No translation yet
        </h4>
        <p className="text-xs text-[#94a3b8] max-w-xs mt-1">
          Type text or pick a common phrase above to view accurate Runyankole translation, phonetics, and grammar.
        </p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePlayAudio = async () => {
    if (isPlayingAudio) {
      stopCurrentAudio();
      setIsPlayingAudio(false);
      return;
    }

    setAudioLoading(true);
    try {
      // Call server TTS endpoint
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: result.translatedText,
          voiceName: "Kore",
        }),
      });

      const data = await res.json();
      setAudioLoading(false);

      if (data.success && data.audioBase64) {
        setIsPlayingAudio(true);
        await playPcmFromBase64(data.audioBase64, 24000, () => {
          setIsPlayingAudio(false);
        });
      } else {
        // Fallback to browser Web Speech API
        setIsPlayingAudio(true);
        playBrowserSpeech(result.translatedText, targetLang, () => {
          setIsPlayingAudio(false);
        });
      }
    } catch {
      setAudioLoading(false);
      setIsPlayingAudio(true);
      playBrowserSpeech(result.translatedText, targetLang, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const isTargetRunyankole = targetLang === "nyn";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e0d8] shadow-xs space-y-5 transition-all">
      {/* Target Language Header & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0f766e] bg-[#f0fdfa] px-2 py-0.5 rounded border border-[#ccfbf1]">
            {isTargetRunyankole ? "Runyankole (Nkore)" : "English"}
          </span>
          {result.ipa && (
            <span className="text-xs font-mono text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
              /{result.ipa}/
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Pronunciation Button */}
          <button
            id="play-audio-btn"
            onClick={handlePlayAudio}
            disabled={audioLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isPlayingAudio
                ? "bg-[#0f766e] text-white animate-pulse"
                : "bg-[#f0fdfa] text-[#0f766e] hover:bg-[#ccfbf1] border border-[#99f6e4]"
            }`}
            title="Listen to pronunciation"
          >
            {audioLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{isPlayingAudio ? "Playing..." : "Pronounce"}</span>
          </button>

          {/* Copy Button */}
          <button
            id="copy-translation-btn"
            onClick={handleCopy}
            className="p-1.5 text-[#64748b] hover:text-[#0f766e] hover:bg-[#f1f5f9] rounded-lg transition-colors"
            title={copied ? "Copied!" : "Copy translation"}
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#16a34a]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Save / Bookmark Button */}
          <button
            id="save-translation-btn"
            onClick={onSave}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved
                ? "text-[#d97706] bg-[#fef3c7]"
                : "text-[#64748b] hover:text-[#d97706] hover:bg-[#fef3c7]/50"
            }`}
            title={isSaved ? "Saved to your list" : "Save this translation"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Translated Text & Phonetics */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight leading-snug break-words">
          {result.translatedText}
        </h2>

        {/* Phonetic Pronunciation Guide */}
        {result.phonetic && (
          <div className="flex items-center gap-2 text-sm text-[#0f766e] font-medium bg-[#f0fdfa] px-3 py-1.5 rounded-lg border border-[#ccfbf1] inline-flex">
            <span className="text-[11px] uppercase tracking-wider text-[#0d9488] font-semibold">
              Say it:
            </span>
            <span className="font-mono tracking-wide">{result.phonetic}</span>
          </div>
        )}

        {/* Literal Meaning if applicable */}
        {result.literalMeaning && (
          <p className="text-xs text-[#64748b] italic">
            Literal meaning: &ldquo;{result.literalMeaning}&rdquo;
          </p>
        )}
      </div>

      {/* Politeness / Etiquette Callout */}
      {result.politenessNotes && (
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
          <div className="text-xs text-[#92400e]">
            <span className="font-semibold block">Social Etiquette & Register:</span>
            <span>{result.politenessNotes}</span>
          </div>
        </div>
      )}

      {/* Cultural Context Insight */}
      {result.culturalContext && (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#334155]">
            <Sparkles className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Ankole Cultural Context</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            {result.culturalContext}
          </p>
        </div>
      )}

      {/* Grammatical & Morphological Breakdown Accordion */}
      {result.grammaticalBreakdown && result.grammaticalBreakdown.length > 0 && (
        <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full px-3.5 py-2.5 bg-[#f8fafc] hover:bg-[#f1f5f9] flex items-center justify-between text-xs font-semibold text-[#334155] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0f766e]" />
              <span>Word Breakdown & Bantu Morphology ({result.grammaticalBreakdown.length} components)</span>
            </div>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-[#64748b]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#64748b]" />
            )}
          </button>

          {showBreakdown && (
            <div className="p-3 bg-white divide-y divide-[#f1f5f9]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {result.grammaticalBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0f172a]">
                        {item.word}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#64748b] border border-[#cbd5e1]">
                        {item.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155]">{item.meaning}</p>
                    {item.morphology && (
                      <p className="text-[11px] font-mono text-[#0f766e]">
                        {item.morphology}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alternative Phrasing */}
      {result.alternativeTranslations && result.alternativeTranslations.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-[#64748b]">
            Alternative Ways to Say This:
          </span>
          <div className="flex flex-wrap gap-2">
            {result.alternativeTranslations.map((alt, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#334155]"
              >
                <span className="font-medium text-[#0f172a]">{alt.text}</span>
                <span className="text-[#64748b] ml-1.5 text-[11px]">
                  ({alt.context})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical Example Sentences */}
      {result.exampleSentences && result.exampleSentences.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Usage in Context:</span>
          </div>
          <div className="space-y-2">
            {result.exampleSentences.map((example, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#edebe4] text-xs space-y-0.5"
              >
                <p className="font-medium text-[#1e293b]">{example.original}</p>
                <p className="text-[#0f766e]">{example.translation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
