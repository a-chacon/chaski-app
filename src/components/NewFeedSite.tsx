import { Input, Button } from "@heroui/react";
import { RiAddLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import FeedSite from "./FeedSite";
import { AccountInterface, FeedInterface } from "../interfaces";
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { useAppContext } from "../AppContext";

export default function App() {

  const {
    accounts,
  } = useAppContext();

  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isInvalidMessage, setIsInvalidMessage] = useState("");
  const [availableFeeds, setAvailableFeeds] = useState<any>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountInterface | null>(null);

  useEffect(() => {
    const fetchClipboardContent = async () => {
      try {
        const clipboardText = await readText();
        if (clipboardText) {
          const trimmedText = clipboardText.trim();
          try {
            new URL(trimmedText); // Try creating a URL object to validate the URL format
            setSiteUrl(trimmedText); // If it's a valid URL, set it as the siteUrl
          } catch (err) {
            console.log("Clipboard content is not a valid URL:", trimmedText);
          }
        }
      } catch (err) {
        console.error("Failed to read clipboard: ", err);
      }
    };

    fetchClipboardContent();
  }, []);

  const previewNewBlogSite = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true); // Start loading

    try {
      if (!selectedAccount) {
        throw new Error("No account selected");
      }

      const message = await invoke<string>("fetch_site_feeds", {
        siteUrl: siteUrl,
        accountId: selectedAccount.id!,
      });
      const feeds: FeedInterface[] = JSON.parse(message); // Parse the JSON message
      setAvailableFeeds(feeds); // Set the feeds
      setStep(2); // Move to the next step
    } catch (error) {
      setStep(2);
      console.error(error); // Handle error
    } finally {
      setIsLoading(false); // End loading in both success and error cases
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
      new URL(url); // This will throw an error if the URL is invalid
      setIsInvalid(false); // Reset invalid state
      setIsInvalidMessage(""); // Reset error message
    } catch (error) {
      setIsInvalid(true); // Set invalid state
      setIsInvalidMessage("Please enter a valid URL."); // Set error message
    }

    setSiteUrl(url);
  };

  if (step === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold">Select an account to add feeds to:</h3>
        {accounts.map((account) => (
          <Button
            key={account.id}
            variant="flat"
            color="primary"
            className="justify-start"
            onPress={() => {
              setSelectedAccount(account);
              setStep(1);
            }}
          >
            {account.name}
          </Button>
        ))}
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4">
        <form
          className="flex w-full md:flex-nowrap gap-4 items-center"
          action="#"
          onSubmit={previewNewBlogSite}
        >
          <Input
            type="url"
            variant="underlined"
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
        <Button
          size="sm"
          variant="light"
          className="self-start"
          onPress={() => setStep(0)}
        >
          ← Change Account
        </Button>
      </div>
    );
  } else {
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
}
