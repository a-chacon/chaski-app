import { createContext, useContext, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

export type SyncState = 'idle' | 'syncing' | 'fetching';

interface SyncStatusContextValue {
  syncState: SyncState;
}

const SyncStatusContext = createContext<SyncStatusContextValue>({ syncState: 'idle' });

export function SyncStatusProvider({ children }: { children: React.ReactNode }) {
  const [syncState, setSyncState] = useState<SyncState>('idle');

  useEffect(() => {
    const unlistenFns: Array<() => void> = [];

    const setup = async () => {
      unlistenFns.push(
        await listen('account://sync-start', () => setSyncState('syncing'))
      );
      unlistenFns.push(
        await listen('account://sync-complete', () => setSyncState('idle'))
      );
      unlistenFns.push(
        await listen('account://sync-error', () => setSyncState('idle'))
      );
      unlistenFns.push(
        await listen('feed://fetch-start', () =>
          setSyncState((prev) => (prev !== 'syncing' ? 'fetching' : prev))
        )
      );
      unlistenFns.push(
        await listen('feed://fetch-complete', () =>
          setSyncState((prev) => (prev === 'fetching' ? 'idle' : prev))
        )
      );
    };

    setup();

    return () => unlistenFns.forEach((f) => f());
  }, []);

  return (
    <SyncStatusContext.Provider value={{ syncState }}>
      {children}
    </SyncStatusContext.Provider>
  );
}

export function useSyncStatus(): SyncStatusContextValue {
  return useContext(SyncStatusContext);
}
