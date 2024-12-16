import { Listbox, ListboxItem } from "@nextui-org/react";
import {
  RiCalendarLine,
  RiBookmarkFill,
  RiAlignJustify,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import FolderList from "./FolderList";
import { useState, useEffect } from "react";
import { FeedInterface } from "../interfaces";
import { invoke } from "@tauri-apps/api/core";

interface SideBarProps {
  hidden: boolean;
}

function groupBy<T>(arr: T[], fn: (item: T) => any) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}

function SideBar({ hidden }: SideBarProps) {
  const [feeds, setFeeds] = useState<FeedInterface[]>([]);
  const classes = `overflow-auto shadow bg-default-950 md:border border-default-800 md:rounded-3xl px-1 py-3 h-full w-full md:w-3/5 lg:w-2/5 xl:w-1/3xl:w-1/5 absolute z-10 top-0 left-0 right-0 md:static ${hidden ? "hidden" : "block"}`;

  const grouped_feeds = groupBy(feeds, (f) => f.folder);

  useEffect(() => {
    if (!hidden) {
      const fetchFeeds = async () => {
        try {
          const message = await invoke<string>("list_feeds");
          const feeds: FeedInterface[] = JSON.parse(message);
          setFeeds(feeds);
        } catch (error) {
          console.error("Error fetching feeds:", error);
        }
      };

      fetchFeeds();
    }
  }, [hidden]);

  return (
    <nav className={classes}>
      <div className="flex flex-col">
        <Listbox
          key="menu"
          aria-label="Actions"
          className="py-6"
          onAction={() => { }}
          itemClasses={{
            base: "data-[hover=true]:bg-primary-500/50",
          }}
        >
          <ListboxItem key="today">
            <Link
              to="/today"
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500",
              }}
            >
              <RiCalendarLine className="h-5 opacity-90"></RiCalendarLine>
              Today
            </Link>
          </ListboxItem>
          <ListboxItem key="read_later">
            <Link
              to="/read_later"
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500",
              }}
            >
              <RiBookmarkFill className="h-5 opacity-90"></RiBookmarkFill>
              Read Later
            </Link>
          </ListboxItem>
          <ListboxItem key="all">
            <Link
              to="/"
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500",
              }}
            >
              <RiAlignJustify className="h-5 opacity-90"></RiAlignJustify>
              All
            </Link>
          </ListboxItem>
        </Listbox>
        <h5 className="px-4 opacity-90">Feeds</h5>
        <div className="w-full relative flex flex-col gap-1 p-1 py-6">
          {Object.entries(grouped_feeds).map(([key, value]) => (
            <FolderList folderName={key} feeds={value} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;
