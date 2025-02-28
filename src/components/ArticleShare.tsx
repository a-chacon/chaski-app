import {
  RiFacebookBoxFill,
  RiTwitterXLine,
  RiMastodonFill,
  RiRedditLine,
  RiLinkedinBoxFill,
  RiLinkUnlink,
} from "@remixicon/react";
import { ArticleInterface } from "../interfaces";
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

interface ArticleShareProps {
  article: ArticleInterface;
  className?: string;
}

const ArticleShare: React.FC<ArticleShareProps> = ({
  article,
  className,
}) => {

  const { addNotification } = useNotification();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { title, link, description } = article;
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

    addNotification("Copied", 'The link was copied to the clipboard!', 'primary');
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
      <Tooltip content="Copy to clipboard">
        <button onClick={copyLinkToClipboard} className="flex items-center">
          <RiLinkUnlink className="w-6" />
        </button>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Mastodon sharing
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="What is your Mastodon server URL?"
                  description="Example: https://mastodon.social/"
                  value={mastodonUrl}
                  onValueChange={setMastodonUrl}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleMastodonShare}>
                  Share
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ArticleShare;
