import { createLazyFileRoute } from "@tanstack/react-router";
import FeedFinder from "../components/FeedFinder";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/new_feed")({
  component: NewFeed,
});

function NewFeed() {
  const { t } = useTranslation("discover");

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-(--breakpoint-md) mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl pt-2 font-bold">{t("title")}</h1>
          <h2 className="pt-1 text-foreground-500">{t("subtitle")}</h2>
        </div>
        <FeedFinder />
      </div>
    </MainSectionLayout>
  );
}
