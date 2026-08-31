import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { RiMoreLine } from "@remixicon/react";
import { FeedInterface } from "../interfaces";
import FeedSiteEditModal from "./FeedSiteEditModal";
import FeedSiteFiltersModal from "./FeedSiteFiltersModal";
import { useDisclosure } from "@heroui/react";
import FolderField from "./FolderField";
import { save } from "@tauri-apps/plugin-dialog";
import { createFeed, exportOPML, destroyFeed } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";
import { useNavigate } from "@tanstack/react-router";

interface FeedSiteActionsProps {
  feed: FeedInterface;
  setFeed: (feed: FeedInterface) => void;
  onMarkAsRead?: () => void;
  onRefresh?: () => void;
  refreshLoading?: boolean;
}

const FeedSiteActions: React.FC<FeedSiteActionsProps> = ({ feed, setFeed, onMarkAsRead, onRefresh }) => {
  const { t } = useTranslation(['feeds', 'common', 'entries']);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [isSaved, setIsSaved] = useState<boolean>(!!feed.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editModal = useDisclosure();
  const filtersModal = useDisclosure();
  const handleFollowNewFeed = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await createFeed(feed);
      if (response.success) {
        feed.id = response.data.id;
        setFeed(response.data);
        setIsSaved(true);
        addNotification(t('feeds:feedCreated'), response.message, 'success');
      } else {
        addNotification(t('feeds:failedToCreate'), response.message, 'danger');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t('feeds:failedToCreate');
      addNotification(t('feeds:error'), errorMessage, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeed = async () => {
    try {

      const response = await destroyFeed(feed);

      if (response.success) {
        feed.id = undefined;
        setIsSaved(false);
        addNotification(t('feeds:feedDeleted'), response.message, 'success');
        navigate({ to: "/" });
      } else {
        addNotification(t('feeds:failedToDelete'), response.message, 'danger');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t('feeds:failedToDelete');
      addNotification(t('feeds:error'), errorMessage, 'danger');
    }
  };

  const handleExportFeed = async () => {
    const path_to_save = await save({
      filters: [{ name: "Opml", extensions: ["opml"] }],
    });
    if (path_to_save) {
      exportOPML(path_to_save, [feed.id!]);
    }
  }

  if (isSaved) {
    return (
      <div className="flex flex-row items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="light" isIconOnly className="h-full">
              <RiMoreLine className="w-5"></RiMoreLine>
            </Button>
          </DropdownTrigger>
          <DropdownMenu variant="light" aria-label="Feed actions" className="sm:min-w-0 min-w-[200px]">
            {onMarkAsRead ? (
              <DropdownItem key="markRead" onPress={onMarkAsRead}>
                {t('entries:updateFeedAsRead')}
              </DropdownItem>
            ) : null}
            {onRefresh ? (
              <DropdownItem key="refresh" onPress={onRefresh}>
                {t('entries:fetchNewEntries')}
              </DropdownItem>
            ) : null}
            <DropdownItem key="edit" onClick={editModal.onOpen}>
              {t('feeds:edit')}
            </DropdownItem>
            <DropdownItem key="filters" onClick={filtersModal.onOpen}>
              {t('feeds:filters')}
            </DropdownItem>
            <DropdownItem key="filters" onClick={handleExportFeed}>
              {t('feeds:exportAsOpml')}
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              onClick={handleDeleteFeed}
            >
              {t('common:delete')}
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
          <Button variant="bordered" color="warning" size="sm">
            follow
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px}">
          <form onSubmit={handleFollowNewFeed}>
            <div className="mt-2 flex flex-col gap-2 w-full">
              <FolderField feed={feed} />
            </div>
            <div className="flex p-2 justify-end">
              <Button
                variant="bordered"
                color="success"
                size="sm"
                type="submit"
                isLoading={isLoading}
                spinner={
                  <svg
                    className="animate-spin h-4 w-4 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                }
              >
                {isLoading ? t('common:adding') : t('common:add')}
              </Button>
            </div>
          </form>
        </PopoverContent >
      </Popover >
    );
  }
};

export default FeedSiteActions;
