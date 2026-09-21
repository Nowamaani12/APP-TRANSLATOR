import React, { useState } from "react";
import { X, Search, Volume2, ArrowUpRight, BookOpen } from "lucide-react";
import { PHRASEBOOK_DATA } from "../data/phrasebook";
import { PhraseItem } from "../types";
import { playBrowserSpeech } from "../utils/audio";

interface PhrasebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (phrase: PhraseItem) => void;
}

const CATEGORIES = [
  "All",
  "Greetings",
  "Daily Life",
  "Travel & Directions",
  "Market & Numbers",
  "Food & Culture",
  "Emergency & Health",
];

export const PhrasebookModal: React.FC<PhrasebookModalProps> = ({
  isOpen,
  onClose,
  onSelectPhrase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const filteredPhrases = PHRASEBOOK_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.english.toLowerCase().includes(q) ||
      item.runyankole.toLowerCase().includes(q) ||
      item.phonetic.toLowerCase().includes(q) ||
      (item.context && item.context.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f766e] flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1e293b]">
                Runyankole Everyday Phrasebook
              </h3>
              <p className="text-xs text-[#64748b]">
                Essential vocabulary, greetings, etiquette & cultural expressions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-[#f1f5f9] space-y-3 bg-[#fcfcfb]">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phrases in English or Runyankole..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#0f766e] text-white"
                    : "bg-white text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Phrase List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#f8fafc]">
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-12 text-[#94a3b8] text-sm">
              No phrases found matching your search.
            </div>
          ) : (
            filteredPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0f172a]">
                      {phrase.runyankole}
                    </span>
                    <span className="text-[11px] font-mono text-[#0f766e] bg-[#f0fdfa] px-2 py-0.5 rounded border border-[#ccfbf1]">
                      {phrase.phonetic}
                    </span>
                  </div>
                  <p className="text-xs text-[#334155]">{phrase.english}</p>
                  {phrase.context && (
                    <p className="text-[11px] text-[#64748b] italic">
                      {phrase.context}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => playBrowserSpeech(phrase.runyankole, "nyn")}
                    className="p-1.5 text-[#64748b] hover:text-[#0f766e] hover:bg-white rounded-lg border border-transparent hover:border-[#e2e8f0] transition-colors"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectPhrase(phrase);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0f766e] hover:bg-[#f0fdfa] rounded-lg border border-[#ccfbf1] transition-colors"
                    title="Load into translator"
                  >
                    <span>Use</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#e2e8f0] bg-[#fcfcfb] flex items-center justify-between text-xs text-[#64748b]">
          <span>Showing {filteredPhrases.length} authentic Runyankole phrases</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
