import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import translations from '@/lib/translations';

const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'en', // 'en' | 'hi' | 'gu'
      setLang: (lang) => set({ lang }),
      // t('key') — returns translated string for current language
      t: (key) => {
        const { lang } = get();
        const entry = translations[key];
        if (!entry) return key;
        return entry[lang] ?? entry['en'] ?? key;
      },
    }),
    {
      name: 'farmcalc-language', // localStorage key
    }
  )
);

export default useLanguageStore;
