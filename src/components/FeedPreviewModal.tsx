import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalContent, Spinner } from "@heroui/react";
import EntriesList from "./EntriesList";
import FeedHeader from "./FeedHeader";
import FeedSiteActions from "./FeedSiteActions";
import { useAppContext } from "../AppContext";
import { EntryInterface, FeedInterface } from "../interfaces";

interface FeedPreviewModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onFollowed: (feed: FeedInterface) => void;
}

export default function FeedPreviewModal({ url, isOpen, onClose, onFollowed }: FeedPreviewModalProps) {
  const { t } = useTranslation("discover");
  const { currentAccount } = useAppContext();
  const [feed, setFeed] = useState<FeedInterface | undefined>();
  const [entries, setEntries] = useState<EntryInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !currentAccount?.id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    invoke<string>("preview_feed", { url, accountId: currentAccount.id })
      .then((message) => {
        if (cancelled) return;
        const data = JSON.parse(message);
        setFeed(data.feed);
        setEntries(data.entries);
      })
      .catch((err) => {
        if (!cancelled) setError(typeof err === "string" ? err : t("previewError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, url, currentAccount?.id]);

  const handleFollowed = (saved: FeedInterface) => {
    onFollowed(saved);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalBody className="p-5">
          <div className="flex flex-col w-full max-w-(--breakpoint-md) mx-auto px-4 pb-8">
            {loading && (
              <div className="flex justify-center py-24">
                <Spinner color="primary" />
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center gap-3 py-24 text-center">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-semibold">{t("previewErrorTitle")}</h3>
                <p className="text-sm text-foreground-500 max-w-xs">{error}</p>
              </div>
            )}

            {!loading && !error && feed && (
              <>
                <FeedHeader feed={feed} showDates={false} actions={<FeedSiteActions feed={feed} setFeed={handleFollowed} />} />

                {entries.length > 0 ? (
                  <EntriesList entries={entries} header={false} preview />
                ) : (
                  <p className="py-8 text-center text-foreground-500">{t("previewEmpty")}</p>
                )}
              </>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
