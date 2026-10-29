import { Input, Button, Chip, Spinner, Select, SelectItem } from "@heroui/react";
import { RiSearchLine, RiRefreshLine, RiWifiOffLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import FeedSite from "./FeedSite";
import { FeedInterface } from "../interfaces";
import { useAppContext } from "../AppContext";
import {
  fetchDiscoverFeeds,
  DiscoverFeed,
  DiscoverFilters,
  DiscoverPagination,
} from "../helpers/discoverData";

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

const URL_REGEX = /^(https?:\/\/\S+|[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?)$/i;

function looksLikeUrl(value: string): boolean {
  return URL_REGEX.test(value.trim());
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

type ErrorKind = "offline" | "server" | null;

export default function FeedFinder() {
  const { currentAccount } = useAppContext();
  const { t } = useTranslation(["discover", "feeds"]);

  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const [feeds, setFeeds] = useState<FeedInterface[]>([]);
  const [pagination, setPagination] = useState<DiscoverPagination | null>(null);
  const [availableFilters, setAvailableFilters] = useState<DiscoverFilters | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);

  const [urlFeeds, setUrlFeeds] = useState<FeedInterface[] | null>(null);
  const [isScraping, setIsScraping] = useState(false);


  const isUrlMode = looksLikeUrl(input);
  const searchQuery = looksLikeUrl(debouncedInput) ? "" : debouncedInput.trim();
  const hasSearch = !isUrlMode && (searchQuery !== "" || selectedTags.length > 0 || selectedLanguage !== "");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 400);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    setUrlFeeds(null);
  }, [input, currentAccount?.id]);

  useEffect(() => {
    fetchDiscoverFeeds({ page: 1 })
      .then((data) => setAvailableFilters(data.metadata.filters))
      .catch((err) => setError(!navigator.onLine || err instanceof TypeError ? "offline" : "server"));
  }, []);

  const loadFeeds = async (page: number, reset: boolean) => {
    if (reset) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const data = await fetchDiscoverFeeds({
        q: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        language: selectedLanguage || undefined,
        page,
      });

      const accountId = currentAccount!.id!;
      const mapped = data.feeds.map((f) => discoverFeedToFeedInterface(f, accountId));
      setFeeds((prev) => (reset ? mapped : [...prev, ...mapped]));
      setPagination(data.metadata.pagination);
      setAvailableFilters(data.metadata.filters);
    } catch (err) {
      setError(!navigator.onLine || err instanceof TypeError ? "offline" : "server");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Re-run the directory search whenever its inputs change
  useEffect(() => {
    setFeeds([]);
    setPagination(null);
    setCurrentPage(1);
    loadFeeds(1, true);
  }, [searchQuery, selectedTags, selectedLanguage, hasSearch, currentAccount?.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isUrlMode || !currentAccount?.id) return;

    setIsScraping(true);
    try {
      const message = await invoke<string>("scrape_site_feeds", {
        siteUrl: normalizeUrl(input),
        accountId: currentAccount.id,
      });
      setUrlFeeds(JSON.parse(message) as FeedInterface[]);
    } catch (err) {
      console.error(err);
      setUrlFeeds([]);
    } finally {
      setIsScraping(false);
    }
  };

  const handleLoadMore = () => {
    const next = currentPage + 1;
    setCurrentPage(next);
    loadFeeds(next, false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag],
    );
  };

  if (!currentAccount) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{t("feeds:noAccountSelected")}</h3>
        <p className="text-sm text-foreground-500">{t("feeds:noAccountSelectedDesc")}</p>
      </div>
    );
  }

  const hasMore = pagination ? currentPage < pagination.last : false;

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-4">
        <Input
          variant="bordered"
          size="lg"
          placeholder={t("discover:searchPlaceholder")}
          aria-label={t("discover:searchPlaceholder")}
          value={input}
          onValueChange={setInput}
          startContent={<RiSearchLine className="w-4 h-4 text-foreground-400 shrink-0" />}
          isClearable
          onClear={() => setInput("")}
          autoFocus
        />
        {!isUrlMode && availableFilters && availableFilters.languages.length > 0 && (
          <Select
            variant="bordered"
            size="lg"
            placeholder={t("discover:languagePlaceholder")}
            className="w-36 shrink-0"
            selectedKeys={selectedLanguage ? [selectedLanguage] : []}
            onSelectionChange={(keys) => setSelectedLanguage((Array.from(keys)[0] as string) ?? "")}
            aria-label={t("discover:filterByLanguage")}
          >
            {availableFilters.languages.map((lang) => (
              <SelectItem key={lang}>{lang.toUpperCase()}</SelectItem>
            ))}
          </Select>
        )}
        {isUrlMode && (
          <Button color="primary" variant="flat" size="lg" isLoading={isScraping} >
            {t("discover:findFeeds")}
          </Button>
        )}
      </form>

      {/* Topics: shown by default and while searching */}
      {!isUrlMode && availableFilters && availableFilters.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center mb-5">
          <span className="text-xs text-foreground-400 uppercase tracking-wide font-semibold mr-1">
            {t("discover:topics")}
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
              #{tag}
            </Chip>
          ))}
        </div>
      )}

      {/* URL mode */}
      {isUrlMode && (
        <>
          <p className="text-sm text-foreground-500 mb-4">
            {t("discover:urlHint")}
          </p>
          {isScraping && (
            <div className="flex justify-center py-16">
              <Spinner color="primary" />
            </div>
          )}
          {!isScraping && urlFeeds !== null && (
            urlFeeds.length === 0 ? (
              <p className="py-8 text-center text-foreground-500">{t("feeds:noRssFound")}</p>
            ) : (
              <div className="flex flex-col gap-3 pb-8">
                <h3 className="font-semibold text-sm text-foreground-500">{t("feeds:feedsFound")}</h3>
                {urlFeeds.map((feed) => (
                  <FeedSite key={feed.link} feed={feed} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Directory search mode */}
      {!isUrlMode && hasSearch && (
        <>
          {error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              {error === "offline" ? (
                <>
                  <RiWifiOffLine className="w-12 h-12 text-foreground-300" />
                  <h3 className="text-lg font-semibold">{t("discover:noInternetTitle")}</h3>
                  <p className="text-sm text-foreground-500 max-w-xs">{t("discover:noInternetDesc")}</p>
                </>
              ) : (
                <>
                  <span className="text-4xl">🛰️</span>
                  <h3 className="text-lg font-semibold">{t("discover:serviceUnavailableTitle")}</h3>
                  <p className="text-sm text-foreground-500 max-w-xs">{t("discover:serviceUnavailableDesc")}</p>
                </>
              )}
              <Button
                size="sm"
                variant="bordered"
                color="primary"
                startContent={<RiRefreshLine className="w-4 h-4" />}
                onPress={() => loadFeeds(1, true)}
              >
                {t("discover:retry")}
              </Button>
            </div>
          )}

          {isLoading && !error && (
            <div className="flex justify-center py-16">
              <Spinner color="primary" />
            </div>
          )}

          {!isLoading && !error &&
            (feeds.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-semibold">{t("discover:noFeedsTitle")}</h3>
                <p className="text-sm text-foreground-500">{t("discover:noFeedsDesc")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-8">
                {feeds.map((feed, idx) => (
                  <FeedSite key={`${feed.link}-${idx}`} feed={feed} />
                ))}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button variant="bordered" size="sm" isLoading={isLoadingMore} onPress={handleLoadMore}>
                      {t("discover:loadMore")}
                    </Button>
                  </div>
                )}
                {pagination && !hasMore && (
                  <p className="text-center text-xs text-foreground-400 pt-2">
                    {t("discover:showingResults", { count: pagination.count })}
                  </p>
                )}
              </div>
            ))}
        </>
      )}

      {/* Initial load failure with nothing to show yet */}
      {!isUrlMode && !hasSearch && error && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <RiWifiOffLine className="w-10 h-10 text-foreground-300" />
          <p className="text-sm text-foreground-500 max-w-xs">
            {t(error === "offline" ? "discover:noInternetDesc" : "discover:serviceUnavailableDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
