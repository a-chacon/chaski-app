import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { RiCheckLine, RiEyeOffLine } from "@remixicon/react";
import { useAppContext } from "../AppContext";

const EntriesFiltersSwitch: React.FC = () => {
  const {
    showReadEntries,
    setShowReadEntries,
    showHiddenEntries,
    setShowHiddenEntries,
  } = useAppContext();

  return (
    <div className="flex items-center gap-2 justify-end">
      <Tooltip
        content={
          showReadEntries
            ? "Hide read entries"
            : "Show read entries"
        }
      >
        <Button
          onPress={() => setShowReadEntries((prev) => !prev)}
          color={showReadEntries ? "primary" : "default"}
          aria-label={showReadEntries ? "Hide read entries" : "Show read entries"}
          size="sm"
          isIconOnly
          variant={showReadEntries ? "flat" : "light"}
        >
          <RiCheckLine />
        </Button>
      </Tooltip>

      <Tooltip
        content={
          showHiddenEntries
            ? "Hide hidden entries"
            : "Show hidden entries"
        }
      >
        <Button
          onPress={() => setShowHiddenEntries((prev) => !prev)}
          color={showHiddenEntries ? "primary" : "default"}
          aria-label={showHiddenEntries ? "Hide hidden entries" : "Show hidden entries"}
          size="sm"
          isIconOnly
          variant={showHiddenEntries ? "flat" : "light"}
        >
          <RiEyeOffLine />
        </Button>
      </Tooltip>
    </div>
  );
};

export default EntriesFiltersSwitch;
