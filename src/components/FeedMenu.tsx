import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@heroui/react";
import { RiDownload2Line, RiMore2Line, RiUpload2Line } from "@remixicon/react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext";
import { exportOPML, importOPML } from "../helpers/feedsData";

interface FeedMenuProps {
  iconSize?: number;
}

export default function FeedMenu({ iconSize = 18 }: FeedMenuProps) {
  const { t } = useTranslation("sidebar");
  const { currentAccount } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!currentAccount?.id) return null;

  const accountId = currentAccount.id;

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const file = await open({
        multiple: false,
        directory: false,
        filters: [{ name: "OPML", extensions: ["opml", "xml"] }],
      });
      if (file) {
        setIsOpen(false);
        await importOPML(accountId, file);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const file = await save({
        defaultPath: `${currentAccount.name}.opml`,
        filters: [{ name: "OPML", extensions: ["opml"] }],
      });
      if (file) {
        setIsOpen(false);
        await exportOPML(accountId, file);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content={t("feedMenu")} delay={300}>
        <div>
          <PopoverTrigger>
            <Button isIconOnly variant="light" aria-label={t("feedMenu")} className="text-foreground-500">
              <RiMore2Line size={iconSize} />
            </Button>
          </PopoverTrigger>
        </div>
      </Tooltip>
      <PopoverContent>
        <div className="flex flex-col gap-1 p-1 w-44">
          {currentAccount.kind === "local" && (
            <Button
              variant="light"
              className="justify-start"
              startContent={<RiDownload2Line size={16} />}
              isLoading={isImporting}
              onPress={handleImport}
            >
              {t("importOpml")}
            </Button>
          )}
          <Button
            variant="light"
            className="justify-start"
            startContent={<RiUpload2Line size={16} />}
            isLoading={isExporting}
            onPress={handleExport}
          >
            {t("exportOpml")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
