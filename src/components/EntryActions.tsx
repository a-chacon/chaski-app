import {
  RiBookmarkLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiExternalLinkLine,
  RiBookmarkFill,
  RiCloseLine,
  RiEyeLine,
} from "@remixicon/react";
import { EntryInterface } from "../interfaces";
import { Tooltip, Button } from "@heroui/react";
import {
  updateEntryAsRead,
  updateEntryAsUnRead,
  updateEntryReadLater,
  updateEntryNotReadLater,
  updateEntryAsReadAndHide,
  updateEntry,
} from "../helpers/entriesData";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

interface EntryActionsProps {
  entry: EntryInterface;
  setEntry: (entry: EntryInterface) => void;
  className?: String;
  children?: React.ReactNode;
  backAfterAction?: boolean;
}

const EntryActions: React.FC<EntryActionsProps> = ({
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

  const handleUnhideEntry = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntry({
        ...entry,
        hide: 0,
      });

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

  const handleOpenInBrowser = async (entry: EntryInterface) => {
    try {
      const updatedEntry = await updateEntryAsRead(entry);
      if (updatedEntry) {
        setEntry({
          ...entry,
          ...updatedEntry,
        });
      }
    } catch (error) {
      console.error("Failed to mark entry as read before opening browser:", error);
    }

    try {
      await openUrl(entry.link);
    } catch (error) {
      console.error("Failed to open link in browser:", error);
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
    if (entry.hide) {
      return (
        <Tooltip content="Unhide">
          <Button
            color="default"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleUnhideEntry(entry)}
          >
            <RiEyeLine className="w-6" />
          </Button>
        </Tooltip>
      )
    }

    return (
      <Tooltip content="Hide">
        <Button
          color="default"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => handleHideEntry(entry)}
        >
          <RiCloseLine className="w-6" />
        </Button>
      </Tooltip>
    )
  }

  return (
    <div className={"flex items-center gap-1 " + className}>
      {children}

      {!readLater ? (
        <Tooltip content="Mark for Read Later">
          <Button
            color="default"
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
            color="default"
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
            color="default"
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
            color="default"
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

      <Tooltip content={"Visit Website: " + entry.link} className="w-80">
        <Button
          color="default"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => handleOpenInBrowser(entry)}
          aria-label="Open entry in browser"
        >
          <RiExternalLinkLine className="w-6" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default EntryActions;
