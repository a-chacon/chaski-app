import {
  RiFacebookBoxFill,
  RiTwitterXLine,
  RiMastodonFill,
  RiRedditLine,
  RiLinkedinBoxFill,
  RiLinkUnlink,
  RiShareLine,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useNotification } from "../NotificationContext";
import { useAppContext } from "../AppContext";
import { useTranslation } from "react-i18next";

interface EntryShareProps {
  entry: EntryInterface;
  className?: string;
  buttonSize?: "sm" | "md";
  iconSize?: number;
}

const EntryShare: React.FC<EntryShareProps> = ({
  entry,
  className,
  buttonSize = "sm",
  iconSize = 18,
}) => {
  const { t } = useTranslation(["share", "common"]);
  const { addNotification } = useNotification();
  const { isMobilePlatform } = useAppContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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

  const copyLinkToClipboard = async () => {
    try {
      await writeText(link);
      addNotification(t("share:copiedTitle"), t("share:copiedBody"), "primary");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleMastodonShare = () => {
    window.open(mastodonUrl + mastodonShareUrl, "_blank");
    onOpenChange();
  };

  // On mobile the only alternative is copying the link, so skip the popover.
  if (isMobilePlatform) {
    return (
      <Button
        color="default"
        variant="light"
        isIconOnly
        size={buttonSize}
        className={className}
        aria-label={t("share:copyToClipboard")}
        onPress={copyLinkToClipboard}
      >
        <RiLinkUnlink size={iconSize} />
      </Button>
    );
  }

  const socialLinks = [
    { key: "facebook", label: "Facebook", href: facebookShareUrl, icon: <RiFacebookBoxFill className="w-5 h-5" /> },
    { key: "twitter", label: "X", href: twitterShareUrl, icon: <RiTwitterXLine className="w-5 h-5" /> },
    { key: "reddit", label: "Reddit", href: redditShareUrl, icon: <RiRedditLine className="w-5 h-5" /> },
    { key: "linkedin", label: "LinkedIn", href: linkedinShareUrl, icon: <RiLinkedinBoxFill className="w-5 h-5" /> },
  ];

  return (
    <>
      <Popover placement="bottom-end" isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger>
          <Button
            color="default"
            variant="light"
            isIconOnly
            size={buttonSize}
            className={className}
            aria-label={t("share:shareEntry")}
            title={t("share:shareEntry")}
          >
            <RiShareLine size={iconSize} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2 items-stretch gap-1 w-56">
          <Button
            size="sm"
            variant="light"
            className="justify-start"
            startContent={<RiMastodonFill className="w-5 h-5" />}
            fullWidth
            onPress={() => {
              setIsPopoverOpen(false);
              onOpen();
            }}
          >
            Mastodon
          </Button>
          {socialLinks.map((s) => (
            <Button
              key={s.key}
              as="a"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="light"
              className="justify-start"
              startContent={s.icon}
              fullWidth
              onPress={() => setIsPopoverOpen(false)}
            >
              {s.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="light"
            className="justify-start"
            startContent={<RiLinkUnlink className="w-5 h-5" />}
            fullWidth
            onPress={() => {
              setIsPopoverOpen(false);
              copyLinkToClipboard();
            }}
          >
            {t("share:copyToClipboard")}
          </Button>
        </PopoverContent>
      </Popover>

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
    </>
  );
};

export default EntryShare;
