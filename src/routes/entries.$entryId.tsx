import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useEffect, useState } from "react";
import { EntryInterface } from "../interfaces";
import parse, { Element, domToReact, HTMLReactParserOptions } from "html-react-parser";
import { openUrl } from "@tauri-apps/plugin-opener";
import EntryActions from "../components/EntryActions";
import ThumbnailOrMedia from "../components/ThumbnailOrMedia";
import EntryShare from "../components/EntryShare";
import InfiniteScroll from "react-infinite-scroll-component";
import { RiArrowDownLine, RiArrowLeftLine, RiDownloadCloud2Line } from "@remixicon/react";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { getEntry, scrapeEntry, updateEntryAsRead } from "../helpers/entriesData";
import { useAppContext } from "../AppContext";
import { useTranslation } from 'react-i18next';
import ErrorBoundary, { ErrorMessage } from "../components/ErrorBoundary";

export const Route = createFileRoute("/entries/$entryId")({
  component: Entry,
  errorComponent: ({ error }) => (
    <MainSectionLayout>
      <ErrorMessage error={error} />
    </MainSectionLayout>
  ),
});

function Entry() {
  const { t } = useTranslation(['entries', 'common']);
  const { entryId } = Route.useParams();
  const [entry, setEntry] = useState<EntryInterface>();
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [isScrapingEntry, setIsScrapingEntry] = useState(false);
  const { currentTheme } = useAppContext();

  useEffect(() => {
    const loadEntry = async () => {
      setIsLoadingEntry(true);

      try {
        const entry = await getEntry(parseInt(entryId));
        if (!entry) {
          return;
        }

        setEntry(entry);
        updateEntryAsRead(entry);
      } finally {
        setIsLoadingEntry(false);
      }
    };

    loadEntry();
  }, [entryId]);

  const handleScrapeEntry = async () => {
    if (!entry?.id) return;
    setIsScrapingEntry(true);
    try {
      const scraped = await scrapeEntry(entry.id);
      if (scraped) {
        setEntry(scraped);
      }
    } finally {
      setIsScrapingEntry(false);
    }
  };

  const { history } = useRouter();



  const parseOptions: HTMLReactParserOptions = {
    replace(node) {
      if (node instanceof Element && node.name === "h1") {
        return <></>;
      }
      if (node instanceof Element && node.name === "a") {
        const { href, ...rest } = node.attribs;
        return (
          <a
            {...rest}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (href) openUrl(href);
            }}
          >
            {domToReact(node.children as Parameters<typeof domToReact>[0], parseOptions)}
          </a>
        );
      }
    },
  };

  const isDarkTheme = (theme: string) => theme.endsWith('-dark');

  if (isLoadingEntry) {
    return (
      <MainSectionLayout>
        <div className="h-full w-full flex items-center justify-center gap-2 text-sm opacity-80">
          <Spinner size="sm" color="default" />
          {t('loadingEntry')}
        </div>
      </MainSectionLayout>
    );
  }

  return (
    entry && (
      <MainSectionLayout>
        <div className="flex flex-col p-4 mx-auto max-w-prose w-full min-w-0">
          <div className="mx-2 flex justify-between bg-primary-100 border border-primary-500 sticky top-3 z-10 p-1.5 rounded-xl shadow-xl">
            <div className="flex flex-row">
              <EntryActions
                entry={entry}
                setEntry={setEntry}
                backAfterAction={true}
              >
                <Button
                  color="primary"
                  variant="flat"
                  isIconOnly
                  size="sm"
                  onPress={() => history.back()}
                >
                  <RiArrowLeftLine className="text-primary-500" />
                </Button>


              </EntryActions>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content={t('fetchFullContent')}>
                <Button
                  color="primary"
                  variant="flat"
                  isIconOnly
                  size="sm"
                  isLoading={isScrapingEntry}
                  onPress={handleScrapeEntry}
                >
                  {!isScrapingEntry && <RiDownloadCloud2Line className="text-primary-500" />}
                </Button>
              </Tooltip>
              <EntryShare entry={entry} />
            </div>
          </div>
          <div className="mt-10 md:mt-0">
            <InfiniteScroll
              loader={
                <div className="flex justify-center p-6">
                  <Spinner color="default" />
                </div>
              }
              dataLength={1}
              next={() => { }}
              hasMore={false}
              scrollableTarget="mainDiv"
              style={{ overflow: "visible" }}
              pullDownToRefresh
              refreshFunction={handleScrapeEntry}
              pullDownToRefreshThreshold={80}
              pullDownToRefreshContent={
                <div className="flex md:hidden items-center justify-center gap-2 py-3 text-sm text-foreground-500">
                  <RiArrowDownLine size={16} />
                  {t("pullDownToFetchContent")}
                </div>
              }
              releaseToRefreshContent={
                <div className="flex md:hidden items-center justify-center gap-2 py-3 text-sm text-primary">
                  <RiDownloadCloud2Line size={16} />
                  {t("releaseToFetchContent")}
                </div>
              }
            >
              <div className="flex flex-col justify-between w-full">
                <Link
                  to="/feeds/$feedId"
                  params={{ feedId: entry.feed!.id!.toString() }}
                  className="flex gap-2 items-center pt-6"
                >
                  <img
                    alt={entry.feed?.title}
                    className="h-5 w-5 object-cover"
                    src={entry.feed?.icon}
                  />
                  <span className="text-sm line-clamp-1">
                    {entry.feed?.title}
                  </span>
                </Link>
                <div className="flex flex-col py-6">
                  <h1 className="text-xl md:text-3xl font-semibold">
                    {entry.title}
                  </h1>
                </div>

                <ThumbnailOrMedia
                  entry={entry}
                />

              </div>


              <div className={`prose md:prose-lg text-foreground prose-a:text-foreground mx-auto w-full min-w-0 overflow-hidden [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_img]:max-w-full [&_iframe]:max-w-full ${isDarkTheme(currentTheme) ? 'prose-invert' : ''}`}>
                <ErrorBoundary resetKey={`${entry.id}-${entry.content}`} title={t('common:errorContentTitle')}>
                  <p className="py-6 line-clamp-3">
                    {parse(entry.description || "", parseOptions)}
                  </p>
                  <hr />
                  {parse(entry.content || "", parseOptions)}
                </ErrorBoundary>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </MainSectionLayout>
    )
  );
}

export default Entry;
