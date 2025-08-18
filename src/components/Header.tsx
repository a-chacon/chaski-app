import React, { useEffect } from "react";
import {
  RiAddCircleLine,
  RiHomeWifiLine,
  RiSidebarUnfoldLine,
  RiSidebarFoldLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import SearchModal from "./SearchModal";
import UserMenu from "./UserMenu";
import updater from "../helpers/updater";
import { useNotification } from "../NotificationContext";
import { Button, Tooltip } from "@heroui/react";

interface VerticalHeaderProps { };

const VerticalHeader: React.FC<VerticalHeaderProps> = ({ }) => {
  const { addNotification } = useNotification();
  const { setSideBarOpen, sideBarOpen } = useAppContext();
  const toggleSidebar = () => {
    setSideBarOpen((prev) => !prev);
  };

  useEffect(() => {
    updater(addNotification);
  }, []);

  return (
    <div className="flex flex-row md:flex-col items-center md:h-full justify-between m-2 md:m-0 md:mr-2">
      <div className="flex md:flex-col gap-6 ">
        <Button
          variant="flat"
          isIconOnly
          className="rounded-full items-center h-10 w-10 flex justify-center"
        >
          <Link
            to="/today"
            activeProps={{
              className: "text-primary-500",
            }}
          >
            <RiHomeWifiLine className="p-0.5" />
          </Link>
        </Button>

        <Tooltip content={sideBarOpen ? "Collapse sidebar" : "Expand sidebar"} delay={500}>
          <Button
            variant="flat"
            isIconOnly
            className={`rounded-full items-center h-10 w-10 flex justify-center ${sideBarOpen ? "text-primary-500" : ""}`}
            onPress={toggleSidebar}
          >
            {sideBarOpen ? (
              <RiSidebarFoldLine className="p-0.5" />
            ) : (
              <RiSidebarUnfoldLine className="p-0.5" />
            )}
          </Button>
        </Tooltip>
      </div>
      <div className="flex gap-4 md:flex-col">
        <Tooltip content="Add new feed" delay={500}>
          <Button
            variant="flat"
            isIconOnly
            className={`rounded-full items-center h-10 w-10 flex justify-center`}
          >
            <Link
              to="/new_feed"
              activeProps={{
                className: "text-primary-500",
              }}
            >
              <RiAddCircleLine className="p-0.5" />
            </Link>
          </Button>
        </Tooltip>
        <Tooltip content="Search Feeds and Entries" delay={500}>
          <div>
            <SearchModal></SearchModal>
          </div>
        </Tooltip>
      </div>
      <div>
        <UserMenu></UserMenu>
      </div>
    </div>
  );
};

export default VerticalHeader;
