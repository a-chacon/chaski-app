import React, { useEffect, useState } from "react";
import SideBar from "../SideBar";
import { AppContext } from "../../AppContext";
import { AccountInterface, ConfigurationInterface } from "../../interfaces";
import { load } from '@tauri-apps/plugin-store';
import FeedbackModal from "../FeedbackModal";
import WindowTitlebar from "../WindowTitlebar";
import { indexAccounts } from "../../helpers/accountsData";
import { useDisclosure } from "@heroui/react";
import {
  indexConfigurations,
  updateConfiguration,
} from "../../helpers/configurationsData";
import { NotificationProvider, useNotification } from "../../NotificationContext";
import { Alert, Button } from "@heroui/react";
import updater from "../../helpers/updater";

interface ApplicationProps {
  children: React.ReactNode;
}

const UpdaterBootstrap: React.FC = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    updater(addNotification);
  }, [addNotification]);

  return null;
};

const ApplicationLayout: React.FC<ApplicationProps> = ({ children }) => {
  const [sideBarOpen, setSideBarOpen] = useState(true);
  const [entriesLayout, setEntriesLayout] = useState<string>("list");
  const [currentTheme, setCurrentTheme] = useState<string>("AUTO");
  const [isMobile, setIsMobile] = useState(false);
  const [configurations, setConfigurations] = useState<
    ConfigurationInterface[]
  >([]);
  const [accounts, setAccounts] = useState<
    AccountInterface[]>([]);
  const [currentAccount, setCurrentAccount] = useState<AccountInterface | null>(null);
  const [persistedCurrentAccountId, setPersistedCurrentAccountId] = useState<number | null>(null);
  const [currentFont, setCurrentFont] = useState<string>("font-opensans");
  const [currentFontSize, setCurrentFontSize] = useState<number>(16);
  const [currentFontSpace, setCurrentFontSpace] = useState<number>(0);
  const [currentMarkAsReadOnHover, setCurrentMarkAsReadOnHover] = useState<boolean>(false);
  const [currentEntryScrapeMode, setCurrentEntryScrapeMode] = useState<string>("ON_DEMAND");
  const [showFeedbackAlert, setShowFeedbackAlert] = useState<boolean>(false);
  const feedbackModalState = useDisclosure();
  const isTauriApp = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

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

  const handleSetCurrentEntryScrapeMode = (mode: string) => {
    let configuration = configurations.find((x) => x.name === "ENTRY_SCRAPE_MODE");
    if (configuration && configuration.value !== mode) {
      configuration.value = mode;
      updateConfiguration(configuration);
    }

    setCurrentEntryScrapeMode(mode);
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
    const mobileViewport = window.innerWidth < 768;
    setIsMobile(mobileViewport);
  };

  const setCurrentConfigurations = async () => {
    let results = await indexConfigurations();
    setConfigurations(results);
  };

  useEffect(() => {
    setCurrentConfigurations();
    getCurrentAccounts();
    getPersistedCurrentAccountId();

    const mobileViewport = window.innerWidth < 768;
    setIsMobile(mobileViewport);
    setSideBarOpen(!mobileViewport);

    const feedbackTimer = setTimeout(() => {
      setShowFeedbackAlert(true);
    }, 30 * 60 * 1000); // 30 minutes

    window.addEventListener("resize", checkViewport);
    return () => {
      window.removeEventListener("resize", checkViewport);
      clearTimeout(feedbackTimer);
    };
  }, []);

  useEffect(() => {
    getCurrentConfigTheme();
    getCurrentConfigFont();
    getCurrentConfigFontSize();
    getCurrentConfigFontSpace();
    getCurrentConfigMarkAsReadOnHover();
    getCurrentConfigEntryScrapeMode();
  }, [configurations]);

  const getCurrentAccounts = async () => {
    try {
      const accountResponse = await indexAccounts()
      setAccounts(accountResponse);
    } catch (error) {
      console.error("Error fetching feeds:", error);
    }
  };

  const getPersistedCurrentAccountId = async () => {
    const store = await load('settings.json', { autoSave: true });
    const persistedAccount = await store.get<{ value: number | null }>('current-account-id');

    if (typeof persistedAccount?.value === "number") {
      setPersistedCurrentAccountId(persistedAccount.value);
      return;
    }

    setPersistedCurrentAccountId(null);
  };

  const getCurrentConfigMarkAsReadOnHover = () => {
    let result = configurations.find((x) => x.name === "MARK_AS_READ_ON_HOVER");
    if (result) {
      handleSetMarkAsReadOnHover(result.value === "true");
    } else {
      handleSetMarkAsReadOnHover(false);
    }
  };

  const getCurrentConfigEntryScrapeMode = () => {
    let result = configurations.find((x) => x.name === "ENTRY_SCRAPE_MODE");
    if (result) {
      handleSetCurrentEntryScrapeMode(result.value);
    } else {
      handleSetCurrentEntryScrapeMode("ON_DEMAND");
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

  const getCurrentConfigTheme = async () => {
    const store = await load('settings.json', { autoSave: false });
    const currentTheme = await store.get<{ value: string }>('theme');
    handleSetCurrentTheme(currentTheme!.value);
  };

  useEffect(() => {
    if (accounts.length === 0) {
      setCurrentAccount(null);
      return;
    }

    const currentAccountStillExists = !!currentAccount &&
      accounts.some((account) => account.id === currentAccount.id);

    if (currentAccountStillExists) {
      return;
    }

    const persistedAccount = accounts.find((account) => account.id === persistedCurrentAccountId);

    if (persistedAccount) {
      setCurrentAccount(persistedAccount);
      return;
    }

    setCurrentAccount(accounts[0]);
  }, [accounts, currentAccount, persistedCurrentAccountId]);

  useEffect(() => {
    const persistCurrentAccount = async () => {
      const store = await load('settings.json', { autoSave: true });
      await store.set('current-account-id', { value: currentAccount?.id ?? null });
    };

    persistCurrentAccount();
  }, [currentAccount]);

  const handleSetCurrentTheme = async (newTheme: string) => {
    const store = await load('settings.json', { autoSave: true });
    const currentTheme = await store.get<{ value: string }>('theme');
    await store.set('theme', { value: newTheme });

    setThemeClasses(newTheme, currentTheme!.value);
    setCurrentTheme(newTheme);
  };

  const setThemeClasses = (newTheme: string, oldTheme: string) => {
    document.body.classList.remove(
      oldTheme
    );
    document.body.classList.add(newTheme);
  };

  return (
    <AppContext.Provider
      value={{
        sideBarOpen,
        setSideBarOpen,
        entriesLayout,
        setEntriesLayout,
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
        handleSetMarkAsReadOnHover,
        currentEntryScrapeMode,
        handleSetCurrentEntryScrapeMode,
        setAccounts,
        accounts,
        currentAccount,
        setCurrentAccount
      }}
    >
      <NotificationProvider>
        <UpdaterBootstrap />

        <div className="h-screen ">
          <div className="relative h-full rounded-2xl bg-background overflow-hidden flex flex-col shadow-xl">
            {isTauriApp && <WindowTitlebar />}

            <div className="relative min-h-0 flex-1 flex gap-2">
              {sideBarOpen && (
                <div className="relative h-full w-full md:w-3/5 lg:w-2/5 xl:w-1/5">
                  <SideBar />
                </div>
              )}

              {children}
              {showFeedbackAlert && (
                <div className="fixed bottom-4 right-4 z-50">
                  <Alert
                    color="warning"
                    description="You've been using the application for a while. Would you like to give us your feedback?"
                    endContent={
                      <div className="flex gap-2">
                        <Button
                          color="warning"
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            feedbackModalState.onOpen();
                            setShowFeedbackAlert(false);
                          }}
                        >
                          Give feedback
                        </Button>
                        <Button
                          color="default"
                          size="sm"
                          variant="flat"
                          onPress={() => setShowFeedbackAlert(false)}
                        >
                          Cerrar
                        </Button>
                      </div>
                    }
                    title="How is your experience going?"
                    variant="faded"
                  />
                </div>
              )}
              <FeedbackModal
                isOpen={feedbackModalState.isOpen}
                onOpenChange={feedbackModalState.onOpenChange}
              />
            </div>
          </div>
        </div>
      </NotificationProvider>
    </AppContext.Provider>
  );
};

export default ApplicationLayout;
