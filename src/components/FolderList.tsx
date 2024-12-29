import { FeedInterface } from "../interfaces";
import { Link } from "@tanstack/react-router";
import { RiFolder3Line, RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { useState } from "react";

interface FolderListInterface {
  folderName: string,
  feeds: FeedInterface[];
}

export default function FolderList({ folderName, feeds }: FolderListInterface) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="" key={folderName}>
      <div
        role="option"
        className="flex flex-row px-2 py-1 rounded-lg hover:bg-primary-500/50"
      >
        <button onClick={toggle}>
          {isOpen ? (
            <
              RiArrowDownSLine
            />
          ) : (
            <
              RiArrowRightSLine
            />
          )}
        </button>

        <Link
          to="/folders/$folderName"
          params={{ folderName: folderName }}
          className="w-full h-full flex flex-row items-center gap-2"
          activeProps={{
            className: "text-primary-500"
          }}
        >
          <RiFolder3Line className="w-5 opacity-90" /> {folderName}
        </Link>
      </div>
      <Listbox
        key="feeds"
        aria-label="feeds"
        className={isOpen ? 'block' : 'hidden'}
        itemClasses={{
          base: "pl-7 data-[hover=true]:bg-primary-500/50",
        }}
      >
        {feeds.map((feed) => (
          <ListboxItem
            className="relative"
            key={feed.id || ""}
          >
            <Link
              to="/feeds/$feedId"
              params={{ feedId: feed.id ?? "" }}
              className="w-full h-full flex flex-row items-center justify-between"
              activeProps={{
                className: "text-primary-500"
              }}
            >
              <div className="flex flex-row gap-2">
                <img
                  alt={feed.title}
                  src={feed.icon}
                  className="h-5 w-5 object-cover"
                />
                <p >{feed.title}</p>
              </div>
              {
                feed.unread_count > 0 && (
                  <span className="relative flex items-center ml-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                  </span>
                )
              }
            </Link>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )

}
