import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  Button,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@heroui/react";
import { RiMore2Line } from "@remixicon/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { renameFolder, deleteFolder } from "../helpers/foldersData";
import { useNotification } from "../NotificationContext";
import { AccountInterface } from "../interfaces";


interface FolderActionsProps {
  account: AccountInterface;
  folder: string;
  setFolder: (folder: string) => void;
}

const FolderActions: React.FC<FolderActionsProps> = ({ account, folder, setFolder }) => {
  const { t } = useTranslation(['accounts', 'common']);
  const { addNotification } = useNotification();
  const renameModalDisclosure = useDisclosure()
  const deleteModalDisclosure = useDisclosure()
  const [newName, setNewName] = useState<string>(folder);

  async function handleRenameFolder() {
    const response = await renameFolder(account.id!, folder, newName);
    if (response.success) {
      setFolder(newName);
      renameModalDisclosure.onClose();
      addNotification(t('accounts:folderUpdated'), t('accounts:folderUpdatedBody'), 'success');
    } else {
      addNotification(t('accounts:folderUpdateError'), response.message, 'danger');
    }
  }

  async function handleDeleteFolder() {
    try {
      const response = await deleteFolder(account.id!, folder);
      if (response.success) {
        addNotification(t('accounts:folderDeleted'), response.message, 'success');
        deleteModalDisclosure.onClose();
      } else {
        addNotification("Error", response.message, 'danger');
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addNotification("Error", errorMessage, 'danger');
    }
  }

  function renameModal() {
    return (
      <>
        <Modal key={"renamefoldermodal" + folder}
          isOpen={renameModalDisclosure.isOpen}
          onOpenChange={renameModalDisclosure.onOpenChange}
        >
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
      </>
    );
  }


  function deleteModal() {
    return (
      <>
        <Modal key={"deletefoldermodal" + folder}
          isOpen={deleteModalDisclosure.isOpen}
          onOpenChange={deleteModalDisclosure.onOpenChange}
        >
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
  }
  return (
    <>
      <Dropdown >
        <DropdownTrigger>
          <Button size="sm" variant="light" isIconOnly className="rounded-md">
            <RiMore2Line className="w-5"></RiMore2Line>
          </Button>
        </DropdownTrigger>
        <DropdownMenu variant="light" aria-label="Folder Options" >
          <DropdownItem key="rename" onPress={renameModalDisclosure.onOpen}>
            {t('common:rename')}
          </DropdownItem>
          <DropdownItem key="delete" onPress={deleteModalDisclosure.onOpen} className="text-danger" color="danger">
            {t('common:delete')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {renameModal()}
      {deleteModal()}
    </>
  );

}

export default FolderActions;
