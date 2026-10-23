import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useDisclosure } from "@heroui/react";
import { RiDeleteBinLine, RiEditLine, RiFilterLine } from "@remixicon/react";
import { FeedInterface } from "../interfaces";
import FeedSiteEditModal from "./FeedSiteEditModal";
import FeedSiteFiltersModal from "./FeedSiteFiltersModal";
import EntryListToolbar from "./EntryListToolbar";
import { destroyFeed } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";
import { useAppContext } from "../AppContext";

interface FeedPageActionsProps {
  feed: FeedInterface;
  setFeed: (feed: FeedInterface) => void;
  onMarkAsRead: () => void;
  onRefresh: () => void;
  refreshLoading?: boolean;
}

const FeedPageActions: React.FC<FeedPageActionsProps> = ({
  feed,
  setFeed,
  onMarkAsRead,
  onRefresh,
  refreshLoading,
}) => {
  const { t } = useTranslation(["feeds", "entries"]);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { currentAccount } = useAppContext();
  const filtersSupported = currentAccount?.kind !== "greaderapi";
  const editModal = useDisclosure();
  const filtersModal = useDisclosure();

  const handleDeleteFeed = async () => {
    try {
      const response = await destroyFeed(feed);
      if (response.success) {
        addNotification(t("feeds:feedDeleted"), response.message, "success");
        navigate({ to: "/" });
      } else {
        addNotification(t("feeds:failedToDelete"), response.message, "danger");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t("feeds:failedToDelete");
      addNotification(t("feeds:error"), errorMessage, "danger");
    }
  };

  return (
    <>
      <EntryListToolbar
        onReload={onRefresh}
        reloadLoading={refreshLoading}
        onMarkAllAsRead={onMarkAsRead}
        extraActions={[
          { key: "edit", label: t("entries:editFeed"), icon: <RiEditLine className="w-4 h-4" />, onPress: editModal.onOpen },
          ...(filtersSupported
            ? [{ key: "filters", label: t("entries:feedFilters"), icon: <RiFilterLine className="w-4 h-4" />, onPress: filtersModal.onOpen }]
            : []),
          { key: "delete", label: t("entries:removeFeed"), icon: <RiDeleteBinLine className="w-4 h-4" />, color: "danger", onPress: handleDeleteFeed },
        ]}
      />
      <FeedSiteEditModal
        key={"edit-modal-" + feed.id}
        feed={feed}
        setFeed={setFeed}
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
      />
      <FeedSiteFiltersModal
        key={"filters-" + feed.id}
        feed={feed}
        isOpen={filtersModal.isOpen}
        onOpenChange={filtersModal.onOpenChange}
      />
    </>
  );
};

export default FeedPageActions;
