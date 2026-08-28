import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { RiAddCircleLine, RiAddLine, RiCheckLine, RiCloseLine, RiEditLine, RiRefreshLine, RiSidebarFoldLine, RiSidebarUnfoldLine, RiUserLine, RiSquareLine, RiSubtractLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import NewAccountModal from "./NewAccountModal";
import { AccountInterface } from "../interfaces";
import { deleteAccount, fullSync } from "../helpers/accountsData";
import SearchModal from "./SearchModal";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";
import { listen } from "@tauri-apps/api/event";
import EditAccountModal from "./EditAccountModal";
import { useNotification } from "../NotificationContext";

const appWindow = getCurrentWindow();

const WindowTitlebar: React.FC = () => {
  const newAccountModal = useDisclosure();
  const deleteModal = useDisclosure();
  const editAccountModal = useDisclosure();
  const [accountToDelete, setAccountToDelete] = useState<AccountInterface | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<AccountInterface | null>(null);
  const [syncingAccountId, setSyncingAccountId] = useState<number | null>(null);
  const { t } = useTranslation(["titlebar", "common"]);
  const { addNotification } = useNotification();

  const {
    accounts,
    setAccounts,
    currentAccount,
    setCurrentAccount,
    sideBarOpen,
    setSideBarOpen,
  } = useAppContext();

  const openEditModal = (account: AccountInterface) => {
    setAccountToEdit(account);
    editAccountModal.onOpen();
  };

  const handleSyncAccount = async (account: AccountInterface) => {
    if (!account.id) return;
    setSyncingAccountId(account.id);
    try {
      await fullSync(account.id);
      addNotification(t("titlebar:syncSuccess"), t("titlebar:syncSuccessBody", { name: account.name }), "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      addNotification(t("titlebar:syncError"), msg, "danger");
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleAccountUpdated = (updated: AccountInterface) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (currentAccount?.id === updated.id) {
      setCurrentAccount(updated);
    }
  };

  useEffect(() => {
    const unlisten = listen<{ accountId: number; accountName: string; error: string }>(
      "account://sync-error",
      (event) => {
        addNotification(
          t("titlebar:syncError"),
          t("titlebar:syncErrorBody", { name: event.payload.accountName, error: event.payload.error }),
          "danger",
          10000
        );
      }
    );
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const openDeleteModal = (account: AccountInterface) => {
    setAccountToDelete(account);
    deleteModal.onOpen();
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete?.id) {
      return;
    }

    await deleteAccount(accountToDelete.id);

    setAccounts((prevAccounts) => prevAccounts.filter((account) => account.id !== accountToDelete.id));

    if (currentAccount?.id === accountToDelete.id) {
      setCurrentAccount(null);
    }

    deleteModal.onClose();
    setAccountToDelete(null);
  };

  return (
    <div className="h-10 border-b border-default-200/70 bg-background/90 backdrop-blur px-1.5 flex items-center select-none">
      <div className="flex items-center gap-1 text-primary-500">
        <Tooltip content={sideBarOpen ? t("titlebar:collapseSidebar") : t("titlebar:expandSidebar")} delay={300}>
          <Button
            color="default"
            variant="light"
            isIconOnly
            size="sm"
            aria-label={sideBarOpen ? t("titlebar:collapseSidebar") : t("titlebar:expandSidebar")}
            onPress={() => setSideBarOpen((prev) => !prev)}
          >
            {sideBarOpen ? <RiSidebarFoldLine /> : <RiSidebarUnfoldLine />}
          </Button>
        </Tooltip>
        <Tooltip content={t("titlebar:applicationMenu")} delay={300}>
          <div>
            <UserMenu />
          </div>
        </Tooltip>

        <Tooltip content={t("titlebar:searchFeedsAndEntries")} delay={300}>
          <div>
            <SearchModal />
          </div>
        </Tooltip>

        <Tooltip content={t("titlebar:addNewFeed")} delay={300}>
          <Button
            color="default"
            variant="light"
            isIconOnly
            size="sm"
            aria-label={t("titlebar:addNewFeed")}
          >
            <Link
              to="/new_feed"
              activeProps={{
                className: "text-primary-500",
              }}
            >
              <RiAddCircleLine />
            </Link>
          </Button>
        </Tooltip>
      </div>

      <div
        data-tauri-drag-region
        className="flex-1 h-full"
      />

      <div className="flex items-center gap-1 text-primary-500">
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button
              variant="light"
              size="sm"
              aria-label="Accounts"
            >
              <RiUserLine size={18} />
              <Tooltip content={currentAccount ? t("titlebar:currentAccount", { name: currentAccount.name }) : t("titlebar:noAccountSelected")} delay={300}>
                <span className="text-xs text-foreground-500 max-w-40 truncate px-1">{currentAccount?.name || t("titlebar:noAccount")}</span>
              </Tooltip>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="w-64 py-2">
              <div className="px-2 pb-2 border-b border-default-200">
                <Button size="sm" variant="flat" color="primary" className="w-full" onPress={newAccountModal.onOpen}>
                  <RiAddLine />
                  {t("titlebar:addAccount")}
                </Button>
              </div>

              <div className="max-h-60 overflow-auto py-1">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="px-2 py-1 flex items-center justify-between gap-2 hover:bg-default-100 rounded-md"
                  >
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm text-left flex-1 min-w-0"
                      onClick={() => setCurrentAccount(account)}
                    >
                      {currentAccount?.id === account.id ? (
                        <RiCheckLine className="text-success shrink-0" />
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                      <span className="truncate">{account.name}</span>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {account.kind === "greaderapi" && (
                        <>
                          <Tooltip content={t("titlebar:syncNow")} delay={300}>
                            <Button
                              size="sm"
                              variant="light"
                              color="primary"
                              isIconOnly
                              isLoading={syncingAccountId === account.id}
                              onPress={() => handleSyncAccount(account)}
                            >
                              <RiRefreshLine />
                            </Button>
                          </Tooltip>
                          <Tooltip content={t("titlebar:editAccount")} delay={300}>
                            <Button
                              size="sm"
                              variant="light"
                              color="default"
                              isIconOnly
                              onPress={() => openEditModal(account)}
                            >
                              <RiEditLine />
                            </Button>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip content={t("titlebar:deleteAccount")} delay={300}>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => openDeleteModal(account)}
                        >
                          <RiCloseLine />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                ))}

                {accounts.length === 0 && (
                  <p className="px-3 py-2 text-sm text-foreground-500">{t("titlebar:noAccountsYet")}</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>


        <Button
          color="default"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => appWindow.minimize()}
        >
          <RiSubtractLine />
        </Button>
        <Button
          color="default"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => appWindow.toggleMaximize()}
        >
          <RiSquareLine />
        </Button>
        <Button
          color="primary"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => appWindow.close()}
        >
          <RiCloseLine />
        </Button>
      </div>

      <NewAccountModal
        isOpen={newAccountModal.isOpen}
        onOpen={newAccountModal.onOpen}
        onClose={newAccountModal.onClose}
        onOpenChange={newAccountModal.onOpenChange}
      />

      {accountToEdit && accountToEdit.kind === "greaderapi" && (
        <EditAccountModal
          account={accountToEdit}
          isOpen={editAccountModal.isOpen}
          onOpenChange={editAccountModal.onOpenChange}
          onUpdate={handleAccountUpdated}
        />
      )}

      <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t("titlebar:deleteAccount")}</ModalHeader>
              <ModalBody>
                <p>{t("titlebar:deleteAccountConfirm", { name: accountToDelete?.name })}</p>
                <p className="text-danger">{t("titlebar:thisActionCannotBeUndone")}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>{t("common:cancel")}</Button>
                <Button color="danger" onPress={handleDeleteAccount}>{t("common:delete")}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WindowTitlebar;
