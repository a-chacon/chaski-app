import { createFileRoute } from "@tanstack/react-router";
import { FeedInterface, EntryInterface } from "../interfaces";
import moment from "moment";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import EntriesList from "../components/EntriesList";
import FeedSiteActions from "../components/FeedSiteActions";
import { Button, Spinner, Snippet, Tooltip } from "@heroui/react";
import { RiRefreshLine, RiCheckDoubleLine } from "@remixicon/react";
import { updateEntriesAsReadByFeedId, refreshEntries } from "../helpers/feedsData";
import { getFeed } from "../helpers/feedsData";
import { useEntries } from "../IndexEntriesContext";
import { useNotification } from "../NotificationContext";

export const Route = createFileRoute("/feeds/$feedId")({
  component: Feed,
});

export default function Feed() {
  const { addNotification } = useNotification();
  const { feedId } = Route.useParams();
  const { entries, setEntries, page, setPage, hasMore, setHasMore } =
    useEntries(feedId);

  const [feed, setFeed] = useState<FeedInterface | undefined>(undefined);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    getFeed(parseInt(feedId)).then((feed) => {
      if (feed) {
        setFeed(feed);
      }
    });
  }, [feedId]);

  useEffect(() => {
    if (page === 1 && entries.length == 0) {
      fetchEntries();
    }
  }, [page]);

  const fetchEntries = async () => {
    try {
      const message = await invoke<string>("list_entries", {
        page,
        items: 20,
        filters: { feed_id_eq: parseInt(feedId), read_eq: 0 },
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

    addNotification("Updated", 'All entries were updated as read!', 'primary');
  };

  const handleRefreshEntries = async () => {
    setRefreshLoading(true);
    await refreshEntries(parseInt(feed!.id!.toString()));
    resetEntryList();
    setRefreshLoading(false);

    addNotification("Reloaded", 'Entries are reloaded!', 'primary');
  };

  const resetEntryList = () => {
    setEntries([]);
    setPage(1);
  };

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex flex-col border-b border-primary-500 py-4 justify-between items-start">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row">
              <img
                src={feed?.icon}
                alt={feed?.title}
                className="h-10 my-auto mr-4"
              />
              <h1 className="text-xl md:text-3xl font-bold">{feed?.title}</h1>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Tooltip content="Update All Entries of The Feed As Read">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handleUpdateAllEntriesAsRead}
                >
                  <RiCheckDoubleLine></RiCheckDoubleLine>
                </Button>
              </Tooltip>
              <Tooltip content="Fetch New Entries">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handleRefreshEntries}
                >
                  {refreshLoading ? (
                    <Spinner color="primary" size="sm" />
                  ) : (
                    <RiRefreshLine></RiRefreshLine>
                  )}
                </Button>
              </Tooltip >

              {feed && <FeedSiteActions feed={feed} setFeed={setFeed} />}
            </div>
          </div>

          <p className="my-4 line-clamp-3 opacity-80">{feed?.description}</p>

          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <Snippet
              symbol=""
              size="sm"
              variant="bordered"
              className="w-full truncate"
            >
              {feed?.link}
            </Snippet>
            <div className="flex flex-col">
              <span className="text-sm">
                <span className="font-semibold">Last fetch: </span>
                {moment.utc(feed?.last_fetch).fromNow()}
              </span>
              <span className="text-sm">
                <span className="font-semibold">Latest entry: </span>
                {moment.utc(feed?.latest_entry).fromNow()}
              </span>
            </div>
          </div>
        </div>
        <EntriesList
          entries={entries}
          key={feed?.id}
          fetchEntries={fetchEntries}
          hasMore={hasMore}
          header={false}
        />
      </div>
    </MainSectionLayout>
  );
}
