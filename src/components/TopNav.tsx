import React from 'react';
import { RotateCcw, Languages } from 'lucide-react';
import { Language, ModuleId } from '../types/simulation';
import { TranslationDict } from '../i18n/translations';

interface TopNavProps {
  activeModule: ModuleId;
  language: Language;
  t: TranslationDict;
  onSelectModule: (mod: ModuleId) => void;
  onToggleLanguage: () => void;
  onReset: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeModule,
  language,
  t,
  onSelectModule,
  onToggleLanguage,
  onReset,
}) => {
  const modules: { id: ModuleId; label: string; shortLabel: string }[] = [
    { id: 1, label: t.tabs.m1Full, shortLabel: t.tabs.m1Short },
    { id: 2, label: t.tabs.m2Full, shortLabel: t.tabs.m2Short },
    { id: 3, label: t.tabs.m3Full, shortLabel: t.tabs.m3Short },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-xs sticky top-0 z-30">
      <div className="max-w-[1680px] mx-auto px-4 lg:px-6 py-2 flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Left: Studio Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="10" cy="12" r="6.5" />
              <line x1="10" y1="12" x2="14.5" y2="7.5" />
              <line x1="14.5" y1="7.5" x2="20" y2="7.5" strokeDasharray="2 2" />
              <line x1="20" y1="4" x2="20" y2="20" />
            </svg>
          </div>
          <h1 className="text-[15px] sm:text-base font-bold text-slate-950 tracking-tight truncate">
            {t.studioTitle}
          </h1>
        </div>

        {/* Center: 3 Interactive Lab Mode Tabs (Pill Navigation) */}
        <nav
          aria-label="Simulation Modules"
          className="order-3 xl:order-2 w-full xl:w-auto flex items-center gap-1 p-1 bg-sky-100/80 border border-sky-200 rounded-full overflow-x-auto"
        >
          {modules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  isActive
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                <span className="hidden 2xl:inline">{mod.label}</span>
                <span className="2xl:hidden">{mod.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Language Switcher, Reset, Bold Red Institution Badge */}
        <div className="order-2 xl:order-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-slate-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Languages className="w-3.5 h-3.5 text-sky-700" />
            <span>{t.langToggleLabel}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.reset}</span>
          </button>

          <span className="bg-rose-50 border border-rose-300 text-rose-600 font-extrabold px-3 py-1 rounded-full text-sm shrink-0 select-none">
            উদ্ভাস
          </span>
        </div>
      </div>
    </header>
  );
};
