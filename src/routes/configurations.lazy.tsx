import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Button, Select, SelectItem, Slider, Switch } from "@heroui/react";
import { useAppContext } from "../AppContext";
import { RiListUnordered, RiLayoutHorizontalLine, RiLayoutGridLine } from "@remixicon/react";
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";

export const Route = createLazyFileRoute("/configurations")({
  component: Configurations,
});

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="pb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-2 h-px bg-divider" />
    </div>
  );
}

export default function Configurations() {
  const { t } = useTranslation('configurations');

  const {
    handleSetCurrentFont, currentFont, currentFontSize, handleSetCurrentFontSize,
    currentFontSpace, handleSetCurrentFontSpace, currentMarkAsReadOnHover,
    handleSetMarkAsReadOnHover, currentEntryScrapeMode, handleSetCurrentEntryScrapeMode,
    currentLanguage, handleSetCurrentLanguage,
    handleSetEntriesLayout, entriesLayout, handleSetShowReadEntries, showReadEntries,
    handleSetShowHiddenEntries, showHiddenEntries,
  } = useAppContext();

  const [autostartState, setAutostartState] = useState(false);
  const [isFlatpak, setIsFlatpak] = useState(false);

  useEffect(() => {
    const loadAutostartState = async () => {
      const flatpak = await invoke<boolean>("is_flatpak");
      setIsFlatpak(flatpak);
      if (!flatpak) {
        isEnabled().then((state) => setAutostartState(state));
      }
    };
    loadAutostartState();
  }, []);

  const fonts = [
    { key: "font-garamond", label: "Garamond" },
    { key: "font-arial", label: "Arial" },
    { key: "font-tisa", label: "Tisa" },
    { key: "font-roboto", label: "Roboto" },
    { key: "font-opensans", label: "Open Sans" },
  ];

  async function handleAutostartChange() {
    if (isFlatpak) return;
    if (autostartState) {
      disable();
      setAutostartState(false);
    } else {
      enable();
      setAutostartState(true);
    }
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-screen-md mx-auto px-4">

        {/* Page header */}
        <div className="py-8">
          <h1 className="text-3xl pt-2 font-bold">{t('tabs.lookAndFeel')}</h1>
          <p className="pt-1 pb-4 text-foreground-500">
            {t('look.title')} · {t('behavior.title')} · {t('language.title')}
          </p>
        </div>

        {/* ── Look & Feel ── */}
        <section className="pb-10">
          <SectionTitle title={t('tabs.lookAndFeel')} />

          <div className="flex flex-col gap-8">
            {/* Theme */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-500 pb-3">
                {t('look.theme')}
              </h3>
              <ThemeSwitcher />
            </div>

            {/* Font family */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-500 pb-3">
                {t('look.text')}
              </h3>
              <div className="flex flex-col gap-4 max-w-xs">
                <Select
                  variant="bordered"
                  color="primary"
                  onChange={(e) => handleSetCurrentFont(e.target.value)}
                  defaultSelectedKeys={[currentFont]}
                >
                  {fonts.map((font) => (
                    <SelectItem key={font.key}>{font.label}</SelectItem>
                  ))}
                </Select>

                {/* Font size */}
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    variant={currentFontSize === 14 ? "flat" : "light"}
                    onClick={() => handleSetCurrentFontSize(14)}
                  >
                    {t('look.fontSizeSmall')}
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    variant={currentFontSize === 16 ? "flat" : "light"}
                    onClick={() => handleSetCurrentFontSize(16)}
                  >
                    {t('look.fontSizeMedium')}
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    variant={currentFontSize === 18 ? "flat" : "light"}
                    onClick={() => handleSetCurrentFontSize(18)}
                  >
                    {t('look.fontSizeBig')}
                  </Button>
                </div>

                {/* Letter spacing */}
                <Slider
                  label={t('look.fontSpace')}
                  size="sm"
                  color="primary"
                  step={0.01}
                  maxValue={0.1}
                  minValue={-0.1}
                  fillOffset={0}
                  defaultValue={0}
                  formatOptions={{ signDisplay: 'always' }}
                  value={currentFontSpace}
                  onChangeEnd={(value: number | number[]) =>
                    handleSetCurrentFontSpace(Array.isArray(value) ? value[0] : value)
                  }
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-2xl p-4 max-w-prose">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-400 pb-2">
                {t('look.example')}
              </p>
              <p className="text-sm leading-relaxed">{t('look.exampleText')}</p>
            </div>
          </div>
        </section>

        {/* ── Behavior ── */}
        <section className="pb-10">
          <SectionTitle title={t('tabs.behavior')} />

          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('behavior.markAsRead')}</p>
              </div>
              <Switch
                isSelected={currentMarkAsReadOnHover}
                onValueChange={handleSetMarkAsReadOnHover}
                color="primary"
              />
            </div>

            <div className="h-px bg-divider" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('behavior.downloadEntries')}</p>
              </div>
              <Switch
                isSelected={currentEntryScrapeMode === "ALWAYS"}
                onValueChange={(enabled) =>
                  handleSetCurrentEntryScrapeMode(enabled ? "ALWAYS" : "ON_DEMAND")
                }
                color="primary"
              />
            </div>

            <div className="h-px bg-divider" />

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isFlatpak ? "text-foreground-400" : ""}`}>
                  {isFlatpak ? t('behavior.autostartFlatpak') : t('behavior.autostart')}
                </p>
              </div>
              <Switch
                isSelected={autostartState}
                onValueChange={handleAutostartChange}
                isDisabled={isFlatpak}
                color="primary"
              />
            </div>
          </div>
        </section>

        {/* ── Entries ── */}
        <section className="pb-10">
          <SectionTitle title={t('entries.title')} />

          <div className="flex flex-col gap-5">
            {/* Layout */}
            <div>
              <p className="font-medium pb-3">{t('entries.layout')}</p>
              <div className="flex flex-col items-start gap-2">
                <Button
                  color="primary"
                  size="sm"
                  variant={entriesLayout === "list" ? "flat" : "light"}
                  onPress={() => handleSetEntriesLayout("list")}
                  startContent={<RiListUnordered />}
                >
                  {t('entries.listView')}
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  variant={entriesLayout === "compact" ? "flat" : "light"}
                  onPress={() => handleSetEntriesLayout("compact")}
                  startContent={<RiLayoutHorizontalLine />}
                >
                  {t('entries.compactView')}
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  variant={entriesLayout === "grid" ? "flat" : "light"}
                  onPress={() => handleSetEntriesLayout("grid")}
                  startContent={<RiLayoutGridLine />}
                >
                  {t('entries.gridView')}
                </Button>
              </div>
            </div>

            <div className="h-px bg-divider" />

            {/* Filters */}
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('entries.showRead')}</p>
              <Switch
                isSelected={showReadEntries}
                onValueChange={handleSetShowReadEntries}
                color="primary"
              />
            </div>

            <div className="h-px bg-divider" />

            <div className="flex items-center justify-between">
              <p className="font-medium">{t('entries.showHidden')}</p>
              <Switch
                isSelected={showHiddenEntries}
                onValueChange={handleSetShowHiddenEntries}
                color="primary"
              />
            </div>
          </div>
        </section>

        {/* ── Language ── */}
        <section className="pb-16">
          <SectionTitle title={t('tabs.language')} />

          <div className="max-w-xs">
            <Select
              label={t('language.select')}
              variant="bordered"
              color="primary"
              onChange={(e) => handleSetCurrentLanguage(e.target.value)}
              defaultSelectedKeys={[currentLanguage]}
            >
              <SelectItem key="en">English</SelectItem>
              <SelectItem key="es">Español</SelectItem>
            </Select>
          </div>
        </section>

      </div>
    </MainSectionLayout>
  );
}
