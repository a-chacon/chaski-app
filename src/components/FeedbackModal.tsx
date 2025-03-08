import React, { useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

interface FeedbackModalInterface {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackModal: React.FC<FeedbackModalInterface> = ({ isOpen, onOpenChange }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Force reload the iframe when modal opens
    const src = iframe.dataset.tallySrc;
    if (src) {
      iframe.src = src;
    }

    // Add resize observer to handle dynamic height
    const resizeObserver = new ResizeObserver(() => {
      if (typeof window.Tally !== "undefined") {
        window.Tally.loadEmbeds();
      }
    });

    if (iframe) {
      resizeObserver.observe(iframe);
    }

    return () => {
      if (iframe) {
        resizeObserver.unobserve(iframe);
      }
    };
  }, [isOpen]);

  return (
    <Modal size="xl" scrollBehavior="outside" isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-row items-center">
              {/* Modal Header */}
            </ModalHeader>
            <ModalBody>
              <iframe
                ref={iframeRef}
                data-tally-src="https://tally.so/embed/wQk5Yg?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                loading="lazy"
                width="100%"
                height="500"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Feedback form"
                className="rounded-xl"
              ></iframe>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;

