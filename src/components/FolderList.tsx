import { FeedInterface } from "../interfaces";
import { Link } from "@tanstack/react-router";
import { RiFolder3Line, RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";
import { Listbox, ListboxItem } from "@heroui/react";
import { useState } from "react";
import FolderActions from "./FolderActions";

interface FolderListInterface {
  folderName: string,
  feeds: FeedInterface[];
  reloadSideBar: () => void;
}

export default function FolderList({ folderName, feeds, reloadSideBar }: FolderListInterface) {
  const [folder, setFolder] = useState(folderName);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseOver = () => {
    setIsHovering(true);
  };


  const handleMouseOut = () => {
    setIsHovering(false);
  };

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="" key={folder}>
      <div
        role="option"
        className="flex flex-row px-2 py-1 rounded-lg hover:bg-primary-500 hover:text-background"
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
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
          params={{ folderName: folder }}
          className="w-full h-full flex flex-row items-center gap-2"
        >
          <RiFolder3Line className="w-5 opacity-90" /> {folder}
        </Link>
        {isHovering && (
          <FolderActions folder={folder} setFolder={setFolder} reloadSideBar={reloadSideBar}></FolderActions>
        )}
      </div>
      <Listbox
        key="feeds"
        aria-label="feeds"
        className={isOpen ? 'block' : 'hidden'}
        itemClasses={{
          base: "pl-7 data-[hover=true]:bg-primary-500 data-[hover=true]:text-background",
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
