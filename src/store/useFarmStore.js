import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Farm Selection ────────────────────────────────────────────
      selectedFarmId: null,
      setSelectedFarmId: (id) => set({ selectedFarmId: id }),

      // ─── Cache Structure ──────────────────────────────────────────
      // { [farmId]: { workers, expenses_upad, expenses_pesticide, income, lastFetched_* } }
      cache: {},

      // ─── Generic cache set helpers ────────────────────────────────
      setCache: (farmId, key, data) =>
        set((state) => ({
          cache: {
            ...state.cache,
            [farmId]: {
              ...(state.cache[farmId] || {}),
              [key]: data,
              [`lastFetched_${key}`]: Date.now(),
            },
          },
        })),

      invalidateCache: (farmId, key) =>
        set((state) => ({
          cache: {
            ...state.cache,
            [farmId]: {
              ...(state.cache[farmId] || {}),
              [`lastFetched_${key}`]: 0, // Mark stale
            },
          },
        })),

      invalidateAllForFarm: (farmId) =>
        set((state) => {
          const existing = state.cache[farmId] || {};
          const reset = Object.keys(existing).reduce((acc, k) => {
            acc[k] = k.startsWith('lastFetched_') ? 0 : existing[k];
            return acc;
          }, {});
          return { cache: { ...state.cache, [farmId]: reset } };
        }),

      // ─── Selectors ────────────────────────────────────────────────
      getCached: (farmId, key) => {
        const state = get();
        const farmCache = state.cache[farmId];
        if (!farmCache) return null;
        const lastFetched = farmCache[`lastFetched_${key}`] || 0;
        const isStale = Date.now() - lastFetched > STALE_TIME;
        if (isStale) return null; // force refetch
        return farmCache[key] ?? null;
      },
    }),
    {
      name: 'farmcalc-store',
      // Only persist these fields to localStorage
      partialize: (state) => ({
        selectedFarmId: state.selectedFarmId,
        cache: state.cache,
      }),
    }
  )
);

export default useAppStore;
