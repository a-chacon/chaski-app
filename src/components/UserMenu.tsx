import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { RiUserLine } from "@remixicon/react";
import { save } from "@tauri-apps/plugin-dialog";
import { exportOPML } from "../helpers/feedsData";
import { Link } from "@tanstack/react-router";

export default function UserMenu() {
  const handleDropDownMenuKey = async (key: string) => {
    switch (key) {
      case "export_opml":
        const path_to_save = await save({
          filters: [{ name: "Opml", extensions: ["opml"] }],
        });
        if (path_to_save) {
          exportOPML(path_to_save, []);
        }
        break;
      case "configurations":
        console.log("Open configurations");
        // Add your configurations logic here
        break;
      case "help_and_feedback":
        console.log("Open help and feedback");
        // Add your help and feedback logic here
        break;
      default:
        console.log("Unknown action");
    }
  };

  return (
    <>
      <Dropdown placement="right-end" className="bg-default-800">
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="light"
            className="rounded-full items-center border border-default-800 bg-default-900 h-10 w-10 flex justify-center"
          >
            <RiUserLine className="p-0.5" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={(key) => handleDropDownMenuKey(key.toString())}
          aria-label="Profile Actions"
          variant="flat"
        >
          <DropdownItem key="export_opml">Export All (OPML)</DropdownItem>
          <DropdownItem key="configurations">
            <Link to="/configurations">Configurations</Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
