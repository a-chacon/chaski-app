import React from "react";
import { useAppContext } from "../AppContext";
import { Button, Tooltip } from "@heroui/react";
import { RiLayoutGridLine, RiListUnordered, RiLayoutHorizontalLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";

const EntryLayoutSwitch: React.FC = () => {
  const { entriesLayout, setEntriesLayout } = useAppContext();
  const { t } = useTranslation("entries");

  return (
    <div className="flex items-center gap-2 justify-end">
      <Tooltip content={t("listView")}>
        <Button
          onPress={() => setEntriesLayout("list")}
          color={entriesLayout === "list" ? "primary" : "default"}
          aria-label="List View"
          size="sm"
          isIconOnly
          variant={entriesLayout === "list" ? "flat" : "light"}
        >
          <RiListUnordered></RiListUnordered>
        </Button>
      </Tooltip>
      <Tooltip content={t("compactView")}>
        <Button
          onPress={() => setEntriesLayout("compact")}
          color={entriesLayout === "compact" ? "primary" : "default"}
          variant={entriesLayout === "compact" ? "flat" : "light"}
          aria-label="Compact View"
          isIconOnly
          size="sm"
        >
          <RiLayoutHorizontalLine></RiLayoutHorizontalLine>
        </Button>
      </Tooltip>
      <Tooltip content={t("gridView")}>
        <Button
          onPress={() => setEntriesLayout("grid")}
          color={entriesLayout === "grid" ? "primary" : "default"}
          variant={entriesLayout === "grid" ? "flat" : "light"}
          aria-label="Grid View"
          isIconOnly
          size="sm"
        >
          <RiLayoutGridLine></RiLayoutGridLine>
        </Button>
      </Tooltip>
    </div>
  );
};

export default EntryLayoutSwitch;
