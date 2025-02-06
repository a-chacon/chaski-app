import React, { useState } from 'react';
import { AccountInterface, FeedInterface } from '../../interfaces';
import { Link } from '@tanstack/react-router';
import FolderActions from '../FolderActions';
import { Button } from '@heroui/react';
import { RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";

interface FolderItemProps {
  account: AccountInterface;
  folderName: string;
  feeds: FeedInterface[];
}

const FolderItem: React.FC<FolderItemProps> = ({ account, folderName, feeds }) => {
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
    <div className="folder-item pl-2"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className="folder-header flex items-center gap-0.5 pr-4" >
        <Button isIconOnly size='sm' variant='light' onPress={toggleFolder} className='rounded-md' >
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
          params={{ folderName: account.id + "-" + folderName }}
          className="w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md p-1 px-2"
          activeProps={{
            className: "bg-default/40"
          }}
        >
          {folderName}
        </Link>

        <FolderActions folder={folder} account={account} setFolder={setFolder} />
      </div>

      <div className={`flex flex-col gap-2 pr-4 py-2 ${isOpen ? 'block' : 'hidden'}`}>
        {feeds.map((feed) => (
          <Link
            to="/feeds/$feedId"
            params={{ feedId: feed.id ?? "" }}
            className="w-full h-full flex flex-row items-center opacity-80 hover:bg-default/40 rounded-md p-1 px-2 justify-between"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <div className="flex flex-row gap-2 items-center">
              <img
                alt={feed.title}
                src={feed.icon}
                className="h-5 w-5 object-cover"
              />
              <p >{feed.title}</p>
            </div>
            {
              feed.unread_count > 0 && (
                <span className="relative flex items-center pr-1">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                </span>
              )
            }
          </Link>
        ))}
      </div>

    </div>
  );
};

export default FolderItem;

