import { Listbox, ListboxItem, Button, useDisclosure } from "@heroui/react";
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
        <div className="flex flex-row justify-between items-center">
          <div className="px-3 flex flex-row gap-2">
            <RiAccountBoxLine />
            <h5 className="font-bold" >
              Accounts
            </h5>
          </div>
          <Button variant="light" isIconOnly onPress={newAccountModal.onOpen}>
            <RiAddCircleLine></RiAddCircleLine>
          </Button>
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
