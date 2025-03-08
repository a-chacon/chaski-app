import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { RiUserLine } from "@remixicon/react";
import { save } from "@tauri-apps/plugin-dialog";
import { exportOPML } from "../helpers/feedsData";
import { useNavigate } from "@tanstack/react-router";
import { useDisclosure } from "@heroui/react";
import FeedbackModal from "./FeedbackModal";
import { RiFeedbackLine } from "@remixicon/react";

export default function UserMenu() {
  const navigate = useNavigate();
  const feedbackModalState = useDisclosure();

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
        navigate({ to: "/configurations" });
        break;
      case "about":
        navigate({ to: "/about" });
        break;
      case "feedback":
        feedbackModalState.onOpen();
        break;
      default:
        console.log("Unknown action");
    }
  };

  return (
    <>
      <Dropdown placement="right-end">
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="flat"
            className="rounded-full shadow-lg items-center h-10 w-10 flex justify-center"
          >
            <RiUserLine className="p-0.5" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={(key) => handleDropDownMenuKey(key.toString())}
          aria-label="Profile Actions"
        >
          <DropdownItem key="configurations">
            Configurations
          </DropdownItem>
          <DropdownItem key="about">
            About Chaski
          </DropdownItem>
          <DropdownItem key="feedback" >
            <div className="flex gap-2 items-center">
              <span>
                Feedback
              </span>
              <RiFeedbackLine></RiFeedbackLine>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown >

      <FeedbackModal
        isOpen={feedbackModalState.isOpen}
        onOpenChange={feedbackModalState.onOpenChange}
      />
    </>
  );
}
