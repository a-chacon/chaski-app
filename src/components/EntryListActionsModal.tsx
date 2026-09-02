import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import { RiSettings3Line } from "@remixicon/react";
import { useTranslation } from "react-i18next";

export interface EntryListAction {
  key: string;
  label: string;
  onPress: () => void;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

interface EntryListActionsModalProps {
  actions: EntryListAction[];
  "aria-label"?: string;
}

const EntryListActionsModal: React.FC<EntryListActionsModalProps> = ({
  actions,
  "aria-label": ariaLabel = "Entry list actions",
}) => {
  const { t } = useTranslation("common");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        isIconOnly
        variant="light"
        onPress={onOpen}
        aria-label={ariaLabel}
        className="text-foreground-500"
      >
        <RiSettings3Line className="w-5 h-5" />
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="sm"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody className="py-4 px-3 gap-2">
              {actions.map((action) => (
                <Button
                  key={action.key}
                  variant="light"
                  color={action.color ?? "default"}
                  className="justify-start text-base h-12"
                  fullWidth
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                >
                  {action.label}
                </Button>
              ))}
              <Button
                variant="flat"
                fullWidth
                className="h-12 mt-1"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EntryListActionsModal;
