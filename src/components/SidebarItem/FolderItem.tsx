import React, { useState } from 'react';
import { AccountInterface, FeedInterface } from '../../interfaces';
import { Link } from '@tanstack/react-router';
import FolderActions from '../FolderActions';
import { Button } from '@heroui/react';
import { RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";
import { useAppContext } from '../../AppContext';

interface FolderItemProps {
  account: AccountInterface;
  folderName: string;
  feeds: FeedInterface[];
}

const FolderItem: React.FC<FolderItemProps> = ({ account, folderName, feeds }) => {
  const [folder, setFolder] = useState(folderName);
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile, setSideBarOpen } = useAppContext();

  const toggleFolder = () => setIsOpen(prev => !prev);
  const handleLinkClick = () => { if (isMobile) setSideBarOpen(false); };

  const rowPy = isMobile ? "py-3" : "py-1";
  const textSize = isMobile ? "text-base" : "text-sm";
  const iconSize = isMobile ? 22 : 20;
  const btnSize = isMobile ? "w-9 h-9 min-w-9" : "w-7 h-7 min-w-7";

  return (
    <div className="folder-item px-1">
      <div className="folder-header flex items-center gap-1 pr-2">
        <Button
          isIconOnly
          size={isMobile ? "md" : "sm"}
          variant="light"
          onPress={toggleFolder}
          className={`rounded-md ${btnSize}`}
        >
          {isOpen
            ? <RiArrowDownSLine size={iconSize} />
            : <RiArrowRightSLine size={iconSize} />
          }
        </Button>

        <Link
          to="/folders/$folderName"
          params={{ folderName: account.id + "-" + folder }}
          className={`w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md px-2 ${rowPy} ${textSize}`}
          activeProps={{ className: "bg-default/40" }}
          onClick={handleLinkClick}
        >
          {folder}
        </Link>

        <FolderActions folder={folder} account={account} setFolder={setFolder} />
      </div>

      <div className={`flex flex-col ml-8 pr-2 py-1 ${isOpen ? "flex" : "hidden"}`}>
        {feeds.map((feed) => (
          <Link
            key={feed.id}
            to="/feeds/$feedId"
            params={{ feedId: feed.id!.toString() }}
            className={`w-full h-full flex flex-row items-center opacity-80 hover:bg-default/40 rounded-md px-2 justify-between ${rowPy}`}
            activeProps={{ className: "bg-default/40" }}
            onClick={handleLinkClick}
          >
            <div className="flex flex-row gap-2 items-center">
              <img
                alt={feed.title}
                src={feed.icon}
                className={isMobile ? "h-6 w-6 object-cover" : "h-5 w-5 object-cover"}
              />
              <p className={`${textSize} leading-5`}>{feed.title}</p>
            </div>
            {feed.unread_count > 0 && (
              <span className="relative flex items-center pr-1">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FolderItem;

