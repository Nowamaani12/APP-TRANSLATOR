import React from "react";
import { ArrowLeftRight, Sparkles, ShieldCheck, Users } from "lucide-react";
import { Language, Formality } from "../types";

interface LanguageBarProps {
  sourceLang: Language;
  targetLang: Language;
  onSwapLanguages: () => void;
  onSelectSource: (lang: Language) => void;
  onSelectTarget: (lang: Language) => void;
  formality: Formality;
  onChangeFormality: (f: Formality) => void;
}

export const LanguageBar: React.FC<LanguageBarProps> = ({
  sourceLang,
  targetLang,
  onSwapLanguages,
  onSelectSource,
  onSelectTarget,
  formality,
  onChangeFormality,
}) => {
  const getLanguageName = (code: Language) => {
    return code === "en" ? "English" : "Runyankole (Nkore)";
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#e2e0d8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Languages Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        {/* Source Language Button */}
        <div className="flex-1 flex items-center justify-between px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">
              Translate From
            </span>
            <span className="text-sm sm:text-base font-bold text-[#0f172a]">
              {getLanguageName(sourceLang)}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#475569] border border-[#cbd5e1]">
            {sourceLang.toUpperCase()}
          </span>
        </div>

        {/* Swap Button */}
        <button
          id="swap-languages-btn"
          onClick={onSwapLanguages}
          className="p-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] active:scale-95 text-[#0f766e] transition-all shadow-xs"
          title="Swap translation direction"
          aria-label="Swap translation direction"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Target Language Button */}
        <div className="flex-1 flex items-center justify-between px-3.5 py-2.5 bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#0f766e]">
              Translate To
            </span>
            <span className="text-sm sm:text-base font-bold text-[#115e59]">
              {getLanguageName(targetLang)}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#0f766e] border border-[#99f6e4]">
            {targetLang.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Formality / Etiquette Tone Selector */}
      <div className="flex items-center gap-1.5 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#f1f5f9]">
        <span className="text-xs text-[#64748b] font-medium mr-1 hidden sm:inline">
          Tone:
        </span>

        <button
          id="tone-standard-btn"
          onClick={() => onChangeFormality("standard")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            formality === "standard"
              ? "bg-[#0f766e] text-white shadow-xs"
              : "bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
          }`}
          title="Standard natural translation"
        >
          <Sparkles className="w-3 h-3" />
          Standard
        </button>

        <button
          id="tone-respectful-btn"
          onClick={() => onChangeFormality("respectful")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            formality === "respectful"
              ? "bg-[#0f766e] text-white shadow-xs"
              : "bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
          }`}
          title="Honorific/Respectful address (elders, parents, formal greetings)"
        >
          <ShieldCheck className="w-3 h-3 text-[#f59e0b]" />
          Respectful / Elders
        </button>

        <button
          id="tone-casual-btn"
          onClick={() => onChangeFormality("casual")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            formality === "casual"
              ? "bg-[#0f766e] text-white shadow-xs"
              : "bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
          }`}
          title="Casual conversational address with peers/friends"
        >
          <Users className="w-3 h-3" />
          Casual / Peers
        </button>
      </div>
    </div>
  );
};
