import { useEffect, useState } from "react";
import { Button, Chip, Switch } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useKeybindings } from "../keyboard/KeyboardProvider";
import { ACTION_IDS, ActionId, eventToBinding, formatKey } from "../keyboard/keybindings";

export default function KeybindingsSettings() {
  const { t } = useTranslation("configurations");
  const { enabled, setEnabled, bindings, addBinding, removeBinding, resetBindings } = useKeybindings();
  const [capturing, setCapturing] = useState<ActionId | null>(null);

  useEffect(() => {
    if (!capturing || !enabled) return;

    // Capture phase + stopPropagation keeps the global shortcuts from firing meanwhile.
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        setCapturing(null);
        return;
      }

      const binding = eventToBinding(event);
      if (!binding) return;
      addBinding(capturing, binding);
      setCapturing(null);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [capturing, enabled, addBinding]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground-500">{t("keyboard.description")}</p>

      <div className="flex items-center justify-between">
        <p className="font-medium">{t("keyboard.enable")}</p>
        <Switch
          isSelected={enabled}
          onValueChange={(value) => {
            setCapturing(null);
            setEnabled(value);
          }}
          color="primary"
          aria-label={t("keyboard.enable")}
        />
      </div>

      {enabled && <div className="h-px bg-divider" />}

      {enabled && ACTION_IDS.map((id) => (
        <div key={id} className="flex items-center justify-between gap-4 flex-wrap">
          <p className="font-medium">{t(`keyboard.actions.${id}`)}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {bindings[id].map((key) => (
              <Chip key={key} size="sm" variant="flat" onClose={() => removeBinding(id, key)}>
                {formatKey(key)}
              </Chip>
            ))}
            <Button
              size="sm"
              variant={capturing === id ? "flat" : "light"}
              color="primary"
              onPress={() => setCapturing(capturing === id ? null : id)}
            >
              {capturing === id ? t("keyboard.pressKey") : t("keyboard.add")}
            </Button>
          </div>
        </div>
      ))}

      {enabled && (
        <div>
          <Button size="sm" variant="light" color="danger" onPress={resetBindings}>
            {t("keyboard.reset")}
          </Button>
        </div>
      )}
    </div>
  );
}
