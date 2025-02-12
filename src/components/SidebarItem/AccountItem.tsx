import { AccountInterface } from "../../interfaces";
import { RiCloudOffLine, RiCloudLine, RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@heroui/react";
import AccountItemContent from "./AccountItemContent";

interface AccountItemInterface {
  account: AccountInterface;
}

export default function AccountItem({ account }: AccountItemInterface) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen((prev) => !prev)
  };

  return (
    <div className="" key={account.id}>
      <div
        role="option"
        className="flex items-center px-2 py-1 rounded-lg gap-1"
      >

        <Button className='rounded-md' isIconOnly size='sm' variant='light' onPress={toggle}>
          {isOpen ? (
            <RiArrowDownSLine />
          ) : (
            <RiArrowRightSLine />
          )}
        </Button>


        <Link
          to="/account/$accountId"
          params={{ accountId: account.id!.toString() }}
          className="w-full h-full flex flex-row items-center hover:bg-default/40 rounded-md p-1 px-2"
          activeProps={{
            className: "bg-default/40"
          }}
        >
          {account.kind === 'greaderapi' ? (
            <RiCloudLine className="w-5 opacity-90 mr-2" />
          ) : (
            <RiCloudOffLine className="w-5 opacity-90 mr-2" />
          )}
          {account.name}
        </Link>
      </div>

      {isOpen && (
        <div className="pl-7">
          <AccountItemContent account={account} />
        </div>
      )}
    </div>
  );
}
