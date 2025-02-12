import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@heroui/react";
import LocalForm from "./NewAccountForms/LocalForm";
import { useState } from "react";
import GReaderForm from "./NewAccountForms/GReaderForm";
import { RiArrowGoBackLine } from "@remixicon/react";

interface NewAccountModalInterface {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

type AccountType = 'local' | 'google-reader';

const NewAccountModal: React.FC<NewAccountModalInterface> = ({ isOpen, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);

  const handleAccountTypeSelect = (type: AccountType) => {
    setSelectedAccountType(type);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setSelectedAccountType(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-row items-center">
                {currentStep === 2 &&
                  <Button
                    variant="light"
                    onPress={handleBack}
                    isIconOnly
                  >
                    <RiArrowGoBackLine></RiArrowGoBackLine>
                  </Button>
                }
                <h1 className="pl-2">
                  {currentStep === 1 ? 'Select Account Type' : 'Login'}
                </h1>
              </ModalHeader>
              <ModalBody>
                {currentStep === 1 ? (
                  <div className="flex flex-col gap-4 p-4">
                    <Button
                      variant="faded"
                      color="primary"
                      onPress={() => handleAccountTypeSelect('local')}
                    >
                      Local RSS Account
                    </Button>
                    <Button
                      variant="faded"
                      color="primary"
                      onPress={() => handleAccountTypeSelect('google-reader')}
                    >
                      Google Reader API Account
                    </Button>
                  </div>
                ) : (
                  <>
                    {selectedAccountType === 'google-reader' && (
                      <GReaderForm
                        onClose={onClose}
                      />
                    )}
                    {selectedAccountType === 'local' && (
                      <LocalForm
                        onClose={onClose}
                      />
                    )}
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default NewAccountModal;
