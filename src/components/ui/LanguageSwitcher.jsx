'use client';

import useLanguageStore from '@/store/useLanguageStore';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'gu', label: 'ગુ' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguageStore();

  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-2.5 py-1 rounded-[10px] text-xs font-bold transition-all duration-200 ${
            lang === code
              ? 'bg-[#166534] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 active:scale-95'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
