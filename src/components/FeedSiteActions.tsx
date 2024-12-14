import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { RiMoreLine } from "@remixicon/react";
import { FeedInterface } from "../interfaces";
import FeedSiteEditModal from "./FeedSiteEditModal";
import FeedSiteFiltersModal from "./FeedSiteFiltersModal";
import { useDisclosure } from "@nextui-org/react";
import FolderField from "./FolderField";
import { save } from "@tauri-apps/plugin-dialog";
import { exportOPML } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";

interface FeedSiteActionsProps {
  feed: FeedInterface;
  setFeed: (feed: FeedInterface) => void;
}

const FeedSiteActions: React.FC<FeedSiteActionsProps> = ({ feed, setFeed }) => {
  const { addNotification } = useNotification();
  const [isSaved, setIsSaved] = useState<boolean>(!!feed.id);
  const editModal = useDisclosure();
  const filtersModal = useDisclosure();

  const handleFollowNewFeed = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      const message = await invoke<string>("create_feed", {
        newFeed: feed,
      });

      const feed_saved: FeedInterface = JSON.parse(message);
      feed.id = feed_saved.id;

      setFeed(feed_saved);
      setIsSaved(true);

      addNotification("Feed Created", 'The feed was created successfully!', 'success');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteFeed = async () => {
    try {
      await invoke<string>("destroy_feed", {
        feedId: feed.id,
      });

      feed.id = undefined;
      setIsSaved(false);
      window.location.replace("/today");
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportFeed = async () => {

    const path_to_save = await save({
      filters: [{ name: "Opml", extensions: ["opml"] }],
    });
    if (path_to_save) {
      exportOPML(path_to_save, [feed.id || ""]);
    }

  }

  if (isSaved) {
    return (
      <div className="flex flex-row items-center gap-2">
        <Dropdown className="bg-default-800">
          <DropdownTrigger>
            <Button size="sm" variant="light" isIconOnly className="h-full">
              <RiMoreLine className="w-5"></RiMoreLine>
            </Button>
          </DropdownTrigger>
          <DropdownMenu variant="light" aria-label="Static Actions">
            <DropdownItem key="edit" onClick={editModal.onOpen}>
              Edit
            </DropdownItem>
            <DropdownItem key="filters" onClick={filtersModal.onOpen}>
              Filters
            </DropdownItem>
            <DropdownItem key="filters" onClick={handleExportFeed}>
              Export as opml
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              onClick={handleDeleteFeed}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <FeedSiteEditModal
          key={"edit-modal-" + feed.id}
          feed={feed}
          setFeed={setFeed}
          isOpen={editModal.isOpen}
          onOpenChange={editModal.onOpenChange}
        />

        <FeedSiteFiltersModal
          key={"filters-" + feed.id}
          feed={feed}
          isOpen={filtersModal.isOpen}
          onOpenChange={filtersModal.onOpenChange}
        />
      </div>
    );
  } else {
    return (
      <Popover placement="bottom" showArrow offset={10}>
        <PopoverTrigger>
          <Button className="animate-bounce" variant="bordered" color="warning" size="sm">
            follow
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px} bg-default-800 border border-default-600">
          <form onSubmit={handleFollowNewFeed}>
            <div className="px-1 py-2 w-full">
              <div className="flex justify-between items-center">
                <p className="text-small font-bold text-foreground">
                  Select a folder
                </p>
                <Button
                  variant="bordered"
                  color="success"
                  size="sm"
                  type="submit" // Set button type to submit
                >
                  add
                </Button>
              </div>
              <div className="mt-2 flex flex-col gap-2 w-full">
                <FolderField feed={feed} />
              </div>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    );
  }
};

export default FeedSiteActions;
