import { ReactNode } from "react";
import { Snippet } from "@heroui/react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { FeedInterface } from "../interfaces";

interface FeedHeaderProps {
  feed?: FeedInterface;
  actions?: ReactNode;
  showDates?: boolean;
}

export default function FeedHeader({ feed, actions, showDates = true }: FeedHeaderProps) {
  const { t } = useTranslation("entries");

  return (
    <div className="flex flex-col py-8 justify-between items-start">
      <div className="w-full flex flex-row justify-between">
        <div className="flex flex-row">
          <img src={feed?.icon} alt={feed?.title} className="h-10 my-auto mr-4" />
          <h1 className="text-xl md:text-3xl font-bold">{feed?.title}</h1>
        </div>
        {actions}
      </div>

      <p className="my-4 line-clamp-3 opacity-80">{feed?.description}</p>

      <div className="flex justify-between w-full items-center flex-wrap gap-2">
        <Snippet symbol="" size="sm" variant="bordered" className="w-full truncate">
          {feed?.link}
        </Snippet>
        {showDates && (
          <div className="flex flex-col">
            <span className="text-sm">
              <span className="font-semibold">{t("lastFetch")}: </span>
              {moment.utc(feed?.last_fetch).fromNow()}
            </span>
            <span className="text-sm">
              <span className="font-semibold">{t("latestEntry")}: </span>
              {moment.utc(feed?.latest_entry).fromNow()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
