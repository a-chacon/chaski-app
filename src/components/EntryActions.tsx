import {
  RiBookmarkLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiExternalLinkLine,
  RiBookmarkFill,
  RiCloseLine
} from "@remixicon/react";
import { EntryInterface } from "../interfaces";
import { Tooltip, Button } from "@heroui/react";
import {
  updateEntryAsRead,
  updateEntryAsUnRead,
  updateEntryReadLater,
  updateEntryNotReadLater,
  updateEntryAsReadAndHide
} from "../helpers/entriesData";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface EntryActionsProps {
  compact?: Boolean;
  entry: EntryInterface;
  setEntry: (entry: EntryInterface) => void;
  className?: String;
  children?: React.ReactNode;
  backAfterAction?: boolean;
}

const EntryActions: React.FC<EntryActionsProps> = ({
  compact = true,
  entry,
  setEntry,
  className,
  children,
  backAfterAction = false,
}) => {
  const { history } = useRouter();

  const [readLater, setReadLater] = useState(entry.read_later);
  const [read, setRead] = useState(entry.read);

  useEffect(() => {
    setReadLater(entry.read_later);
    setRead(entry.read);
  }, [entry]);

  const handleHideEntry = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntryAsReadAndHide(entry);

      if (updatedEntry) {
        setEntry({
          ...entry,
          ...updatedEntry,
        });
      }
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const handleMarkAsRead = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntryAsRead(entry);
      if (updatedEntry) {
        setEntry({
          ...entry,
          ...updatedEntry,
        });
      }
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const handleMarkAsUnread = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntryAsUnRead(entry);
      if (updatedEntry) {
        setEntry({
          ...entry,
          ...updatedEntry,
        });
      }

      if (backAfterAction) {
        history.go(-1);
      }
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const handleMarkReadLater = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntryReadLater(entry);
      if (updatedEntry) {
        setEntry({
          ...entry,
          ...updatedEntry,
        });
      }

      if (backAfterAction) {
        history.go(-1);
      }
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const handleUnMarkReadLater = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntryNotReadLater(entry);
      if (updatedEntry) {
        setEntry({
          ...entry,
          ...updatedEntry,
        });
      }
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const showOptionalOptions = () => {
    if (compact) {
      return (
        <Tooltip content="Hide">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleHideEntry(entry)}
          >
            <RiCloseLine className="w-6" />
          </Button>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip content={"Visit Website: " + entry.link} className="w-80">
          <a
            href={entry.link}
            target="_blank"
          >
            <RiExternalLinkLine className="w-6" />
          </a>
        </Tooltip>
      )
    }
  }

  return (
    <div className={"flex items-center gap-1 " + className}>
      {children}

      {!readLater ? (
        <Tooltip content="Mark for Read Later">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleMarkReadLater(entry)}
          >
            <RiBookmarkLine className="w-6" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Unmark Read Later">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleUnMarkReadLater(entry)}
          >
            <RiBookmarkFill className="w-6" />
          </Button>
        </Tooltip>
      )}

      {read ? (
        <Tooltip content="Mark as unRead">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleMarkAsUnread(entry)}
          >
            <RiCheckDoubleLine className="w-6" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Mark as Read">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleMarkAsRead(entry)}
          >
            <RiCheckLine className="w-6" />
          </Button>
        </Tooltip>
      )}

      {showOptionalOptions()}

    </div>
  );
};

export default EntryActions;
