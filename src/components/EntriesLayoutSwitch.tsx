import React from "react";
import { useAppContext } from "../AppContext";
import { Button } from "@heroui/react";

import { RiLayoutGridLine, RiListUnordered, RiLayoutHorizontalLine } from '@remixicon/react'


const EntryLayoutSwitch: React.FC = () => {
  const { entriesLayout, setEntriesLayout } = useAppContext();

  return (
    <div className="flex items-center gap-2 justify-end pt-4">
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
    </div>
  );
};

export default EntryLayoutSwitch;
