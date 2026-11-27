import { Button, ButtonGroup } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../AppContext";

interface ContentWidthControlProps {
  className?: string;
}

const ContentWidthControl: React.FC<ContentWidthControlProps> = ({ className }) => {
  const { t } = useTranslation("configurations");
  const { contentWidth, handleSetContentWidth, isMobile } = useAppContext();

  // On mobile the content always uses the full screen width.
  if (isMobile) return null;

  const widths = [
    { key: 640, label: t("look.widthNarrow") },
    { key: 768, label: t("look.widthMedium") },
    { key: 1024, label: t("look.widthWide") },
  ];

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-semibold uppercase text-foreground-500">
        {t("look.contentWidth")}
      </span>
      <ButtonGroup fullWidth size="sm" variant="flat">
        {widths.map((w) => (
          <Button
            key={w.key}
            color={contentWidth === w.key ? "primary" : "default"}
            onPress={() => handleSetContentWidth(w.key)}
          >
            {w.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default ContentWidthControl;
