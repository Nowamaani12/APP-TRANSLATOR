import React from "react";
import { X, BookOpen, Clock, ShieldCheck, Layers, Sparkles } from "lucide-react";

interface LinguisticGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinguisticGuideModal: React.FC<LinguisticGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1e293b]">
                Runyankole Linguistic & Cultural Guide
              </h3>
              <p className="text-xs text-[#64748b]">
                Understanding grammar, etiquette, and time-based greetings
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-[#334155] leading-relaxed">
          {/* Section 1: The Greeting Clock */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <Clock className="w-4 h-4 text-[#0f766e]" />
              <h4>1. The Greeting Clock (Time of Day Matters!)</h4>
            </div>
            <p className="text-xs text-[#64748b]">
              In Ankole culture, a proper greeting must match the time of day and the person&apos;s status:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f766e]">
                  Morning (Until ~11:00 AM)
                </span>
                <p className="font-bold text-[#0f172a] text-xs">Oraire ota? (Singular)</p>
                <p className="font-bold text-[#0f172a] text-xs">Muraire muta? (Plural / Elders)</p>
                <p className="text-[11px] text-[#64748b]">Reply: &ldquo;Ndaire gye&rdquo; (I slept well)</p>
              </div>

              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d97706]">
                  Afternoon & Evening (From ~12:00 PM)
                </span>
                <p className="font-bold text-[#0f172a] text-xs">Osiibire ota? (Singular)</p>
                <p className="font-bold text-[#0f172a] text-xs">Musiibire muta? (Plural / Elders)</p>
                <p className="text-[11px] text-[#64748b]">Reply: &ldquo;Nsiibire gye&rdquo; (I spent the day well)</p>
              </div>
            </div>
          </div>

          {/* Section 2: The Honorific "M-" Prefix */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <ShieldCheck className="w-4 h-4 text-[#f59e0b]" />
              <h4>2. Respect & Honorifics (Singular vs Plural)</h4>
            </div>
            <p className="text-xs text-[#475569]">
              In Runyankole, addressing an elder, parent, in-law, or stranger requires using the plural prefix <code className="bg-[#f1f5f9] px-1 py-0.5 rounded text-[#0f766e] font-mono">Mu-</code> / <code className="bg-[#f1f5f9] px-1 py-0.5 rounded text-[#0f766e] font-mono">Mwe-</code>.
            </p>
            <div className="p-3 rounded-xl bg-[#fefce8] border border-[#fef08a] space-y-1 text-xs">
              <p>
                <strong className="text-[#854d0e]">Webale:</strong> Thank you (to a single friend or peer).
              </p>
              <p>
                <strong className="text-[#854d0e]">Mwebale:</strong> Thank you (to an elder, teacher, parent, or group). Adding <span className="italic">munonga</span> makes it &ldquo;Thank you very much&rdquo;.
              </p>
            </div>
          </div>

          {/* Section 3: Agglutination & Noun Classes */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <Layers className="w-4 h-4 text-[#6366f1]" />
              <h4>3. Bantu Agglutination (How Words Combine)</h4>
            </div>
            <p className="text-xs text-[#475569]">
              Runyankole is an agglutinative language where an entire English sentence can be condensed into a single word by stacking prefixes and suffixes:
            </p>
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] font-mono text-xs space-y-1 text-[#0f172a]">
              <p className="font-bold text-[#0f766e]">Ninkukunda (&ldquo;I love you&rdquo;)</p>
              <div className="text-[11px] text-[#64748b] pl-2 border-l-2 border-[#cbd5e1] space-y-0.5">
                <p>• <span className="font-semibold text-[#0f172a]">Ni-</span> : Present continuous marker</p>
                <p>• <span className="font-semibold text-[#0f172a]">-n-</span> : 1st person subject prefix (&ldquo;I&rdquo;)</p>
                <p>• <span className="font-semibold text-[#0f172a]">-ku-</span> : 2nd person object infix (&ldquo;you&rdquo;)</p>
                <p>• <span className="font-semibold text-[#0f172a]">-kunda</span> : Verb root (&ldquo;love&rdquo;)</p>
              </div>
            </div>
          </div>

          {/* Section 4: Ankole Cultural Highlights */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <Sparkles className="w-4 h-4 text-[#d97706]" />
              <h4>4. Ankole Cultural Symbols</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <strong className="text-[#0f172a] block">Amate (Milk) & Ente (Cattle):</strong>
                <span className="text-[#64748b]">Long-horned Ankole cattle (Inyambo) are a legendary pride, symbol of peace, hospitality, and life.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <strong className="text-[#0f172a] block">Eshabwe (Ghee Delicacy):</strong>
                <span className="text-[#64748b]">Traditional clarified butter condiment served at ceremonies with Karo (millet bread).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#e2e8f0] bg-[#fcfcfb] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-lg transition-colors"
          >
            Got it, Let&apos;s Translate
          </button>
        </div>
      </div>
    </div>
  );
};
