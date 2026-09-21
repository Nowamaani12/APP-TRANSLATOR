import React from "react";
import { BookOpen, Bookmark, HelpCircle, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenPhrasebook: () => void;
  onOpenSaved: () => void;
  onOpenGuide: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPhrasebook,
  onOpenSaved,
  onOpenGuide,
  savedCount,
}) => {
  return (
    <header className="border-b border-[#e2e0d8] bg-[#ffffff]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0f766e] flex items-center justify-center text-white shadow-sm ring-1 ring-[#0d645e]/20">
            <span className="font-bold text-lg tracking-wider">NY</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1e293b]">
                Runyankole Translator
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                Nkore • Southwestern Uganda
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              Accurate English ⇄ Runyankole (Runyankore) with grammar & phonetics
            </p>
          </div>
        </div>

        {/* Quick Nav Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="header-phrasebook-btn"
            onClick={onOpenPhrasebook}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] active:bg-[#e2e8f0] border border-[#e2e8f0] rounded-lg transition-colors"
            title="Everyday Runyankole Phrasebook"
          >
            <BookOpen className="w-4 h-4 text-[#0f766e]" />
            <span className="hidden md:inline">Phrasebook</span>
          </button>

          <button
            id="header-saved-btn"
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] active:bg-[#e2e8f0] border border-[#e2e8f0] rounded-lg transition-colors relative"
            title="Saved Translations"
          >
            <Bookmark className="w-4 h-4 text-[#d97706]" />
            <span className="hidden md:inline">Saved</span>
            {savedCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-[#d97706] text-white rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            id="header-guide-btn"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] active:bg-[#e2e8f0] border border-[#e2e8f0] rounded-lg transition-colors"
            title="Runyankole Grammar & Etiquette Guide"
          >
            <HelpCircle className="w-4 h-4 text-[#6366f1]" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
