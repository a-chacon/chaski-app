import { Dropdown, DropdownTrigger, DropdownMenu, Button, DropdownItem } from "@nextui-org/react";
import { RiMoreLine } from "@remixicon/react";

interface FolderActionsProps {
  folder: string;
}



const FolderActions: React.FC<FolderActionsProps> = ({ folder }) => {
  console.log(folder);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button size="sm" variant="light" isIconOnly className="h-full">
          <RiMoreLine className="w-5"></RiMoreLine>
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="light" aria-label="Static Actions">
        <DropdownItem key="filters">
          Export as opml
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

}

export default FolderActions;
