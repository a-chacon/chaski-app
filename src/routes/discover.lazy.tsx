import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Input, Button, Chip, Spinner, Select, SelectItem } from "@heroui/react";
import { RiSearchLine, RiRefreshLine, RiWifiOffLine } from "@remixicon/react";
import { useState, useEffect, useCallback, useRef } from "react";
import FeedSite from "../components/FeedSite";
import { FeedInterface } from "../interfaces";
import { useAppContext } from '../AppContext'

import {
  fetchDiscoverFeeds,
  DiscoverFeed,
  DiscoverFilters,
  DiscoverPagination,
} from "../helpers/discoverData";

export const Route = createLazyFileRoute("/discover")({
  component: Discover,
});

function discoverFeedToFeedInterface(feed: DiscoverFeed, accountId: number): FeedInterface {
  return {
    id: undefined, // not saved locally yet
    title: feed.title,
    description: feed.description,
    link: feed.link,
    icon: `https://www.google.com/s2/favicons?domain=${feed.host}&sz=32`,
    last_fetch: new Date(0),
    latest_entry: new Date(0),
    items_count: 0,
    kind: feed.kind,
    entry_limit: 0,
    history_limit: 0,
    update_interval_minutes: 0,
    notifications_enabled: 0,
    unread_count: 0,
    account_id: accountId,
    default_entry_type: "article",
    tags: feed.tags.map((t) => t.slug),
  };
}


type ErrorKind = "offline" | "server" | null;

export default function Discover() {
  const { currentAccount } = useAppContext()

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const [feeds, setFeeds] = useState<FeedInterface[]>([]);
  const [pagination, setPagination] = useState<DiscoverPagination | null>(null);
  const [availableFilters, setAvailableFilters] =
    useState<DiscoverFilters | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search query
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Reset and re-fetch whenever search/filters change
  useEffect(() => {
    setFeeds([]);
    setCurrentPage(1);
    setPagination(null);
    loadFeeds(1, true);
  }, [debouncedQuery, selectedTags, selectedLanguage]);

  const loadFeeds = useCallback(
    async (page: number, reset = false) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const data = await fetchDiscoverFeeds({
          q: debouncedQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          language: selectedLanguage || undefined,
          page,
        });

        const accountId = currentAccount!.id!;
        const mapped = data.feeds.map((f) => discoverFeedToFeedInterface(f, accountId));

        setFeeds((prev) => (reset ? mapped : [...prev, ...mapped]));
        setPagination(data.metadata.pagination);

        // Only update available filters on first page / fresh search
        if (page === 1) {
          setAvailableFilters(data.metadata.filters);
        }
      } catch (err) {
        const isOffline = !navigator.onLine || err instanceof TypeError;
        setError(isOffline ? "offline" : "server");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedQuery, selectedTags, selectedLanguage, currentAccount?.id]
  );

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadFeeds(nextPage, false);
  };

  const handleRetry = () => {
    loadFeeds(1, true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };


  const hasMore = pagination ? currentPage < pagination.last : false;

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-screen-md mx-auto px-4">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl pt-2 font-bold">Discover</h1>
          <h2 className="pt-1 pb-4 text-foreground-500">
            Explore curated feeds from around the world and follow what
            interests you.
          </h2>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4 items-center">
          <Input
            variant="bordered"
            placeholder="Search feeds..."
            value={query}
            onValueChange={setQuery}
            startContent={
              <RiSearchLine className="w-4 h-4 text-foreground-400 shrink-0" />
            }
            isClearable
            onClear={() => setQuery("")}
            autoFocus
          />
          {availableFilters && availableFilters.languages.length > 0 && (
            <Select
              variant="bordered"
              placeholder="Language"
              className="w-36 shrink-0"
              selectedKeys={selectedLanguage ? [selectedLanguage] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string ?? "";
                setSelectedLanguage(val);
              }}
              aria-label="Filter by language"
            >
              {availableFilters.languages.map((lang) => (
                <SelectItem key={lang}>
                  {lang.toUpperCase()}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>

        {/* Filters */}
        {availableFilters && (
          <div className="flex flex-col gap-2 mb-5">
            {availableFilters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-foreground-400 uppercase tracking-wide font-semibold mr-1">
                  Topics
                </span>
                {availableFilters.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant={selectedTags.includes(tag) ? "flat" : "bordered"}
                    color="default"
                    className={`cursor-pointer ${selectedTags.includes(tag) ? "font-semibold" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Error states */}
        {error && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            {error === "offline" ? (
              <>
                <RiWifiOffLine className="w-12 h-12 text-foreground-300" />
                <h3 className="text-lg font-semibold">No internet connection</h3>
                <p className="text-sm text-foreground-500 max-w-xs">
                  Discover requires an internet connection to load feeds. Check
                  your connection and try again.
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl">🛰️</span>
                <h3 className="text-lg font-semibold">Service unavailable</h3>
                <p className="text-sm text-foreground-500 max-w-xs">
                  The discovery service is temporarily unreachable. Please try
                  again in a moment.
                </p>
              </>
            )}
            <Button
              size="sm"
              variant="bordered"
              color="primary"
              startContent={<RiRefreshLine className="w-4 h-4" />}
              onPress={handleRetry}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="flex justify-center py-16">
            <Spinner color="primary" />
          </div>
        )}

        {/* Feed list */}
        {!isLoading && !error && (
          <>
            {feeds.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-semibold">No feeds found</h3>
                <p className="text-sm text-foreground-500">
                  Try a different search term or remove some filters.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-8">
                {feeds.map((feed, idx) => (
                  <FeedSite key={`${feed.link}-${idx}`} feed={feed} />
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="bordered"
                      size="sm"
                      isLoading={isLoadingMore}
                      onPress={handleLoadMore}
                    >
                      Load more
                    </Button>
                  </div>
                )}

                {pagination && !hasMore && feeds.length > 0 && (
                  <p className="text-center text-xs text-foreground-400 pt-2">
                    Showing all {pagination.count} result
                    {pagination.count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainSectionLayout>
  );
}
