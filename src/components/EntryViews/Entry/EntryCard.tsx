import { EntryInterface } from "../../../interfaces";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import moment from "moment";
import EntryActions from "../../EntryActions";
import { useAppContext } from "../../../AppContext";
import { updateEntryAsRead } from "../../../helpers/entriesData";

interface EntryCardProps {
  entry: EntryInterface;
  header: boolean;
}

const EntryCard: React.FC<EntryCardProps> = ({
  entry: inputEntry,
}) => {
  const [entry, setEntry] = useState(inputEntry);
  const [isHovering, setIsHovering] = useState(false);
  const { currentMarkAsReadOnHover, entriesLayout: display } = useAppContext();

  const isCompact = display === "compact";
  const isGrid = display === "grid";

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);

    if (currentMarkAsReadOnHover && entry.read === 0 && entry.read_later !== 1) {
      updateEntryAsRead(entry);
    }
  };

  if (isCompact) {
    return (
      <div
        key={entry.id}
        className={`px-2 py-2 border-b border-default-200 ${entry.read ? "opacity-75" : ""} ${entry.hide ? "hidden" : ""}`}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
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
            className={`${isHovering ? "visible" : "invisible"} shrink-0`}
            entry={entry}
            setEntry={setEntry}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      key={entry.id}
      className={`rounded-xl ${entry.read ? "opacity-75" : ""} ${entry.hide ? "hidden" : ""}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
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
            className={`${isHovering ? "visible" : "invisible"}`}
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
