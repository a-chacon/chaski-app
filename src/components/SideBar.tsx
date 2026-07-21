import { RiBookmarkFill, RiAlignJustify } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import AccountItemContent from "./SidebarItem/AccountItemContent";

interface SideBarProps {
  hidden: boolean;
}

function SideBar({ hidden }: SideBarProps) {
  const { currentAccount } = useAppContext();

  const classes = `overflow-auto shadow md:border border-primary-100 shadow-xl md:rounded-3xl px-1 py-3 h-full w-full md:w-3/5 lg:w-2/5 xl:w-1/3xl:w-1/5 absolute z-10 top-0 left-0 right-0 md:static ${hidden ? "hidden" : "block"}`;

  return (
    <nav className={classes}>
      <div className="flex flex-col">
        <div className="px-1 flex flex-col py-6 gap-2">
          <Link
            to="/"
            className="w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md p-1 px-2"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <RiAlignJustify className="h-5 opacity-90"></RiAlignJustify>
            Entries
          </Link>
          <Link
            to="/read_later"
            className="w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md p-1 px-2"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <RiBookmarkFill className="h-5 opacity-90"></RiBookmarkFill>
            Read Later
          </Link>
        </div>

        <div className="px-3 pb-1">
          <h5 className="font-bold">{currentAccount ? currentAccount.name : "Feeds"}</h5>
        </div>

        <div className="w-full relative flex flex-col gap-1 py-2">
          {currentAccount ? (
            <AccountItemContent account={currentAccount} />
          ) : (
            <p className="px-3 text-sm text-foreground-500">No account selected. Add an account from the titlebar.</p>
          )}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;
