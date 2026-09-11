import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import FolderField from "./FolderField";
import { FeedInterface } from "../interfaces";

interface FeedFollowModalProps {
  feed: FeedInterface;
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const FeedFollowModal: React.FC<FeedFollowModalProps> = ({
  feed,
  isOpen,
  isLoading,
  onOpenChange,
  onSubmit,
}) => {
  const { t } = useTranslation(["feeds", "common"]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="sm"
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              {t("feeds:follow")}
            </ModalHeader>
            <ModalBody>
              <FolderField feed={feed} />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t("common:cancel")}
              </Button>
              <Button
                color="success"
                variant="flat"
                type="submit"
                isLoading={isLoading}
              >
                {isLoading ? t("common:adding") : t("common:add")}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FeedFollowModal;
