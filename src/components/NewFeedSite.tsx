import { Input, Button } from "@heroui/react";
import { RiAddLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import FeedSite from "./FeedSite";
import { FeedInterface } from "../interfaces";
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { useAppContext } from "../AppContext";
import { open } from "@tauri-apps/plugin-dialog";
import { importOPML } from "../helpers/feedsData";

export default function App() {
  const { currentAccount } = useAppContext();

  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isInvalidMessage, setIsInvalidMessage] = useState("");
  const [availableFeeds, setAvailableFeeds] = useState<any>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [isImportLoading, setIsImportLoading] = useState(false);

  useEffect(() => {
    const fetchClipboardContent = async () => {
      try {
        const clipboardText = await readText();
        if (clipboardText) {
          const trimmedText = clipboardText.trim();
          try {
            new URL(trimmedText);
            setSiteUrl(trimmedText);
          } catch (_err) {
            console.log("Clipboard content is not a valid URL:", trimmedText);
          }
        }
      } catch (err) {
        console.error("Failed to read clipboard: ", err);
      }
    };

    fetchClipboardContent();
  }, []);

  useEffect(() => {
    setStep(1);
    setAvailableFeeds([]);
  }, [currentAccount?.id]);

  const handleImportButton = async () => {
    if (!currentAccount?.id) {
      return;
    }

    setIsImportLoading(true);
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Opml", extensions: ["opml"] }],
    });
    if (file) {
      await importOPML(currentAccount.id, file);
    }

    setIsImportLoading(false);
  };

  const previewNewBlogSite = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!currentAccount?.id) {
        throw new Error("No current account selected");
      }

      const message = await invoke<string>("fetch_site_feeds", {
        siteUrl: siteUrl,
        accountId: currentAccount.id,
      });
      const feeds: FeedInterface[] = JSON.parse(message);
      setAvailableFeeds(feeds);
      setStep(2);
    } catch (error) {
      setStep(2);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep(1);
    setSiteUrl("");
    setAvailableFeeds([]);
  };

  const handleValueChangeUrl = (value: string) => {
    const trimmedValue = value.trim();

    let url = trimmedValue;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
      setIsInvalid(false);
      setIsInvalidMessage("");
    } catch (_error) {
      setIsInvalid(true);
      setIsInvalidMessage("Please enter a valid URL.");
    }

    setSiteUrl(url);
  };

  if (!currentAccount) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">No account selected</h3>
        <p className="text-sm text-foreground-500">
          Create or select an account from the titlebar to add new feeds.
        </p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground-500">Adding feeds to: <strong>{currentAccount.name}</strong></p>
        <form
          className="flex w-full md:flex-nowrap gap-4 items-center"
          action="#"
          onSubmit={previewNewBlogSite}
        >
          <Input
            type="url"
            variant="underlined"
            label="Feed Url"
            description="It will try to discover the RSS feed if a direct link is not provided"
            isInvalid={isInvalid}
            errorMessage={isInvalidMessage}
            value={siteUrl}
            onValueChange={handleValueChangeUrl}
            placeholder="chaski.app/feed"
            autoFocus
          />
          <Button
            color="primary"
            variant="bordered"
            size="sm"
            radius="full"
            isIconOnly
            aria-label="Add"
            isLoading={isLoading}
            type="submit"
          >
            <RiAddLine />
          </Button>
        </form>
        <div className="flex justify-end">
          {currentAccount.kind === "local" && (
            <Button
              size="sm"
              variant="faded"
              onPress={handleImportButton}
              isLoading={isImportLoading}
            >
              Import OPML
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold p-3">Feeds found. Select the ones you'd like to add.</h3>
      <div className="flex flex-col gap-4 mx-auto">
        {availableFeeds.length === 0 ? (
          <p className="p-4">
            🫣Sorry, we can't find any RSS in the given link.
          </p>
        ) : (
          availableFeeds.map((feed: FeedInterface) => {
            return <FeedSite key={feed.id} feed={feed} />;
          })
        )}
      </div>
      <div className="flex justify-center p-2">
        <Button
          size="sm"
          variant="light"
          onPress={handleGoBack}
        >
          ← Back
        </Button>
      </div>
    </div>
  );
}
