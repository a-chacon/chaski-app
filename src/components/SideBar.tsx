import { RiBookmarkFill, RiAlignJustify } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import AccountItemContent from "./SidebarItem/AccountItemContent";

function SideBar() {
  const { currentAccount } = useAppContext();

  const classes = "overflow-auto px-2 py-4 h-full w-full absolute z-30 top-0 left-0 right-0 md:static bg-primary-50";

  return (
    <nav className={classes}>
      <div className="flex flex-col gap-1">
        <div className="px-1 flex flex-col py-2 gap-1.5">
          <Link
            to="/"
            className="w-full h-full flex flex-row items-center gap-2 hover:bg-default/40 rounded-md py-1.5 px-2 text-sm"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <RiAlignJustify className="h-5 opacity-90"></RiAlignJustify>
            Entries
          </Link>
          <Link
            to="/read_later"
            className="w-full h-full flex flex-row items-center gap-2 hover:bg-default/40 rounded-md py-1.5 px-2 text-sm"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <RiBookmarkFill className="h-5 opacity-90"></RiBookmarkFill>
            Read Later
          </Link>
        </div>

        <div className="px-3 pt-2 pb-1">
          <h5 className="font-semibold text-xs uppercase tracking-wide text-foreground-500">Feeds</h5>
        </div>

        <div className="w-full relative flex flex-col gap-1 py-1">
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
