import { FeedInterface } from "../interfaces";
import { Link } from "@tanstack/react-router";
import { RiFolder3Line, RiArrowLeftSLine, RiArrowDownSLine } from "@remixicon/react";
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
        className="flex flex-row px-3 py-1 rounded-lg hover:bg-primary-500/50"
      >
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

        <button onClick={toggle}>
          {isOpen ? (
            <
              RiArrowDownSLine
            />
          ) : (
            <
              RiArrowLeftSLine
            />
          )}
        </button>
      </div>
      <Listbox
        key="feeds"
        aria-label="feeds"
        className={isOpen ? 'block' : 'hidden'}
        itemClasses={{
          base: "data-[hover=true]:bg-primary-500/50",
        }}
      >
        {feeds.map((feed) => (
          <ListboxItem
            key={feed.id || ""}
          >
            <Link
              to="/feeds/$feedId"
              params={{ feedId: feed.id ?? "" }}
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500"
              }}
            >
              <img
                alt={feed.title}
                src={feed.icon}
                className="h-5 w-5 object-cover"
              />
              <p >{feed.title}</p>
            </Link>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )

}
