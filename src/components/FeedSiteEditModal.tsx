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
} from "@nextui-org/react";
import { FeedInterface } from "../interfaces";
import FolderField from "./FolderField";
import { updateFeed } from "../helpers/feedsData";
import { useState } from "react";
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
    let response = await updateFeed(feed);
    addNotification("Feed Updated", 'The feed was updated successfully!', 'success');
    setFeed(response);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="bg-default-950"
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Feed</ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Title"
                value={title}
                onValueChange={setTitle}
                variant="underlined"
              />
              <Textarea
                label="Description"
                value={description}
                onValueChange={setDescription}
                variant="underlined"
              />
              <FolderField feed={feed}></FolderField>
              <Input
                type="number"
                label="Entry Limit"
                value={entryLimit.toString()}
                onValueChange={(e) => setEntryLimit(parseInt(e))}
                variant="underlined"
              />

              <Input
                type="number"
                label="History Limit"
                value={historyLimit.toString()}
                onValueChange={(e) => setHistoryLimit(parseInt(e))}
                variant="underlined"
              />

              <Input
                type="number"
                label="Update Minutes Interval"
                value={updateIntervalMinutes.toString()}
                onValueChange={(e) => setUpdateIntervalMinutes(parseInt(e))}
                variant="underlined"
              />
              <Switch
                color="secondary"
                isSelected={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              >
                Notifications Enabled
              </Switch>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onCloseModal}>
                Close
              </Button>

              <Button
                color="success"
                variant="flat"
                onPress={() => {
                  onSave();
                  onCloseModal(); // Call your second function here
                }}
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FeedSiteEditModal;
