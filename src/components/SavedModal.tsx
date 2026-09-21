import React, { useState } from "react";
import { X, Trash2, Volume2, Copy, Check, Bookmark, Search } from "lucide-react";
import { SavedTranslation } from "../types";
import { playBrowserSpeech } from "../utils/audio";

interface SavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedTranslation[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onSelect: (item: SavedTranslation) => void;
}

export const SavedModal: React.FC<SavedModalProps> = ({
  isOpen,
  onClose,
  savedList,
  onDelete,
  onClearAll,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.sourceText.toLowerCase().includes(q) ||
      item.targetText.toLowerCase().includes(q) ||
      item.phonetic.toLowerCase().includes(q)
    );
  });

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d97706] flex items-center justify-center text-white">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1e293b]">
                Saved Translations ({savedList.length})
              </h3>
              <p className="text-xs text-[#64748b]">
                Your personal vocabulary notebook stored locally
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

        {/* Search */}
        {savedList.length > 0 && (
          <div className="p-3 border-b border-[#f1f5f9] bg-[#fcfcfb]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved vocabulary..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0f766e]"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedList.length === 0 ? (
            <div className="text-center py-16 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-[#cbd5e1] mx-auto" />
              <p className="text-sm font-semibold text-[#475569]">No saved translations yet</p>
              <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
                Tap the bookmark icon on any translated card to save it here for quick reference and study.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#94a3b8]">
              No saved items matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-[#64748b] border border-[#cbd5e1]">
                        {item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] pt-1">{item.sourceText}</p>
                    <p className="text-sm font-bold text-[#0f172a]">{item.targetText}</p>
                    {item.phonetic && (
                      <p className="text-xs font-mono text-[#0f766e]">{item.phonetic}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => playBrowserSpeech(item.targetText, item.targetLang)}
                      className="p-1.5 text-[#64748b] hover:text-[#0f766e] hover:bg-white rounded-lg transition-colors"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, item.targetText)}
                      className="p-1.5 text-[#64748b] hover:text-[#0f766e] hover:bg-white rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-[#16a34a]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#edf2f7] text-[10px] text-[#94a3b8]">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="text-[#0f766e] hover:underline font-semibold"
                  >
                    Load in Translator →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedList.length > 0 && (
          <div className="p-3 border-t border-[#e2e8f0] bg-[#fcfcfb] flex items-center justify-between text-xs">
            <button
              onClick={onClearAll}
              className="text-[#ef4444] hover:underline text-xs font-medium"
            >
              Clear All Saved
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
