import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { renameFolder, deleteFolder } from "../helpers/foldersData";
import { useNotification } from "../NotificationContext";


interface FolderActionsProps {
  accountId: number;
  folder: string;
  renameOpen: boolean;
  onRenameOpenChange: (open: boolean) => void;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onRenamed: (newName: string) => void;
  onDeleted: () => void;
}

const FolderActions: React.FC<FolderActionsProps> = ({
  accountId,
  folder,
  renameOpen,
  onRenameOpenChange,
  deleteOpen,
  onDeleteOpenChange,
  onRenamed,
  onDeleted,
}) => {
  const { t } = useTranslation(['accounts', 'common']);
  const { addNotification } = useNotification();
  const [newName, setNewName] = useState<string>(folder);

  useEffect(() => {
    if (renameOpen) setNewName(folder);
  }, [renameOpen, folder]);

  async function handleRenameFolder() {
    try {
      const response = await renameFolder(accountId, folder, newName);
      if (response.success) {
        onRenameOpenChange(false);
        addNotification(t('accounts:folderUpdated'), t('accounts:folderUpdatedBody'), 'success');
        onRenamed(newName);
      } else {
        addNotification(t('accounts:folderUpdateError'), response.message, 'danger');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addNotification("Error", errorMessage, 'danger');
    }
  }

  async function handleDeleteFolder() {
    try {
      const response = await deleteFolder(accountId, folder);
      if (response.success) {
        addNotification(t('accounts:folderDeleted'), response.message, 'success');
        onDeleteOpenChange(false);
        onDeleted();
      } else {
        addNotification("Error", response.message, 'danger');
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addNotification("Error", errorMessage, 'danger');
    }
  }

  return (
    <>
      <Modal isOpen={renameOpen} onOpenChange={onRenameOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t('accounts:renameFolderTitle', { folder })}</ModalHeader>
              <ModalBody>
                <Input label={t('accounts:newName')} type="text" variant="underlined" value={newName} onValueChange={setNewName} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t('common:close')}
                </Button>
                <Button color="primary" variant="flat" onPress={handleRenameFolder}>
                  {t('common:save')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t('accounts:deleteFolderTitle', { folder })}</ModalHeader>
              <ModalBody>
                <h2 className="font-semibold text-danger-500">{t('accounts:deleteFolderConfirm')}</h2>
                <p>{t('accounts:deleteFolderWarning')}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  {t('common:close')}
                </Button>
                <Button color="danger" variant="flat" onPress={handleDeleteFolder}>
                  {t('common:delete')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FolderActions;
