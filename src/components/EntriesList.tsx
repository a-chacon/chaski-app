import { Spinner } from "@heroui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { EntryInterface } from "../interfaces";
import EntryCard from "./EntryViews/Entry/EntryCard";
import { useAppContext } from "../AppContext";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface EntriesListProps {
  entries: EntryInterface[];
  fetchEntries: () => Promise<void>;
  hasMore: boolean;
  header: boolean;
}

interface EndMessageProps {
  display: string;
}

const EndMessage = React.memo(({ display }: EndMessageProps) => {
  const { t } = useTranslation("entries");

  return (
    <div className={`${display === "grid" ? "col-span-full" : ""} mx-auto`}>
      <div className="p-6 text-center">
        <h5 className="text-2xl font-semibold pb-2">{t("endTitle")}</h5>
        <p>{t("endSubtitle")}</p>
      </div>
    </div>
  );
});

function EntriesList({
  entries,
  fetchEntries,
  hasMore,
  header,
}: EntriesListProps) {
  const { entriesLayout: display } = useAppContext();

  const listClass = useMemo(() => {
    if (display === "grid") {
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";
    }

    if (display === "compact") {
      return "flex flex-col";
    }

    return "flex flex-col gap-4";
  }, [display]);

  return (
    <div key="entries">
      <InfiniteScroll
        dataLength={entries.length}
        next={fetchEntries}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center p-6">
            <Spinner color="default" />
          </div>
        }
        scrollableTarget="mainDiv"
        endMessage={<EndMessage display={display} />}
        className={listClass}
      >
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            header={header}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}

export default EntriesList;
