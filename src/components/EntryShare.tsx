import {
  RiFacebookBoxFill,
  RiTwitterXLine,
  RiMastodonFill,
  RiRedditLine,
  RiLinkedinBoxFill,
  RiLinkUnlink,
} from "@remixicon/react";
import { EntryInterface } from "../interfaces";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Tooltip,
} from "@heroui/react";
import { useState } from "react";
import { useNotification } from "../NotificationContext";
import { useTranslation } from "react-i18next";

interface EntryShareProps {
  entry: EntryInterface;
  className?: string;
}

const EntryShare: React.FC<EntryShareProps> = ({
  entry,
  className,
}) => {
  const { t } = useTranslation(["share", "common"]);
  const { addNotification } = useNotification();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { title, link, description } = entry;
  const [mastodonUrl, setMastodonUrl] = useState("");

  // Encode the title, description, and link for use in URLs
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedLink = encodeURIComponent(link);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedLink}&via=YourTwitterHandle`;
  const mastodonShareUrl = `/share?text=${encodedDescription}%20${encodedLink}`;
  const redditShareUrl = `https://www.reddit.com/submit?title=${encodedTitle}&url=${encodedLink}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        console.log("Copied");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });

    addNotification(t("share:copiedTitle"), t("share:copiedBody"), "primary");
  };

  const handleMastodonShare = () => {
    window.open(mastodonUrl + mastodonShareUrl, "_blank");
    onOpenChange();
  };

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <button onClick={onOpen}>
        <RiMastodonFill className="w-6" />
      </button>
      <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
        <RiFacebookBoxFill className="w-6" />
      </a>
      <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
        <RiTwitterXLine className="w-6" />
      </a>
      <a href={redditShareUrl} target="_blank" rel="noopener noreferrer">
        <RiRedditLine className="w-6" />
      </a>
      <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
        <RiLinkedinBoxFill className="w-6" />
      </a>
      <Tooltip content={t("share:copyToClipboard")}>
        <button onClick={copyLinkToClipboard} className="flex items-center">
          <RiLinkUnlink className="w-6" />
        </button>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("share:mastodonSharing")}
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label={t("share:mastodonServerUrl")}
                  description={t("share:mastodonExample")}
                  value={mastodonUrl}
                  onValueChange={setMastodonUrl}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("common:close")}
                </Button>
                <Button color="primary" onPress={handleMastodonShare}>
                  {t("common:share")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EntryShare;
