import React, { useEffect, useState } from "react";
import Header from "../Header";
import SideBar from "../SideBar";
import { AppContext } from "../../AppContext";
import { ConfigurationInterface } from "../../interfaces";
import {
  indexConfigurations,
  updateConfiguration,
} from "../../helpers/configurationsData";
import { NotificationProvider } from "../../NotificationContext";

interface ApplicationProps {
  children: React.ReactNode;
}

const ApplicationLayout: React.FC<ApplicationProps> = ({ children }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [articlesLayout, setArticlesLayout] = useState<string>("side");
  const [currentTheme, setCurrentTheme] = useState<string>("AUTO");
  const [isMobile, setIsMobile] = useState(false);
  const [configurations, setConfigurations] = useState<
    ConfigurationInterface[]
  >([]);
  const [currentFont, setCurrentFont] = useState<string>("font-opensans");
  const [currentFontSize, setCurrentFontSize] = useState<number>(16);
  const [currentFontSpace, setCurrentFontSpace] = useState<number>(0);
  const [currentMarkAsReadOnHover, setCurrentMarkAsReadOnHover] = useState<boolean>(false);

  const handleSetCurrentFont = (font: string) => {
    if (font === "") {
      return;
    }

    let configuration = configurations.find((x) => x.name === "APP_FONT");
    if (configuration && configuration.value !== font) {
      configuration.value = font;
      updateConfiguration(configuration);
    }

    setCurrentFont(font);

    const body = document.body;
    body.classList.remove(
      "font-opensans",
      "font-roboto",
      "font-arial",
      "font-tisa",
      "font-garamond",
    );
    body.classList.add(font);
  };

  const handleSetMarkAsReadOnHover = (mark_as_read_on_hover: boolean) => {
    let configuration = configurations.find((x) => x.name === "MARK_AS_READ_ON_HOVER");
    if (configuration && configuration.value !== mark_as_read_on_hover.toString()) {
      configuration.value = mark_as_read_on_hover.toString();
      updateConfiguration(configuration);
    }

    setCurrentMarkAsReadOnHover(mark_as_read_on_hover);
  };

  const handleSetCurrentFontSize = (font_size: number) => {
    let configuration = configurations.find((x) => x.name === "APP_FONT_SIZE");
    if (configuration && configuration.value !== font_size.toString()) {
      configuration.value = font_size.toString();
      updateConfiguration(configuration);
    }

    setCurrentFontSize(font_size);
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', font_size.toString() + "px");
  };

  const handleSetCurrentFontSpace = (font_space: number) => {
    let configuration = configurations.find((x) => x.name === "APP_FONT_SPACE");
    if (configuration && configuration.value !== font_space.toString()) {
      configuration.value = font_space.toString();
      updateConfiguration(configuration);
    }

    setCurrentFontSpace(font_space);
    const root = document.documentElement;
    root.style.setProperty('--letter-spacing', font_space.toString() + "em");
  };

  const checkViewport = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  const setCurrentConfigurations = async () => {
    let results = await indexConfigurations();
    setConfigurations(results);
  };

  useEffect(() => {
    setCurrentConfigurations();

    checkViewport();

    window.addEventListener("resize", checkViewport);
    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  useEffect(() => {
    getCurrentConfigTheme();
    getCurrentConfigFont();
    getCurrentConfigFontSize();
    getCurrentConfigFontSpace();
    getCurrentConfigMarkAsReadOnHover();
  }, [configurations]);

  const getCurrentConfigMarkAsReadOnHover = () => {
    let result = configurations.find((x) => x.name === "MARK_AS_READ_ON_HOVER");
    if (result) {
      handleSetMarkAsReadOnHover(result.value === "true");
    } else {
      handleSetMarkAsReadOnHover(false);
    }
  };

  const getCurrentConfigFontSpace = () => {
    let result = configurations.find((x) => x.name === "APP_FONT_SPACE");
    if (result) {
      handleSetCurrentFontSpace(Number(result.value));
    } else {
      handleSetCurrentFontSpace(0);
    }
  };

  const getCurrentConfigFontSize = () => {
    let result = configurations.find((x) => x.name === "APP_FONT_SIZE");
    if (result) {
      handleSetCurrentFontSize(Number(result.value));
    } else {
      handleSetCurrentFontSize(16);
    }
  };

  const getCurrentConfigFont = () => {
    let result = configurations.find((x) => x.name === "APP_FONT");
    if (result) {
      handleSetCurrentFont(result.value);
    } else {
      handleSetCurrentFont("font-arial");
    }
  };

  const getCurrentConfigTheme = () => {
    let result = configurations.find((x) => x.name === "THEME_MODE");
    if (result) {
      handleSetCurrentTheme(result.value);
    } else {
      handleSetCurrentTheme("AUTO");
    }
  };

  const handleSetCurrentTheme = (theme: string) => {
    let configuration = configurations.find((x) => x.name === "THEME_MODE");
    if (configuration && configuration.value !== theme) {
      configuration.value = theme;
      updateConfiguration(configuration);
    }

    setThemeClasses(theme);
    setCurrentTheme(theme);
  };

  const setThemeClasses = (theme: string) => {
    if (theme === "DARK") {
      document.body.classList.remove(
        "light",
        "text-foreground",
        "bg-background",
      );
      document.body.classList.add("dark", "text-foreground", "bg-background");
    } else if (theme === "LIGHT") {
      document.body.classList.remove(
        "dark",
        "text-foreground",
        "bg-background",
      );
      document.body.classList.add("light", "text-foreground", "bg-background");
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        setThemeClasses("DARK");
      } else {
        setThemeClasses("LIGHT");
      }

      mediaQuery.addEventListener("change", (event) => {
        if (event.matches) {
        } else {
          setThemeClasses("LIGHT");
        }
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        sideBarOpen,
        setSideBarOpen,
        articlesLayout,
        setArticlesLayout,
        currentTheme,
        handleSetCurrentTheme,
        isMobile,
        configurations,
        setConfigurations,
        currentFont,
        handleSetCurrentFont,
        currentFontSize,
        handleSetCurrentFontSize,
        currentFontSpace,
        handleSetCurrentFontSpace,
        currentMarkAsReadOnHover,
        handleSetMarkAsReadOnHover
      }}
    >
      <NotificationProvider>
        <div className="relative h-screen flex flex-col-reverse md:flex-row p-2 gap-2">
          <Header />

          <SideBar hidden={!sideBarOpen} />

          {children}
        </div>
      </NotificationProvider>
    </AppContext.Provider>
  );
};

export default ApplicationLayout;
