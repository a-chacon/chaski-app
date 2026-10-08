import { Tooltip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../AppContext';
import { useSyncStatus } from '../SyncStatusContext';

export default function StatusIndicator() {
  const { isMobile } = useAppContext();
  const { syncState } = useSyncStatus();
  const { t } = useTranslation('titlebar');

  if (isMobile) return null;

  const dotClass =
    syncState === 'syncing'
      ? 'bg-primary animate-pulse'
      : syncState === 'fetching'
        ? 'bg-warning animate-pulse'
        : 'bg-default-300';

  const label =
    syncState === 'syncing'
      ? t('status.syncing')
      : syncState === 'fetching'
        ? t('status.fetching')
        : t('status.idle');

  return (
    <Tooltip content={label} placement="top-start" delay={300}>
      <div className="absolute bottom-2 left-2 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full bg-content1 border border-default-200 shadow-sm text-foreground-600 text-xs select-none cursor-default">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
        {syncState !== 'idle' && label}
      </div>
    </Tooltip>
  );
}
