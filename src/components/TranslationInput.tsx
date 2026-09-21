import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, X, Clipboard, ArrowRight, Loader2, Volume2 } from "lucide-react";
import { Language } from "../types";
import { playBrowserSpeech } from "../utils/audio";

interface TranslationInputProps {
  text: string;
  onChangeText: (val: string) => void;
  onTranslate: () => void;
  isLoading: boolean;
  sourceLang: Language;
  onSelectSamplePhrase: (phrase: string) => void;
}

const ENGLISH_SAMPLES = [
  "Good morning, how did you sleep?",
  "Thank you very much my friend",
  "How much does this cost?",
  "Where can I find food and water?",
  "Welcome to our home",
  "Have a safe journey",
];

const RUNYANKOLE_SAMPLES = [
  "Oraire ota?",
  "Agandi munywani wangye?",
  "Eki n'esente zingahi?",
  "Webale munonga",
  "Tukwakiire gye omu ka",
  "Ninkukunda munonga",
];

export const TranslationInput: React.FC<TranslationInputProps> = ({
  text,
  onChangeText,
  onTranslate,
  isLoading,
  sourceLang,
  onSelectSamplePhrase,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = sourceLang === "en" ? "en-US" : "sw-TZ"; // closest locale

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChangeText(text ? `${text} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sourceLang, text, onChangeText]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(text ? `${text} ${clipText}` : clipText);
      }
    } catch {
      // Clipboard permissions denied or unavailable
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onTranslate();
    }
  };

  const sampleList = sourceLang === "en" ? ENGLISH_SAMPLES : RUNYANKOLE_SAMPLES;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2e0d8] shadow-xs flex flex-col justify-between focus-within:ring-2 focus-within:ring-[#0f766e]/20 focus-within:border-[#0f766e] transition-all">
      {/* Top Input Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
        <span className="text-xs font-semibold text-[#475569]">
          {sourceLang === "en" ? "English Input" : "Eby'Orunyankole (Runyankore)"}
        </span>
        <div className="flex items-center gap-1">
          {text.trim() && (
            <button
              onClick={() => playBrowserSpeech(text, sourceLang)}
              className="p-1.5 text-[#64748b] hover:text-[#0f766e] hover:bg-[#f1f5f9] rounded-lg transition-colors"
              title="Listen to input text"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}

          {text && (
            <button
              onClick={() => onChangeText("")}
              className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#fee2e2]/40 rounded-lg transition-colors"
              title="Clear text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handlePaste}
            className="p-1.5 text-[#64748b] hover:text-[#0f766e] hover:bg-[#f1f5f9] rounded-lg transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
          </button>

          {speechSupported && (
            <button
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition-all ${
                isListening
                  ? "bg-[#ef4444] text-white animate-pulse"
                  : "text-[#64748b] hover:text-[#0f766e] hover:bg-[#f1f5f9]"
              }`}
              title={isListening ? "Listening... click to stop" : "Voice dictation"}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="my-2 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            sourceLang === "en"
              ? "Type words, full sentences, or greetings in English... (e.g. 'How are you this morning?')"
              : "Handiika ebigambo eby'Orunyankole... (e.g. 'Oraire ota munywani wangye?')"
          }
          className="w-full min-h-[120px] max-h-[260px] resize-y bg-transparent border-0 focus:outline-none text-base sm:text-lg text-[#1e293b] placeholder:text-[#94a3b8] leading-relaxed"
        />
      </div>

      {/* Suggested Quick Phrases */}
      <div className="pt-2 border-t border-[#f8fafc]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-[11px] text-[#94a3b8] font-medium whitespace-nowrap">
            Try:
          </span>
          {sampleList.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSamplePhrase(sample)}
              className="text-xs px-2.5 py-1 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] active:bg-[#e2e8f0] text-[#475569] border border-[#e2e8f0] whitespace-nowrap transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Footer info & Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#94a3b8]">
            {text.length} characters • Ctrl+Enter to translate
          </span>

          <button
            id="translate-btn"
            onClick={onTranslate}
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] active:bg-[#0b544f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>Translate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
