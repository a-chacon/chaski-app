import { createLazyFileRoute } from "@tanstack/react-router";
import NewFeedSite from "../components/NewFeedSite";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Button } from "@heroui/react";
import { open } from "@tauri-apps/plugin-dialog";
import { importOPML } from "../helpers/feedsData";
import { useState } from "react";

export const Route = createLazyFileRoute("/new_feed")({
  component: NewFeed,
});

function NewFeed() {
  const [isImportLoading, setIsImportLoading] = useState(false);

  const handleImportButton = async () => {
    setIsImportLoading(true);
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Opml", extensions: ["opml"] }],
    });
    if (file) {
      await importOPML(file);
    }

    setIsImportLoading(false);
  };
  return (
    <MainSectionLayout>
      <div className="grid p-4 h-full place-items-center">
        <div>
          <h1 className="text-3xl m-4 font-bold text-center">
            Give me a link!
          </h1>
          <div className="w-80 md:w-96">
            <NewFeedSite />
          </div>
        </div>
        <div className="absolute top-10 right-10">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={handleImportButton}
            isLoading={isImportLoading}
          >
            Import OPML here!
          </Button>
        </div>
      </div>
    </MainSectionLayout>
  );
}
