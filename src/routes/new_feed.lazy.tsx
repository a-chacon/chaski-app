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
      <div className="grid p-4 h-full place-items-center">
        <div>
          <h1 className="text-3xl m-4 font-bold text-center">
            {t("addNewFeedsHere")}
          </h1>
          <div className="w-80 md:w-96">
            <NewFeedSite />
          </div>
        </div>
      </div>
    </MainSectionLayout>
  );
}
