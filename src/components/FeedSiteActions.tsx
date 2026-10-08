import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, useDisclosure } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import { FeedInterface } from "../interfaces";
import FeedSiteEditModal from "./FeedSiteEditModal";
import FeedSiteFiltersModal from "./FeedSiteFiltersModal";
import FeedFollowModal from "./FeedFollowModal";
import EntryListActionsModal from "./EntryListActionsModal";
import { save } from "@tauri-apps/plugin-dialog";
import { createFeed, exportOPML, destroyFeed } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";
import { useNavigate } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";

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
  const { isMobile } = useAppContext();
  const [isSaved, setIsSaved] = useState<boolean>(!!feed.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editModal = useDisclosure();
  const filtersModal = useDisclosure();
  const followModal = useDisclosure();

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
        followModal.onClose();
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
  };

  if (isSaved) {
    const actions = [
      ...(onMarkAsRead ? [{ key: "markRead", label: t('entries:updateFeedAsRead'), onPress: onMarkAsRead }] : []),
      ...(onRefresh ? [{ key: "refresh", label: t('entries:fetchNewEntries'), onPress: onRefresh }] : []),
      { key: "edit", label: t('feeds:edit'), onPress: editModal.onOpen },
      { key: "filters", label: t('feeds:filters'), onPress: filtersModal.onOpen },
      { key: "export", label: t('feeds:exportAsOpml'), onPress: handleExportFeed },
      { key: "delete", label: t('common:delete'), onPress: handleDeleteFeed, color: "danger" as const },
    ];

    return (
      <div className="flex flex-row items-center gap-2">
        {!isMobile && onRefresh && (
          <Button
            isIconOnly
            variant="light"
            onPress={onRefresh}
            aria-label={t('entries:fetchNewEntries')}
            className="text-foreground-500"
          >
            <RiRefreshLine className="w-5 h-5" />
          </Button>
        )}
        <EntryListActionsModal actions={actions} aria-label="Feed actions" />
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
  }

  return (
    <>
      <Button
        variant="bordered"
        color="warning"
        size="sm"
        onPress={followModal.onOpen}
      >
        {t('feeds:follow')}
      </Button>
      <FeedFollowModal
        feed={feed}
        isOpen={followModal.isOpen}
        isLoading={isLoading}
        onOpenChange={followModal.onOpenChange}
        onSubmit={handleFollowNewFeed}
      />
    </>
  );
};

export default FeedSiteActions;
