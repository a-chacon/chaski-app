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
import { renameFolder, deleteFolder } from "../helpers/foldersData";
import { useNotification } from "../NotificationContext";

interface FolderActionsProps {
  folder: string;
  setFolder: (folder: string) => void;
  reloadSideBar: () => void;
}

const FolderActions: React.FC<FolderActionsProps> = ({ folder, setFolder, reloadSideBar }) => {
  const { addNotification } = useNotification();
  const renameModalDisclosure = useDisclosure()
  const deleteModalDisclosure = useDisclosure()
  const [newName, setNewName] = useState<string>(folder);

  function handleRenameFolder() {
    renameFolder(folder, newName);
    setFolder(newName);
    addNotification("Folder Updated", 'The folder was renamed successfully!', 'success');
  }

  function handleDeleteFolder() {
    deleteFolder(folder).then((isDeleted) => {
      if (isDeleted) {
        addNotification("Folder Deleted", 'The folder was deleted successfully!', 'success');
        deleteModalDisclosure.onClose();
        reloadSideBar();
      } else {
        addNotification("Error", 'There was an issue deleting the folder.', 'danger');
      }
    }).catch((error) => {
      console.error("Error deleting folder:", error);
      addNotification("Error", 'An unexpected error occurred.', 'danger');
    });
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
                <ModalHeader className="flex flex-col gap-1">Rename {folder}</ModalHeader>
                <ModalBody>
                  <Input label="New name" type="text" variant="underlined" value={newName} onValueChange={setNewName} />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" variant="flat" onPress={handleRenameFolder}>
                    Save
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
                <ModalHeader className="flex flex-col gap-1">Delete {folder}</ModalHeader>
                <ModalBody>
                  <h2 className="font-semibold text-danger-500">Are you sure you want to delete this folder?</h2>
                  <p>This will delete all the included feeds in the folder!</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="danger" variant="flat" onPress={handleDeleteFolder}>
                    Delete
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
          <Button size="sm" variant="light" isIconOnly className="h-full">
            <RiMore2Line className="w-5"></RiMore2Line>
          </Button>
        </DropdownTrigger>
        <DropdownMenu variant="light" aria-label="Folder Options" >
          <DropdownItem key="rename" onClick={renameModalDisclosure.onOpen}>
            Rename
          </DropdownItem>
          <DropdownItem key="delete" onClick={deleteModalDisclosure.onOpen} className="text-danger" color="danger">
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {renameModal()}
      {deleteModal()}
    </>
  );

}

export default FolderActions;
