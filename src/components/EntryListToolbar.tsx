import { useState } from "react";
import { Button, ButtonGroup, Divider, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@heroui/react";
import {
  RiCheckDoubleLine,
  RiLayoutGridLine,
  RiLayoutHorizontalLine,
  RiListUnordered,
  RiRefreshLine,
  RiSettings3Line,
  RiSortAsc,
  RiSortDesc,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext";

export interface EntryListToolbarAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  color?: "default" | "danger";
}

interface EntryListToolbarProps {
  onReload: () => void;
  reloadLoading?: boolean;
  onMarkAllAsRead: () => void;
  extraActions?: EntryListToolbarAction[];
}

const EntryListToolbar: React.FC<EntryListToolbarProps> = ({
  onReload,
  reloadLoading = false,
  onMarkAllAsRead,
  extraActions = [],
}) => {
  const { t } = useTranslation("entries");
  const { entriesLayout, handleSetEntriesLayout, entriesOrder, handleSetEntriesOrder } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const layouts = [
    { key: "list", label: t("listView"), icon: <RiListUnordered className="w-4 h-4" /> },
    { key: "compact", label: t("compactView"), icon: <RiLayoutHorizontalLine className="w-4 h-4" /> },
    { key: "grid", label: t("gridView"), icon: <RiLayoutGridLine className="w-4 h-4" /> },
  ];

  const orders = [
    { key: "desc" as const, label: t("newestFirst"), icon: <RiSortDesc className="w-4 h-4" /> },
    { key: "asc" as const, label: t("oldestFirst"), icon: <RiSortAsc className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-1">
      <Tooltip content={t("reload")}>
        <Button
          isIconOnly
          variant="light"
          onPress={onReload}
          isLoading={reloadLoading}
          aria-label={t("reload")}
          className="text-foreground-500"
        >
          <RiRefreshLine className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("markAllAsRead")}>
        <Button
          isIconOnly
          variant="light"
          onPress={onMarkAllAsRead}
          aria-label={t("markAllAsRead")}
          className="text-foreground-500"
        >
          <RiCheckDoubleLine className="w-5 h-5" />
        </Button>
      </Tooltip>

      <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button isIconOnly variant="light" aria-label={t("listSettings")} title={t("listSettings")} className="text-foreground-500">
            <RiSettings3Line className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-3 items-stretch gap-3 w-72">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase text-foreground-500">{t("layout")}</span>
            <ButtonGroup fullWidth size="sm" variant="flat">
              {layouts.map((l) => (
                <Button
                  key={l.key}
                  isIconOnly
                  aria-label={l.label}
                  title={l.label}
                  color={entriesLayout === l.key ? "primary" : "default"}
                  onPress={() => handleSetEntriesLayout(l.key)}
                >
                  {l.icon}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase text-foreground-500">{t("sortOrder")}</span>
            <ButtonGroup fullWidth size="sm" variant="flat">
              {orders.map((o) => (
                <Button
                  key={o.key}
                  startContent={o.icon}
                  color={entriesOrder === o.key ? "primary" : "default"}
                  onPress={() => handleSetEntriesOrder(o.key)}
                >
                  {o.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          {extraActions.length > 0 && (
            <>
              <Divider />
              <div className="flex flex-col gap-1">
                {extraActions.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant="light"
                    color={action.color ?? "default"}
                    className="justify-start"
                    startContent={action.icon}
                    fullWidth
                    onPress={() => {
                      setIsOpen(false);
                      action.onPress();
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EntryListToolbar;
