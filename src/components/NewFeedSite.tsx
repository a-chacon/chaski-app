import { Input, Button } from "@nextui-org/react";
import { RiAddLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import FeedSite from "./FeedSite";
import { FeedInterface } from "../interfaces";
import { readText } from '@tauri-apps/plugin-clipboard-manager';

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isInvalidMessage, setIsInvalidMessage] = useState("");
  const [availableFeeds, setAvailableFeeds] = useState<any>([]);
  const [siteUrl, setSiteUrl] = useState("");

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
      const message = await invoke<string>("fetch_site_feeds", {
        siteUrl: siteUrl,
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

  if (step === 1) {
    return (
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
    );
  } else {
    return (
      <>
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
            radius="full"
            variant="flat"
            color="secondary"
            onClick={handleGoBack}
          >
            Add Another
          </Button>
        </div>
      </>
    );
  }
}
