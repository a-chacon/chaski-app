import { EntryInterface } from "../../../interfaces";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import moment from "moment";
import EntryActions from "../../EntryActions";
import { useAppContext } from "../../../AppContext";
import { updateEntryAsRead } from "../../../helpers/entriesData";

interface EntryCardProps {
  entry: EntryInterface;
  header: boolean;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry: inputEntry }) => {
  const [entry, setEntry] = useState(inputEntry);
  const {
    currentMarkAsReadOnHover,
    entriesLayout: display,
    showHiddenEntries,
  } = useAppContext();

  const isCompact = display === "compact";
  const isGrid = display === "grid";

  const cardRef = useRef<HTMLDivElement>(null);
  const alreadyMarked = useRef(inputEntry.read === 1);
  const entryRef = useRef(entry);
  entryRef.current = entry;

  useEffect(() => {
    if (!currentMarkAsReadOnHover || alreadyMarked.current || entry.read_later === 1) return;

    // Collapses the observable area to a zero-height line at the top of the
    // scroll container. Fires when the card's top edge touches that line —
    // i.e. the card just reached the top of the screen while scrolling.
    const observer = new IntersectionObserver(
      ([obs]) => {
        if (obs.isIntersecting) {
          alreadyMarked.current = true;
          observer.disconnect();
          cardRef.current?.classList.add("opacity-75");
          updateEntryAsRead(entryRef.current);
        }
      },
      {
        root: document.getElementById("mainDiv"),
        rootMargin: "0px 0px -100% 0px",
        threshold: 0,
      }
    );

    const el = cardRef.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [currentMarkAsReadOnHover, entry.read_later]);

  if (isCompact) {
    return (
      <div
        ref={cardRef}
        key={entry.id}
        className={`group px-2 py-2 border-b border-default-200 ${entry.read ? "opacity-75" : ""} ${!showHiddenEntries && entry.hide ? "hidden" : ""}`}
      >
        <div className="flex items-center gap-2">
          {entry.feed && (
            <Link
              to="/feeds/$feedId"
              params={{ feedId: entry.feed.id!.toString() }}
              className="shrink-0 flex items-center gap-2 min-w-0 max-w-[30%]"
            >
              <img
                alt={entry.feed.title}
                className="h-4 w-4 object-cover rounded-sm"
                src={entry.feed.icon}
              />
              <span className="text-xs opacity-80 truncate">{entry.feed.title}</span>
            </Link>
          )}

          <Link
            to="/entries/$entryId"
            params={{ entryId: entry.id?.toString() || "" }}
            className="min-w-0 flex-1"
          >
            <h3 className="text-sm font-medium truncate">
              {entry.title?.trim() || entry.description?.trim() || "Untitled entry"}
            </h3>
          </Link>

          <EntryActions
            className="invisible group-hover:visible shrink-0"
            entry={entry}
            setEntry={setEntry}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      key={entry.id}
      className={`group rounded-xl ${entry.read ? "opacity-75" : ""} ${!showHiddenEntries && entry.hide ? "hidden" : ""}`}
    >
      {entry.feed && (
        <div className="flex justify-between items-center pt-1 mt-1">
          <Link
            to="/feeds/$feedId"
            params={{ feedId: entry.feed.id!.toString() }}
            className="flex gap-2 items-center pb-1"
          >
            <img
              alt={entry.feed.title}
              className="h-5 w-5 object-cover rounded-sm"
              src={entry.feed.icon}
            />
            <span className="text-sm line-clamp-1">{entry.feed.title}</span>
          </Link>

          <EntryActions
            className="invisible group-hover:visible"
            entry={entry}
            setEntry={setEntry}
          />
        </div>
      )}

      <Link
        to="/entries/$entryId"
        params={{ entryId: entry.id?.toString() || "" }}
      >
        <h3 className="text-base md:text-lg line-clamp-2 font-semibold mb-1">
          {entry.title}
        </h3>

        <p className={`opacity-75 text-sm ${isGrid ? "line-clamp-3" : "line-clamp-2"}`}>
          {entry.description || ""}
        </p>
      </Link>

      <div className="flex justify-between items-center pt-1 mt-1">
        <p className="leading-6 text-sm opacity-80">
          {moment.utc(entry.pub_date).fromNow()}
        </p>
      </div>
    </div>
  );
};

export default EntryCard;
