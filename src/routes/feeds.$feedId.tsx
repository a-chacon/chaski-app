import { createFileRoute } from "@tanstack/react-router";
import { FeedInterface, EntryInterface } from "../interfaces";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import EntriesList from "../components/EntriesList";
import FeedPageActions from "../components/FeedPageActions";
import FeedHeader from "../components/FeedHeader";
import { updateEntriesAsReadByFeedId, refreshEntries } from "../helpers/feedsData";
import { getFeed } from "../helpers/feedsData";
import { useEntries } from "../IndexEntriesContext";
import { useNotification } from "../NotificationContext";
import { useAppContext } from "../AppContext";
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute("/feeds/$feedId")({
  component: Feed,
});

export default function Feed() {
  const { t } = useTranslation('entries');
  const { addNotification } = useNotification();
  const { showReadEntries, showHiddenEntries, entriesOrder } = useAppContext();
  const { feedId } = Route.useParams();
  const { entries, setEntries, page, setPage, hasMore, setHasMore, scrollTop, setScrollTop } =
    useEntries(feedId);

  const [feed, setFeed] = useState<FeedInterface | undefined>(undefined);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    const el = document.getElementById('mainDiv')
    if (el && scrollTop > 0) {
      el.scrollTop = scrollTop
    }

    return () => {
      const el = document.getElementById('mainDiv')
      if (el) {
        setScrollTop(el.scrollTop)
      }
    }
  }, []);

  useEffect(() => {
    getFeed(parseInt(feedId)).then((feed) => {
      if (feed) {
        setFeed(feed);
      }
    });
  }, [feedId]);

  useEffect(() => {
    if (page === 1 && entries.length === 0) {
      fetchEntries();
    }
  }, [page, entries.length, showReadEntries, showHiddenEntries, feedId, entriesOrder]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    resetEntryList()
    setHasMore(true);
  }, [feedId, showReadEntries, showHiddenEntries, entriesOrder]);

  const fetchEntries = async () => {
    try {
      const message = await invoke<string>("list_entries", {
        page,
        items: 50,
        filters: {
          feed_id_eq: parseInt(feedId),
          order: entriesOrder,
          ...(showReadEntries ? {} : { read_eq: 0 }),
          ...(showHiddenEntries ? {} : { hidden_eq: 0 }),
        },
      });

      const new_entries: EntryInterface[] = JSON.parse(message);

      setEntries((prevEntries) => [...prevEntries, ...new_entries]);

      if (new_entries.length === 0) {
        setHasMore(false);
      }

      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleUpdateAllEntriesAsRead = async () => {
    await updateEntriesAsReadByFeedId(parseInt(feed!.id!.toString()));
    resetEntryList();

    addNotification(t('updatedTitle'), t('updatedBody'), 'primary');
  };

  const handleRefreshEntries = async () => {
    setRefreshLoading(true);
    try {
      const result = await refreshEntries(parseInt(feed!.id!.toString()));
      if (result && typeof result === 'string') {
        const response = JSON.parse(result);
        if (response.success) {
          resetEntryList();
          await fetchEntries();
          addNotification(t('reloadedTitle'), t('reloadingBody'), 'primary');
        } else {
          addNotification('Error', response.message || 'Failed to refresh entries', 'danger');
        }
      }
    } catch (error) {
      console.error('Error refreshing entries:', error);
      addNotification('Error', 'Failed to refresh entries', 'danger');
    } finally {
      setRefreshLoading(false);
    }
  };

  const resetEntryList = () => {
    setEntries([]);
    setPage(1);
  };

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-(--breakpoint-md) mx-auto px-4">
        <FeedHeader
          feed={feed}
          actions={
            feed && (
              <FeedPageActions
                feed={feed}
                setFeed={setFeed}
                onMarkAsRead={handleUpdateAllEntriesAsRead}
                onRefresh={handleRefreshEntries}
                refreshLoading={refreshLoading}
              />
            )
          }
        />
        {entries.length > 0 || !hasMore ? (
          <EntriesList
            entries={entries}
            key={feed?.id}
            fetchEntries={fetchEntries}
            hasMore={hasMore}
            header={false}
            onRefresh={resetEntryList}
          />
        ) : (
          <div className="flex justify-center p-6">Loading initial data...</div>
        )}
      </div>
    </MainSectionLayout>
  );
}
