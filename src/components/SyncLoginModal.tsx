import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import SyncLoginForm from "./SyncLoginForm";

interface SyncLoginModalProps {
  setSuccessfulLogin: React.Dispatch<React.SetStateAction<boolean>>,
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

const SyncLoginModal: React.FC<SyncLoginModalProps> = ({ setSuccessfulLogin, isOpen, onOpen, onClose, onOpenChange }) => {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Login</ModalHeader>
              <ModalBody>
                <SyncLoginForm
                  setSuccessfulLogin={setSuccessfulLogin}
                ></SyncLoginForm>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default SyncLoginModal;
