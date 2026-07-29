import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { RiCheckLine, RiEyeOffLine } from "@remixicon/react";
import { useAppContext } from "../AppContext";
import { useTranslation } from "react-i18next";

const EntriesFiltersSwitch: React.FC = () => {
  const {
    showReadEntries,
    setShowReadEntries,
    showHiddenEntries,
    setShowHiddenEntries,
  } = useAppContext();
  const { t } = useTranslation("entries");

  return (
    <div className="flex items-center gap-2 justify-end">
      <Tooltip
        content={showReadEntries ? t("hideRead") : t("showRead")}
      >
        <Button
          onPress={() => setShowReadEntries((prev) => !prev)}
          color={showReadEntries ? "primary" : "default"}
          aria-label={showReadEntries ? t("hideRead") : t("showRead")}
          size="sm"
          isIconOnly
          variant={showReadEntries ? "flat" : "light"}
        >
          <RiCheckLine />
        </Button>
      </Tooltip>

      <Tooltip
        content={showHiddenEntries ? t("hideHidden") : t("showHidden")}
      >
        <Button
          onPress={() => setShowHiddenEntries((prev) => !prev)}
          color={showHiddenEntries ? "primary" : "default"}
          aria-label={showHiddenEntries ? t("hideHidden") : t("showHidden")}
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
