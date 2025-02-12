import React from 'react';
import {
  Button,
} from "@heroui/react";
import { RiMoonLine, RiSunLine } from '@remixicon/react';
import { useAppContext } from "../AppContext";

const ThemeSwitcher = () => {
  const {
    currentTheme,
    handleSetCurrentTheme,
  } = useAppContext();

  const colors = ['orange', 'green', 'red', 'blue', 'purple', 'yellow'];

  const lightColors = colors.map(color => `${color}-light`);
  const darkColors = colors.map(color => `${color}-dark`);

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex gap-2">
        {lightColors.map((color) => (
          <React.Fragment key={color}>
            <Button
              className={color}
              color="primary"
              size="sm"
              variant={currentTheme === color ? 'flat' : 'light'}
              onPress={() => handleSetCurrentTheme(color)}
              isIconOnly
            >
              <RiSunLine />
            </Button>
          </React.Fragment>
        ))}
      </div>

      <div className="flex gap-2">
        {darkColors.map((color) => (
          <React.Fragment key={color}>
            <Button
              className={color}
              color="primary"
              size="sm"
              variant={currentTheme === color ? 'flat' : 'light'}
              onPress={() => handleSetCurrentTheme(color)}
              isIconOnly
            >
              <RiMoonLine />
            </Button>
          </React.Fragment>
        ))}
      </div>

    </div>
  );
};

export default ThemeSwitcher;

