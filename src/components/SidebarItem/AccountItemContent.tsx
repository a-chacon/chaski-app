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

const AccountItemContent: React.FC<{ account: AccountInterface }> = ({ account }) => {
  const [groupedFeeds, setGroupedFeeds] = useState<Record<string, FeedInterface[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFeeds = useCallback(async () => {
    if (!account.id) {
      setGroupedFeeds({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const feeds = await indexFeeds(account.id);
    const grouped = groupBy(feeds, (f) => f.folder);
    setGroupedFeeds(grouped);
    setLoading(false);
  }, [account.id]);

  useEffect(() => {
    if (account.kind === 'local' || account.kind === 'greaderapi') {
      fetchFeeds();
    } else {
      setLoading(false);
    }
  }, [account.kind, fetchFeeds]);

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
  }, [account.id, account.kind, fetchFeeds]);

  if (loading) {
    return <div className="px-3 text-sm text-foreground-500">Loading feeds...</div>;
  }

  return (
    <div className="flex flex-col gap-1 px-1">
      {account.kind === 'local' || account.kind === 'greaderapi' ? (
        Object.entries(groupedFeeds).map(([folder, feeds]) => (
          <FolderItem key={folder} account={account} folderName={folder} feeds={feeds} />
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

