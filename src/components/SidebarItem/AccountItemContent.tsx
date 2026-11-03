import React, { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { AccountInterface, FeedInterface } from '../../interfaces';
import FolderItem from './FolderItem';
import { indexFeeds } from '../../helpers/feedsData';


const SIDEBAR_UPDATED_EVENT = 'sidebar://updated';

interface SidebarUpdatedPayload {
  accountId?: number;
  entity?: 'feed' | 'folder';
  action?: 'create' | 'update' | 'delete' | 'rename' | 'import' | 'sync';
}

function groupBy<T>(arr: T[], fn: (item: T) => any) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}

const AccountItemContent: React.FC<{ account: AccountInterface; foldSignal?: { open: boolean; id: number } | null }> = ({ account, foldSignal }) => {
  const [groupedFeeds, setGroupedFeeds] = useState<Record<string, FeedInterface[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [folderStatus, setFolderStatus] = useState<Map<string, boolean>>(new Map());

  const fetchFeeds = useCallback(async () => {
    if (!account.id) {
      setGroupedFeeds({});
      setLoading(false);
      return;
    }

    const feeds = await indexFeeds(account.id);
    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
    const sortedFeeds = [...feeds].sort((a, b) => collator.compare(a.title ?? '', b.title ?? ''));
    const grouped = groupBy(sortedFeeds, (f) => f.folder);

    setFolderStatus((prev) => new Map(Object.keys(grouped).map(folder => [folder, prev.get(folder) ?? false])));
    setGroupedFeeds(grouped);
    setLoading(false);
  }, [account.id]);

  useEffect(() => {
    if (account.kind === 'local' || account.kind === 'greaderapi') {
      // Show the loading state only on initial load / account change, not on
      // refreshes, so folders keep their expanded state.
      setLoading(true);
      fetchFeeds();
    } else {
      setLoading(false);
    }
  }, [account.kind, account.id]);


  useEffect(() => {
    if (account.kind !== 'local' && account.kind !== 'greaderapi') {
      return;
    }

    let unlisten: (() => void) | undefined;


    const setupSidebarListener = async () => {
      unlisten = await listen<SidebarUpdatedPayload>(SIDEBAR_UPDATED_EVENT, (event) => {
        const updatedAccountId = event.payload?.accountId;

        if (!updatedAccountId || updatedAccountId === account.id) {
          fetchFeeds();
        }
      });
    };

    setupSidebarListener();

    return () => {

      if (unlisten) {
        unlisten();
      }
    };
  }, [account.id, account.kind]);

  useEffect(() => {
    if (!foldSignal) return;
    setFolderStatus((prev) => new Map(Array.from(prev.keys()).map((folder) => [folder, foldSignal.open])));
  }, [foldSignal]);

  if (loading) {
    return <div className="px-3 text-sm text-foreground-500">Loading feeds...</div>;
  }

  const setIsOpen = (folder: string, value: boolean) => {
    setFolderStatus((prev) => new Map(prev).set(folder, value));
  };

  return (
    <div className="flex flex-col gap-1 px-1">
      {account.kind === 'local' || account.kind === 'greaderapi' ? (
        Object.entries(groupedFeeds)
          .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }))
          .map(([folder, feeds]) => (
            <FolderItem key={folder} account={account} folderName={folder} feeds={feeds} isOpen={folderStatus.get(folder) ?? false} setIsOpen={setIsOpen} />
          ))
      ) : (
        <div>
          <p>Account kind is not supported for displaying feeds.</p>
        </div>
      )}
    </div>
  );
};

export default AccountItemContent;

