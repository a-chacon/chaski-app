import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Tabs, Tab, Card, CardBody, Button, Select, SelectItem, Slider, Switch } from "@nextui-org/react";
import { useAppContext } from "../AppContext";
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
export const Route = createLazyFileRoute("/configurations")({
  component: Configurations,
});
import { useEffect, useState } from "react";

export default function Configurations() {
  const {
    currentTheme,
    handleSetCurrentTheme,
    handleSetCurrentFont,
    currentFont,
    currentFontSize,
    handleSetCurrentFontSize,
    currentFontSpace,
    handleSetCurrentFontSpace,
    currentMarkAsReadOnHover,
    handleSetMarkAsReadOnHover
  } = useAppContext();

  const [autostartState, setAutostartState] = useState(false);

  useEffect(() => {
    isEnabled().then((state) => {
      setAutostartState(state)
    })
  }, []);

  const fonts = [
    { key: "font-garamond", label: "Garamond" },
    { key: "font-arial", label: "Arial" },
    { key: "font-tisa", label: "Tisa" },
    { key: "font-roboto", label: "Roboto" },
    { key: "font-opensans", label: "Open Sans" },
  ]

  async function handleAutostartChange() {
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
      <div className="max-w-lg mx-auto my-20">
        <Tabs
          aria-label="Options"
          isVertical={true}
          color="secondary"
          variant="underlined"
        >
          <Tab key="look" title="Look and Feel">
            <Card>
              <CardBody className="bg-background">
                <h1 className="text-xl font-semibold pb-2 text-center">
                  Look And Feel
                </h1>
                <div>
                  <h3 className="py-2 font-semibold">Theme</h3>
                  <div className="flex flex-wrap gap-4 items-center justify-start">
                    <Button
                      color="primary"
                      variant={currentTheme === "DARK" ? "flat" : "light"}
                      onClick={() => handleSetCurrentTheme("DARK")}
                    >
                      Dark
                    </Button>
                    <Button
                      color="primary"
                      variant={currentTheme === "AUTO" ? "flat" : "light"}
                      onClick={() => handleSetCurrentTheme("AUTO")}
                    >
                      auto
                    </Button>
                    <Button
                      color="primary"
                      variant={currentTheme === "LIGHT" ? "flat" : "light"}
                      onClick={() => handleSetCurrentTheme("LIGHT")}
                    >
                      Light
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="py-2 font-semibold">Text</h3>
                  <div className="flex w-full max-w-xs flex-col gap-2">
                    <Select
                      variant="underlined"
                      color="primary"
                      className="max-w-xs py-3"
                      onChange={(e) => handleSetCurrentFont(e.target.value)}
                      defaultSelectedKeys={[currentFont]}
                    >
                      {fonts.map((font) => (
                        <SelectItem key={font.key}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </Select>
                    <div className="flex flex-wrap gap-4 items-center justify-start">
                      <Button
                        color="primary"
                        variant={currentFontSize === 14 ? "flat" : "light"}
                        onClick={() => handleSetCurrentFontSize(14)}
                      >
                        small
                      </Button>
                      <Button
                        color="primary"
                        variant={currentFontSize === 16 ? "flat" : "light"}
                        onClick={() => handleSetCurrentFontSize(16)}
                      >
                        medium
                      </Button>
                      <Button
                        color="primary"
                        variant={currentFontSize === 18 ? "flat" : "light"}
                        onClick={() => handleSetCurrentFontSize(18)}
                      >
                        big
                      </Button>
                    </div>
                    <Slider
                      label="Font Space"
                      size="sm"
                      color="primary"
                      step={0.01}
                      maxValue={0.1}
                      minValue={-0.1}
                      fillOffset={0}
                      defaultValue={0}
                      className="max-w-xs py-3"
                      formatOptions={{ signDisplay: 'always' }}
                      value={currentFontSpace}
                      onChangeEnd={(value: number | number[]) => handleSetCurrentFontSpace(Array.isArray(value) ? value[0] : value)}
                    />
                  </div>
                  <div className="m-2 p-2 border rounded-xl">
                    <h5 className="font-semibold text-xl">Example</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong>Integer ut dui at turpis pretium sagittis. </strong>Fusce quis vehicula eros, id dapibus magna. Praesent efficitur a tellus at mattis.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="Behavior" title="Behavior">
            <Card>
              <CardBody className="bg-background">
                <h1 className="text-xl font-semibold pb-4 text-center">
                  Behavior
                </h1>
                <div>
                  <Switch isSelected={currentMarkAsReadOnHover} onValueChange={handleSetMarkAsReadOnHover} >
                    Mark as Read on hover.
                  </Switch>
                  <Switch isSelected={autostartState} onValueChange={handleAutostartChange} >
                    Autostart Application
                  </Switch>

                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </MainSectionLayout >
  );
}
