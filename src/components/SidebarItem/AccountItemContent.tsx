import React, { useEffect, useState } from 'react';
import { AccountInterface, FeedInterface } from '../../interfaces';
import FolderItem from './FolderItem';
import { indexFeeds } from '../../helpers/feedsData';

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

  useEffect(() => {
    const fetchFeeds = async () => {
      const feeds = await indexFeeds(account.id!);

      const grouped = groupBy(feeds, (f) => f.folder);

      setGroupedFeeds(grouped);
      setLoading(false);
    };

    if (account.kind === 'local' || account.kind === 'greaderapi') {
      fetchFeeds();
    } else {
      setLoading(false);
    }
  }, [account]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
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

