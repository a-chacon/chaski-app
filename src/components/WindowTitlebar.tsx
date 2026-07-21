import React, { useState } from "react";
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
import { RiAddCircleLine, RiAddLine, RiCheckLine, RiCloseLine, RiSidebarFoldLine, RiSidebarUnfoldLine, RiUserLine, RiSquareLine, RiSubtractLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import NewAccountModal from "./NewAccountModal";
import { AccountInterface } from "../interfaces";
import { deleteAccount } from "../helpers/accountsData";
import SearchModal from "./SearchModal";
import UserMenu from "./UserMenu";

const appWindow = getCurrentWindow();

const WindowTitlebar: React.FC = () => {
  const newAccountModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [accountToDelete, setAccountToDelete] = useState<AccountInterface | null>(null);

  const {
    accounts,
    setAccounts,
    currentAccount,
    setCurrentAccount,
    sideBarOpen,
    setSideBarOpen,
  } = useAppContext();

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
        <Tooltip content={sideBarOpen ? "Collapse sidebar" : "Expand sidebar"} delay={300}>
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            aria-label={sideBarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onPress={() => setSideBarOpen((prev) => !prev)}
          >
            {sideBarOpen ? <RiSidebarFoldLine /> : <RiSidebarUnfoldLine />}
          </Button>
        </Tooltip>
        <Tooltip content="Application menu" delay={300}>
          <div>
            <UserMenu />
          </div>
        </Tooltip>

        <Tooltip content="Search feeds and entries" delay={300}>
          <div>
            <SearchModal />
          </div>
        </Tooltip>

        <Tooltip content="Add new feed" delay={300}>
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            aria-label="Add new feed"
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
              <Tooltip content={currentAccount ? `Current account: ${currentAccount.name}` : "No account selected"} delay={300}>
                <span className="text-xs text-foreground-500 max-w-40 truncate px-1">{currentAccount?.name || "No account"}</span>
              </Tooltip>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="w-64 py-2">
              <div className="px-2 pb-2 border-b border-default-200">
                <Button size="sm" variant="flat" color="primary" className="w-full" onPress={newAccountModal.onOpen}>
                  <RiAddLine />
                  Add account
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
                      className="flex items-center gap-2 text-sm text-left flex-1"
                      onClick={() => setCurrentAccount(account)}
                    >
                      {currentAccount?.id === account.id ? (
                        <RiCheckLine className="text-success" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span className="truncate">{account.name}</span>
                    </button>

                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      onPress={() => openDeleteModal(account)}
                    >
                      <RiCloseLine />
                    </Button>
                  </div>
                ))}

                {accounts.length === 0 && (
                  <p className="px-3 py-2 text-sm text-foreground-500">No accounts yet.</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>


        <Button
          color="primary"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => appWindow.minimize()}
        >
          <RiSubtractLine />
        </Button>
        <Button
          color="primary"
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
          className={`hover:bg-danger/20 hover:text-danger`}
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

      <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete account</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete <strong>{accountToDelete?.name}</strong>?</p>
                <p className="text-danger">This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button color="danger" onPress={handleDeleteAccount}>Delete</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WindowTitlebar;
