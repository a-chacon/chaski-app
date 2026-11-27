import { Button, Popover, PopoverContent, PopoverTrigger, Slider } from "@heroui/react";
import { RiAddLine, RiFontSize, RiSubtractLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext";
import ContentWidthControl from "./ContentWidthControl";
import { fonts } from "../helpers/fonts";

interface EntryFontSettingsProps {
  className?: string;
  buttonSize?: "sm" | "md";
  iconSize?: number;
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 28;

const EntryFontSettings: React.FC<EntryFontSettingsProps> = ({
  className,
  buttonSize = "sm",
  iconSize = 18,
}) => {
  const { t } = useTranslation(["entries", "configurations"]);
  const {
    currentFont,
    handleSetCurrentFont,
    currentFontSize,
    handleSetCurrentFontSize,
    currentFontSpace,
    handleSetCurrentFontSpace,
  } = useAppContext();

  const [spacing, setSpacing] = useState(currentFontSpace);

  useEffect(() => {
    setSpacing(currentFontSpace);
  }, [currentFontSpace]);

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          color="default"
          variant="light"
          isIconOnly
          size={buttonSize}
          aria-label={t("entries:textSettings")}
          title={t("entries:textSettings")}
          className={className}
        >
          <RiFontSize size={iconSize} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 items-stretch gap-3 w-72">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase text-foreground-500">
            {t("configurations:look.text")}
          </span>
          <div className="flex flex-col gap-1">
            {fonts.map((font) => (
              <Button
                key={font.key}
                size="sm"
                variant={currentFont === font.key ? "flat" : "light"}
                color={currentFont === font.key ? "primary" : "default"}
                className={`justify-start ${font.key}`}
                fullWidth
                onPress={() => handleSetCurrentFont(font.key)}
              >
                {font.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            aria-label={t("entries:decreaseFontSize")}
            isDisabled={currentFontSize <= MIN_FONT_SIZE}
            onPress={() => handleSetCurrentFontSize(Math.max(MIN_FONT_SIZE, currentFontSize - 1))}
          >
            <RiSubtractLine size={16} />
          </Button>
          <span className="text-sm font-medium tabular-nums">{currentFontSize}px</span>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            aria-label={t("entries:increaseFontSize")}
            isDisabled={currentFontSize >= MAX_FONT_SIZE}
            onPress={() => handleSetCurrentFontSize(Math.min(MAX_FONT_SIZE, currentFontSize + 1))}
          >
            <RiAddLine size={16} />
          </Button>
        </div>

        <ContentWidthControl />

        <Slider
          label={t("configurations:look.fontSpace")}
          size="sm"
          color="primary"
          step={0.01}
          maxValue={0.1}
          minValue={-0.1}
          fillOffset={0}
          formatOptions={{ signDisplay: "always" }}
          value={spacing}
          onChange={(value: number | number[]) =>
            setSpacing(Array.isArray(value) ? value[0] : value)
          }
          onChangeEnd={(value: number | number[]) =>
            handleSetCurrentFontSpace(Array.isArray(value) ? value[0] : value)
          }
        />
      </PopoverContent>
    </Popover>
  );
};

export default EntryFontSettings;
