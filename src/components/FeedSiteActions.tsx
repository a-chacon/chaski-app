import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, useDisclosure } from "@heroui/react";
import { FeedInterface } from "../interfaces";
import FeedFollowModal from "./FeedFollowModal";
import { createFeed } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";

interface FeedSiteActionsProps {
  feed: FeedInterface;
  setFeed: (feed: FeedInterface) => void;
}

const FeedSiteActions: React.FC<FeedSiteActionsProps> = ({ feed, setFeed }) => {
  const { t } = useTranslation(['feeds']);
  const { addNotification } = useNotification();
  const [isSaved, setIsSaved] = useState<boolean>(!!feed.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  if (isSaved) {
    return null;
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
