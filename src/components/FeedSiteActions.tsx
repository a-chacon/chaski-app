import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { FeedInterface } from "../interfaces";
import FolderField from "./FolderField";
import { createFeed } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";

interface FeedSiteActionsProps {
  feed: FeedInterface;
  setFeed: (feed: FeedInterface) => void;
}

const FeedSiteActions: React.FC<FeedSiteActionsProps> = ({ feed, setFeed }) => {
  const { t } = useTranslation(['feeds', 'common']);
  const { addNotification } = useNotification();
  const [isSaved, setIsSaved] = useState<boolean>(!!feed.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

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
        setIsOpen(false);
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
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end">
      <PopoverTrigger>
        <Button variant="bordered" color="warning" size="sm">
          {t('feeds:follow')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <form onSubmit={handleFollowNewFeed} className="flex flex-col gap-3 p-3 w-64">
          <FolderField feed={feed} />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="light" onPress={() => setIsOpen(false)}>
              {t('common:cancel')}
            </Button>
            <Button size="sm" color="success" variant="flat" type="submit" isLoading={isLoading}>
              {isLoading ? t('common:adding') : t('common:add')}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default FeedSiteActions;
