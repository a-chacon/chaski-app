import { Button, useDisclosure, Tooltip } from "@heroui/react";
import {
  RiCalendarLine,
  RiBookmarkFill,
  RiAlignJustify,
  RiAddCircleLine,
  RiAccountBoxLine
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import NewAccountModal from '../components/NewAccountModal';
import AccountItem from "./SidebarItem/AccountItem";

interface SideBarProps {
  hidden: boolean;
}

function SideBar({ hidden }: SideBarProps) {

  const newAccountModal = useDisclosure()

  const {
    accounts,
  } = useAppContext();

  const classes = `overflow-auto shadow md:border border-primary-100 shadow-xl md:rounded-3xl px-1 py-3 h-full w-full md:w-3/5 lg:w-2/5 xl:w-1/3xl:w-1/5 absolute z-10 top-0 left-0 right-0 md:static ${hidden ? "hidden" : "block"}`;

  return (
    <nav className={classes}>
      <div className="flex flex-col">
        <div className="px-1 flex flex-col py-6 gap-2">
          <Link
            to="/today"
            className="w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md p-1 px-2"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <RiCalendarLine className="h-5 opacity-90"></RiCalendarLine>
            Today
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
          <Link
            to="/"
            className="w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md p-1 px-2"
            activeProps={{
              className: "bg-default/40"
            }}
          >
            <RiAlignJustify className="h-5 opacity-90"></RiAlignJustify>
            All
          </Link>
        </div>
        <div className="px-3 flex flex-row justify-between items-center">
          <div className="flex flex-row gap-2">
            <RiAccountBoxLine />
            <h5 className="font-bold" >
              Accounts
            </h5>
          </div>
          <Tooltip content="Add new account" delay={500} >
            <Button variant="light" isIconOnly onPress={newAccountModal.onOpen} className="rounded-md">
              <RiAddCircleLine></RiAddCircleLine>
            </Button>
          </Tooltip>
        </div>
        <NewAccountModal
          isOpen={newAccountModal.isOpen}
          onOpen={newAccountModal.onOpen}
          onClose={newAccountModal.onClose}
          onOpenChange={newAccountModal.onOpenChange}
        />

        <div className="w-full relative flex flex-col gap-1 py-2">
          {accounts.map((a) => {
            return <AccountItem account={a} ></AccountItem>
          })}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;
