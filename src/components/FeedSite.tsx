import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
} from "@heroui/react";
import { FeedInterface } from "../interfaces.ts";
import FeedSiteActions from "./FeedSiteActions.tsx";
import { Link } from "@tanstack/react-router";
import { AtomSvg, RSSSvg } from "../helpers/svg.tsx";

interface FeedSiteProps {
  feed: FeedInterface;
}

const FeedSite: React.FC<FeedSiteProps> = ({ feed }) => {
  const [currentFeed, setCurrentFeed] = useState(feed);

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between">
        <Link to="/feeds/$feedId" params={{ feedId: currentFeed.id?.toString() || "" }}>
          <div className="flex gap-5">
            <img
              alt={currentFeed.title}
              src={currentFeed.icon}
              className="h-8 self-center"
            />
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none">
                {currentFeed.title}
              </h4>
            </div>
          </div>
        </Link>
        <div>
          <FeedSiteActions feed={currentFeed} setFeed={setCurrentFeed} />
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small">
        <p className="line-clamp-3">{currentFeed.description}</p>
      </CardBody>
      <CardFooter className="gap-3 flex justify-between">
        <div className="flex gap-1">
          <p className="font-semibold text-small">
            {currentFeed.items_count}
          </p>
          <p className="text-small">Articles</p>
        </div>
        <div className="flex gap-1">
          {currentFeed.kind === "rss" ? (
            <div className="w-5">
              <Tooltip content="Atom">
                <AtomSvg />
              </Tooltip>
            </div>
          ) : (
            <div className="w-5">
              <Tooltip content="RSS">
                <RSSSvg />
              </Tooltip>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeedSite;
