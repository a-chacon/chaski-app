import React, { useState } from 'react';
import { FeedInterface } from '../../interfaces';
import { Link } from '@tanstack/react-router';
import FolderActions from '../FolderActions';
import { Listbox, ListboxItem, Button } from '@heroui/react';
import { RiFolder3Line, RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";

interface FolderItemProps {
  folderName: string;
  feeds: FeedInterface[];
  reloadSideBar: () => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folderName, feeds, reloadSideBar }) => {
  const [folder, setFolder] = useState(folderName);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseOver = () => {
    setIsHovering(true);
  };


  const handleMouseOut = () => {
    setIsHovering(false);
  };

  const toggleFolder = () => {
    setIsOpen(prevState => !prevState);
  };

  return (
    <div className="folder-item"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className="folder-header flex items-center gap-2" >
        <Button isIconOnly size='sm' variant='light' onPress={toggleFolder}>
          {isOpen ? (
            <
              RiArrowDownSLine
              className="w-5"
            />
          ) : (
            <
              RiArrowRightSLine
              className="w-5"
            />
          )}
        </Button>

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

        {isHovering && (
          <FolderActions folder={folder} setFolder={setFolder} reloadSideBar={reloadSideBar}></FolderActions>
        )}
      </div>

      <Listbox
        key="feeds"
        variant='light'
        aria-label="feeds"
        className={isOpen ? 'block' : 'hidden'}
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
  );
};

export default FolderItem;

