import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
  Chip,
} from "@heroui/react";
import { FeedInterface } from "../interfaces.ts";
import FeedSiteActions from "./FeedSiteActions.tsx";
import { Link } from "@tanstack/react-router";
import { AtomSvg, RSSSvg } from "../helpers/svg.tsx";
import { RiFileCopyLine, RiCheckLine } from "@remixicon/react";

interface FeedSiteProps {
  feed: FeedInterface;
}

const FeedSite: React.FC<FeedSiteProps> = ({ feed }) => {
  const [currentFeed, setCurrentFeed] = useState(feed);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(currentFeed.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed silently
    }
  };

  const titleContent = (
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
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between">
        {currentFeed.id ? (
          <Link to="/feeds/$feedId" params={{ feedId: currentFeed.id.toString() }}>
            {titleContent}
          </Link>
        ) : (
          <div>{titleContent}</div>
        )}
        <div>
          <FeedSiteActions feed={currentFeed} setFeed={setCurrentFeed} />
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small">
        <p className="line-clamp-3">{currentFeed.description}</p>
        {currentFeed.tags && currentFeed.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {currentFeed.tags.map((tag) => (
              <Chip key={tag} size="sm" variant="flat" color="default">
                {tag}
              </Chip>
            ))}
          </div>
        )}
      </CardBody>
      <CardFooter className="gap-3 flex justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Tooltip content={copied ? "Copied!" : "Copy feed URL"}>
            <button
              onClick={handleCopy}
              className="shrink-0 text-foreground-400 hover:text-foreground-600 transition-colors"
              aria-label="Copy feed URL"
            >
              {copied ? (
                <RiCheckLine className="w-4 h-4 text-success" />
              ) : (
                <RiFileCopyLine className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
          <a
            href={currentFeed.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground-400 hover:text-foreground-600 truncate transition-colors"
          >
            {currentFeed.link}
          </a>
        </div>
        <div className="flex gap-1 shrink-0">
          {currentFeed.kind === "rss" ? (
            <div className="w-5">
              <Tooltip content="RSS">
                <RSSSvg />
              </Tooltip>
            </div>
          ) : (
            <div className="w-5">
              <Tooltip content="Atom">
                <AtomSvg />
              </Tooltip>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeedSite;
