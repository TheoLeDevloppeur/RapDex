import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  addCard,
  hasCard,
  loadCollection,
  newestFirst,
  removeCard,
  saveCollection,
  type CollectionEntry,
} from '@/data/collection';

type CollectionContextValue = {
  /** false tant que la collection enregistrée n'est pas lue. */
  ready: boolean;
  /** Les cartes, les plus récentes d'abord. */
  entries: CollectionEntry[];
  has: (id: string) => boolean;
  /** Ajoute la carte et renvoie true, ou false si elle était déjà là. */
  add: (id: string) => boolean;
  remove: (id: string) => void;
  /**
   * La dernière carte ajoutée pendant cette session (étiquette « NEW »).
   * landed passe à true une fois que la collection a joué son animation d'arrivée.
   */
  lastAdded: { id: string; landed: boolean } | null;
  markLanded: () => void;
};

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<readonly CollectionEntry[]>([]);
  const [ready, setReady] = useState(false);
  // Référence à jour pour que add/remove restent synchrones et sans doublon.
  const current = useRef<readonly CollectionEntry[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadCollection().then((stored) => {
      if (cancelled) return;
      current.current = stored;
      loaded.current = true;
      setEntries(stored);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next: readonly CollectionEntry[]) => {
    // Avant la fin de la lecture, un changement serait écrasé par les données lues.
    if (!loaded.current || next === current.current) return false;
    current.current = next;
    setEntries(next);
    saveCollection(next).catch(() => {
      // L'enregistrement peut échouer (stockage plein) : la collection reste à jour
      // pour cette session, on retentera au prochain changement.
    });
    return true;
  }, []);

  const [lastAdded, setLastAdded] = useState<{ id: string; landed: boolean } | null>(null);

  const add = useCallback(
    (id: string) => {
      const added = commit(addCard(current.current, id));
      if (added) setLastAdded({ id, landed: false });
      return added;
    },
    [commit]
  );
  const remove = useCallback(
    (id: string) => {
      if (commit(removeCard(current.current, id))) {
        setLastAdded((last) => (last?.id === id ? null : last));
      }
    },
    [commit]
  );
  const markLanded = useCallback(() => setLastAdded((last) => (last ? { ...last, landed: true } : last)), []);
  const has = useCallback((id: string) => hasCard(entries, id), [entries]);

  const value = useMemo(
    () => ({ ready, entries: newestFirst(entries), has, add, remove, lastAdded, markLanded }),
    [ready, entries, has, add, remove, lastAdded, markLanded]
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection doit être utilisé sous <CollectionProvider>.');
  return ctx;
}
