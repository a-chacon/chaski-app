import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Form,
  Input,
} from "@heroui/react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { AccountInterface } from "../interfaces";
import { updateAccount } from "../helpers/accountsData";
import { useNotification } from "../NotificationContext";
import { useTranslation } from "react-i18next";

interface EditAccountModalProps {
  account: AccountInterface;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: AccountInterface) => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  isOpen,
  onOpenChange,
  onUpdate,
}) => {
  const { t } = useTranslation(["accounts", "common"]);
  const { addNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const credentials = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    let serverUrl = formData.get("server") as string;
    if (!/^https?:\/\//i.test(serverUrl)) {
      serverUrl = `http://${serverUrl}`;
    }

    try {
      const updated = await updateAccount(account.id!, {
        credentials: JSON.stringify(credentials),
        server_url: serverUrl,
      });
      addNotification(
        t("accounts:accountUpdated"),
        t("accounts:accountUpdatedBody"),
        "success"
      );
      onUpdate(updated);
      onOpenChange(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingUsername =
    typeof account.credentials === "object"
      ? account.credentials?.username ?? ""
      : "";

  const existingServer = account.server_url ?? "";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>{t("accounts:editAccount")}</ModalHeader>
            <ModalBody>
              <Form
                className="w-full flex flex-col gap-4 py-4"
                validationBehavior="native"
                onSubmit={onSubmit}
              >
                <Input
                  isRequired
                  label={t("accounts:serverUrl")}
                  labelPlacement="outside"
                  name="server"
                  placeholder={t("accounts:serverUrlPlaceholder")}
                  defaultValue={existingServer}
                  type="url"
                  errorMessage={t("accounts:serverUrlError")}
                />

                <Input
                  isRequired
                  label={t("accounts:username")}
                  labelPlacement="outside"
                  name="username"
                  placeholder={t("accounts:usernamePlaceholder")}
                  defaultValue={existingUsername}
                  type="text"
                  errorMessage={t("accounts:usernameError")}
                />

                <Input
                  isRequired
                  label={t("accounts:password")}
                  labelPlacement="outside"
                  name="password"
                  placeholder={t("accounts:passwordPlaceholder")}
                  type={isPasswordVisible ? "text" : "password"}
                  errorMessage={t("accounts:passwordError")}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      aria-label={
                        isPasswordVisible
                          ? t("accounts:hidePassword")
                          : t("accounts:showPassword")
                      }
                    >
                      {isPasswordVisible ? <RiEyeLine /> : <RiEyeOffLine />}
                    </button>
                  }
                />

                {errorMessage && (
                  <div className="text-danger text-sm">{errorMessage}</div>
                )}

                <div className="flex w-full justify-end gap-2 pb-2">
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("accounts:loggingIn") : t("common:update")}
                  </Button>
                </div>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditAccountModal;
