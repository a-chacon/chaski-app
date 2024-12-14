import React from "react";
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

interface VerticalHeaderProps {}

const VerticalHeader: React.FC<VerticalHeaderProps> = ({}) => {
  const { setSideBarOpen, sideBarOpen } = useAppContext();
  const toggleSidebar = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setSideBarOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-row md:flex-col items-center md:h-full justify-between m-2 md:m-0 md:mr-2">
      <div className="flex md:flex-col gap-6 ">
        <Link
          to="/today"
          className="rounded-full items-center border border-default-800 bg-default-900 h-10 w-10 flex justify-center"
          activeProps={{
            className: "text-primary-500",
          }}
        >
          <RiHomeWifiLine className="p-0.5" />
        </Link>
        <a
          className={`rounded-full items-center border border-default-800 bg-default-900 h-10 w-10 flex justify-center ${sideBarOpen ? "text-primary-600" : ""}`}
          href="/"
          onClick={toggleSidebar}
        >
          {sideBarOpen ? (
            <RiSidebarFoldLine className="p-0.5" />
          ) : (
            <RiSidebarUnfoldLine className="p-0.5" />
          )}
        </a>
      </div>
      <div className="flex gap-4 md:flex-col">
        <Link
          className=" rounded-full items-center border border-default-800 bg-default-900 h-10 w-10 flex justify-center"
          to="/new_feed"
          activeProps={{
            className: "text-primary-600",
          }}
        >
          <RiAddCircleLine className="p-0.5" />
        </Link>
        <SearchModal></SearchModal>
      </div>
      <div>
        <UserMenu></UserMenu>
      </div>
    </div>
  );
};

export default VerticalHeader;
