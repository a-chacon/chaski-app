import React from "react";
import { Button } from "@heroui/react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();


const WindowTitlebar: React.FC = () => {
  return (
    <div className="h-10 border-b border-default-200/70 bg-background/90 backdrop-blur px-1.5 flex items-center select-none">
      <div
        data-tauri-drag-region
        className="flex-1 h-full flex items-center px-2 text-sm text-foreground-600"
      >
        <span data-tauri-drag-region className="font-medium text-primary-500">
          Chaski
        </span>
      </div>

      <div className="flex items-center gap-1 text-primary-500">
        <Button
          color="primary"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => appWindow.minimize()}
        >
          —
        </Button>
        <Button
          color="primary"
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => appWindow.toggleMaximize()}
        >
          □
        </Button>
        <Button
          color="primary"
          variant="light"
          isIconOnly
          size="sm"
          className={`hover:bg-danger/20 hover:text-danger`}
          onPress={() => appWindow.close()}
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

export default WindowTitlebar;
