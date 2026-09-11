import { createLazyFileRoute } from "@tanstack/react-router";
import NewFeedSite from "../components/NewFeedSite";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/new_feed")({
  component: NewFeed,
});

function NewFeed() {
  const { t } = useTranslation("feeds");

  return (
    <MainSectionLayout>
      <div className="flex flex-col items-center justify-center h-full px-4 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl mb-6 font-bold text-center">
            {t("addNewFeedsHere")}
          </h1>
          <NewFeedSite />
        </div>
      </div>
    </MainSectionLayout>
  );
}
