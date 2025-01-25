import { AccountInterface } from "../../interfaces";
import { RiCloudOffLine, RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";
import { useState } from "react";
import { Button } from "@heroui/react";
import AccountItemContent from "./AccountItemContent";

interface AccountItemInterface {
  account: AccountInterface;
  reloadSideBar: () => void;
}

export default function AccountItem({ account, reloadSideBar }: AccountItemInterface) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

  const toggle = () => {
    if (!isOpen && account.kind == "local" || account.kind == "greaderapi") {
      //Get Data

    }
    setIsOpen((prev) => !prev)
  };

  return (
    <div className="" key={account.id}>
      <div
        role="option"
        className="flex items-center px-2 py-1 rounded-lg"
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >

        <Button isIconOnly size='sm' variant='light' onPress={toggle}>
          {isOpen ? (
            <RiArrowDownSLine />
          ) : (
            <RiArrowRightSLine />
          )}
        </Button>

        {/* <Link */}
        {/*   to="/accounts/$accountId" */}
        {/*   params={{ accountId: account.id }} */}
        {/*   className="w-full h-full flex flex-row items-center gap-2" */}
        {/* > */}
        <RiCloudOffLine className="w-5 opacity-90 mr-2" /> {account.name}
        {/* {isHovering && ( */}
        {/*   <AccountActions account={account} reloadSideBar={reloadSideBar}></AccountActions> */}
        {/* )} */}
      </div>

      {isOpen && (
        <div className="pl-7">
          <AccountItemContent account={account} reloadSideBar={reloadSideBar} />
        </div>
      )}
    </div>
  );
}
