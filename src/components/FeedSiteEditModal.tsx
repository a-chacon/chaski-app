import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch,
  Textarea,

} from "@heroui/react";
import { FeedInterface } from "../interfaces";
import FolderField from "./FolderField";
import { updateFeed } from "../helpers/feedsData";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../NotificationContext";


interface FeedSiteEditModalProps {
  feed: FeedInterface;
  setFeed: (feed: FeedInterface) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FeedSiteEditModal: React.FC<FeedSiteEditModalProps> = ({
  feed,
  setFeed,
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation(['feeds', 'common']);
  const { addNotification } = useNotification();
  const [title, setTitle] = useState(feed.title);
  const [description, setDescription] = useState(feed.description);
  const [entryLimit, setEntryLimit] = useState(feed.entry_limit || 0);
  const [historyLimit, setHistoryLimit] = useState(feed.history_limit || 0);
  const [updateIntervalMinutes, setUpdateIntervalMinutes] = useState(
    feed.update_interval_minutes || 0,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    feed.notifications_enabled == 1,
  );


  const onSave = async () => {
    feed.title = title;
    feed.description = description;
    feed.entry_limit = entryLimit;
    feed.history_limit = historyLimit;
    feed.update_interval_minutes = updateIntervalMinutes;
    feed.notifications_enabled = notificationsEnabled ? 1 : 0;
    feed.default_entry_type = "entry";
    let response = await updateFeed(feed);
    if (response.success) {
      setFeed(response.data);
      addNotification(t('feeds:feedUpdated'), t('feeds:feedUpdatedBody'), 'success');
    } else {
      addNotification(t('feeds:errorUpdating'), response.message, 'warning');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{t('feeds:feedHeader')}</ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label={t('feeds:title')}
                value={title}
                onValueChange={setTitle}
                variant="underlined"
              />
              <Textarea
                label={t('feeds:description')}
                value={description}
                onValueChange={setDescription}
                variant="underlined"
              />
              <FolderField feed={feed}></FolderField>
              <Input
                type="number"
                label={t('feeds:entryLimit')}
                value={entryLimit.toString()}
                onValueChange={(e) => setEntryLimit(parseInt(e))}
                variant="underlined"
              />

              <Input
                type="number"
                label={t('feeds:historyLimit')}
                value={historyLimit.toString()}
                onValueChange={(e) => setHistoryLimit(parseInt(e))}
                variant="underlined"
              />

              <Input
                type="number"
                label={t('feeds:updateMinutesInterval')}
                value={updateIntervalMinutes.toString()}
                onValueChange={(e) => setUpdateIntervalMinutes(parseInt(e))}
                variant="underlined"
              />
              <Switch
                color="primary"
                isSelected={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              >
                {t('feeds:notificationsEnabled')}
              </Switch>

            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onCloseModal}>
                {t('common:close')}
              </Button>

              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  onSave();
                  onCloseModal();
                }}
              >
                {t('common:update')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FeedSiteEditModal;
