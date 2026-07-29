import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Tabs, Tab, Card, CardBody, Button, Select, SelectItem, Slider, Switch } from "@heroui/react";
import { useAppContext } from "../AppContext";
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { useTranslation } from 'react-i18next';

export const Route = createLazyFileRoute("/configurations")({
  component: Configurations,
});

import { useEffect, useState } from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function Configurations() {
  const { t } = useTranslation('configurations');

  const {
    handleSetCurrentFont, currentFont, currentFontSize, handleSetCurrentFontSize,
    currentFontSpace, handleSetCurrentFontSpace, currentMarkAsReadOnHover,
    handleSetMarkAsReadOnHover, currentEntryScrapeMode, handleSetCurrentEntryScrapeMode,
    currentLanguage, handleSetCurrentLanguage,
  } = useAppContext();

  const [autostartState, setAutostartState] = useState(false);

  useEffect(() => {
    isEnabled().then((state) => { setAutostartState(state); });
  }, []);

  const fonts = [
    { key: "font-garamond", label: "Garamond" },
    { key: "font-arial", label: "Arial" },
    { key: "font-tisa", label: "Tisa" },
    { key: "font-roboto", label: "Roboto" },
    { key: "font-opensans", label: "Open Sans" },
  ];

  async function handleAutostartChange() {
    if (autostartState) { disable(); setAutostartState(false); }
    else { enable(); setAutostartState(true); }
  }

  return (
    <MainSectionLayout>
      <div className="m-20 max-w-prose">
        <Tabs aria-label="Options" isVertical={true} color="primary">
          <Tab key="look" title={t('tabs.lookAndFeel')}>
            <Card>
              <CardBody>
                <h1 className="text-xl font-semibold pb-2 text-center">{t('look.title')}</h1>
                <div className="pb-4">
                  <h3 className="pb-4 font-semibold text-lg">{t('look.theme')}</h3>
                  <ThemeSwitcher />
                </div>
                <div>
                  <h3 className="py-2 font-semibold text-lg">{t('look.text')}</h3>
                  <div className="flex w-full max-w-xs flex-col gap-2">
                    <Select variant="underlined" color="primary" className="max-w-xs py-3"
                      onChange={(e) => handleSetCurrentFont(e.target.value)} defaultSelectedKeys={[currentFont]}>
                      {fonts.map((font) => (<SelectItem key={font.key}>{font.label}</SelectItem>))}
                    </Select>
                    <div className="flex flex-wrap gap-4 items-center justify-start">
                      <Button color="primary" variant={currentFontSize === 14 ? "flat" : "light"} onClick={() => handleSetCurrentFontSize(14)}>{t('look.fontSizeSmall')}</Button>
                      <Button color="primary" variant={currentFontSize === 16 ? "flat" : "light"} onClick={() => handleSetCurrentFontSize(16)}>{t('look.fontSizeMedium')}</Button>
                      <Button color="primary" variant={currentFontSize === 18 ? "flat" : "light"} onClick={() => handleSetCurrentFontSize(18)}>{t('look.fontSizeBig')}</Button>
                    </div>
                    <Slider label={t('look.fontSpace')} size="sm" color="primary" step={0.01} maxValue={0.1} minValue={-0.1}
                      fillOffset={0} defaultValue={0} className="max-w-xs py-3" formatOptions={{ signDisplay: 'always' }}
                      value={currentFontSpace} onChangeEnd={(value: number | number[]) => handleSetCurrentFontSpace(Array.isArray(value) ? value[0] : value)} />
                  </div>
                  <div className="m-2 p-2 border rounded-xl">
                    <h5 className="font-semibold text-xl">{t('look.example')}</h5>
                    <p>{t('look.exampleText')}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="Behavior" title={t('tabs.behavior')}>
            <Card>
              <CardBody>
                <h1 className="text-xl font-semibold pb-4 text-center">{t('behavior.title')}</h1>
                <div className="flex flex-col gap-4">
                  <Switch isSelected={currentMarkAsReadOnHover} onValueChange={handleSetMarkAsReadOnHover}>{t('behavior.markAsRead')}</Switch>
                  <Switch isSelected={currentEntryScrapeMode === "ALWAYS"} onValueChange={(enabled) => handleSetCurrentEntryScrapeMode(enabled ? "ALWAYS" : "ON_DEMAND")}>
                    {t('behavior.downloadEntries')}
                  </Switch>
                  <Switch isSelected={autostartState} onValueChange={handleAutostartChange}>{t('behavior.autostart')}</Switch>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="language" title={t('tabs.language')}>
            <Card>
              <CardBody>
                <h1 className="text-xl font-semibold pb-4 text-center">{t('language.title')}</h1>
                <Select
                  label={t('language.select')}
                  variant="underlined"
                  color="primary"
                  className="max-w-xs"
                  onChange={(e) => handleSetCurrentLanguage(e.target.value)}
                  defaultSelectedKeys={[currentLanguage]}
                >
                  <SelectItem key="en">English</SelectItem>
                  <SelectItem key="es">Español</SelectItem>
                </Select>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </MainSectionLayout>
  );
}
