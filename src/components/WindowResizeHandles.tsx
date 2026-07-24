import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

type ResizeDirection =
  | "North"
  | "South"
  | "East"
  | "West"
  | "NorthEast"
  | "NorthWest"
  | "SouthEast"
  | "SouthWest";

const appWindow = getCurrentWindow();

const WindowResizeHandles: React.FC = () => {
  const startResize = async (direction: ResizeDirection) => {
    try {
      await appWindow.startResizeDragging(direction);
    } catch (error) {
      console.error("Failed to start window resize:", error);
    }
  };

  return (
    <>
      <div className="absolute top-0 left-2 right-2 h-1 z-[60] cursor-ns-resize" onMouseDown={() => startResize("North")} />
      <div className="absolute bottom-0 left-2 right-2 h-1 z-[60] cursor-ns-resize" onMouseDown={() => startResize("South")} />
      <div className="absolute left-0 top-2 bottom-2 w-1 z-[60] cursor-ew-resize" onMouseDown={() => startResize("West")} />
      <div className="absolute right-0 top-2 bottom-2 w-1 z-[60] cursor-ew-resize" onMouseDown={() => startResize("East")} />

      <div className="absolute top-0 left-0 h-3 w-3 z-[61] cursor-nwse-resize" onMouseDown={() => startResize("NorthWest")} />
      <div className="absolute top-0 right-0 h-3 w-3 z-[61] cursor-nesw-resize" onMouseDown={() => startResize("NorthEast")} />
      <div className="absolute bottom-0 left-0 h-3 w-3 z-[61] cursor-nesw-resize" onMouseDown={() => startResize("SouthWest")} />
      <div className="absolute bottom-0 right-0 h-3 w-3 z-[61] cursor-nwse-resize" onMouseDown={() => startResize("SouthEast")} />
    </>
  );
};

export default WindowResizeHandles;
