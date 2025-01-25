import { Listbox, ListboxItem } from "@heroui/react";
import {
  RiCalendarLine,
  RiBookmarkFill,
  RiAlignJustify,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AccountInterface } from "../interfaces";
import { indexAccounts } from "../helpers/accountsData";
import AccountItem from "./SidebarItem/AccountItem";

interface SideBarProps {
  hidden: boolean;
}

function SideBar({ hidden }: SideBarProps) {
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [reload, setReload] = useState(1);
  const classes = `overflow-auto shadow md:border border-primary-100 shadow-xl md:rounded-3xl px-1 py-3 h-full w-full md:w-3/5 lg:w-2/5 xl:w-1/3xl:w-1/5 absolute z-10 top-0 left-0 right-0 md:static ${hidden ? "hidden" : "block"}`;

  useEffect(() => {
    if (!hidden) {
      const fetchAccounts = async () => {
        try {
          const accountResponse = await indexAccounts()
          setAccounts(accountResponse);
        } catch (error) {
          console.error("Error fetching feeds:", error);
        }
      };

      fetchAccounts();
    }
  }, [hidden, reload]);

  const reset = () => {
    setReload(Math.random());
  }

  return (
    <nav className={classes}>
      <div className="flex flex-col">
        <Listbox
          key="menu"
          aria-label="Actions"
          className="py-6"
          onAction={() => { }}
          variant='light'
        >
          <ListboxItem key="today">
            <Link
              to="/today"
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500"
              }}
            >
              <RiCalendarLine className="h-5 opacity-90"></RiCalendarLine>
              Today
            </Link>
          </ListboxItem>
          <ListboxItem key="read_later">
            <Link
              to="/read_later"
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500"
              }}
            >
              <RiBookmarkFill className="h-5 opacity-90"></RiBookmarkFill>
              Read Later
            </Link>
          </ListboxItem>
          <ListboxItem key="all">
            <Link
              to="/"
              className="w-full h-full flex flex-row items-center gap-2"
              activeProps={{
                className: "text-primary-500"
              }}
            >
              <RiAlignJustify className="h-5 opacity-90"></RiAlignJustify>
              All
            </Link>
          </ListboxItem>
        </Listbox>
        <h5 className="px-4 opacity-90">Accounts</h5>
        <div className="w-full relative flex flex-col gap-1 p-1 py-2">
          {accounts.map((a) => {
            return <AccountItem account={a} reloadSideBar={reset}></AccountItem>
          })}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;
