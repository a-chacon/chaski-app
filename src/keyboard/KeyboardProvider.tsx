import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tinykeys } from "tinykeys";
import { useRouter } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import {
  ACTION_IDS,
  ActionId,
  Bindings,
  DEFAULT_BINDINGS,
  loadBindings,
  saveBindings,
} from "./keybindings";
import { focusZone, moveFocus, scrollPage } from "./navigation";

interface KeyboardContextType {
  bindings: Bindings;
  addBinding: (action: ActionId, key: string) => void;
  removeBinding: (action: ActionId, key: string) => void;
  resetBindings: () => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export const useKeybindings = () => {
  const context = useContext(KeyboardContext);
  if (!context) throw new Error("useKeybindings must be used within a KeyboardProvider");
  return context;
};

function shouldIgnore(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return true;

  const target = event.target as HTMLElement | null;
  if (target) {
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
      return true;
    }
  }

  // An open modal, menu or listbox owns the keyboard.
  return !!document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]');
}

export const KeyboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setSideBarOpen, isMobile } = useAppContext();
  const router = useRouter();
  const [bindings, setBindings] = useState<Bindings>(DEFAULT_BINDINGS);

  useEffect(() => {
    loadBindings().then(setBindings).catch(() => { });
  }, []);

  const update = (next: Bindings) => {
    setBindings(next);
    saveBindings(next);
  };

  const addBinding = (action: ActionId, key: string) => {
    const next = { ...bindings };
    // A key can only trigger one action: take it away from any other.
    for (const id of ACTION_IDS) {
      next[id] = next[id].filter((k) => k !== key);
    }
    next[action] = [...next[action], key];
    update(next);
  };

  const removeBinding = (action: ActionId, key: string) => {
    update({ ...bindings, [action]: bindings[action].filter((k) => k !== key) });
  };

  const resetBindings = () => update({ ...DEFAULT_BINDINGS });

  useEffect(() => {
    if (isMobile) return;

    const handlers: Record<ActionId, (event: KeyboardEvent) => void> = {
      "nav.next": () => moveFocus(1),
      "nav.prev": () => moveFocus(-1),
      "focus.sidebar": () => {
        setSideBarOpen(true);
        // Give the sidebar a moment to mount/show when it was collapsed.
        setTimeout(() => focusZone("sidebar"), 50);
      },
      "focus.main": () => focusZone("main"),
      "scroll.down": () => scrollPage(1),
      "scroll.up": () => scrollPage(-1),
      back: () => router.history.back(),
      "sidebar.toggle": () => setSideBarOpen((prev) => !prev),
    };

    const map: Record<string, (event: KeyboardEvent) => void> = {};
    for (const id of ACTION_IDS) {
      for (const key of bindings[id]) {
        map[key] = (event) => {
          if (shouldIgnore(event)) return;
          // Space/Enter on a focused button should keep pressing it.
          const target = event.target as HTMLElement | null;
          if (key.endsWith("Space") && target?.closest("button, [role='button']")) return;
          event.preventDefault();
          handlers[id](event);
        };
      }
    }

    return tinykeys(window, map);
  }, [bindings, isMobile, router]);

  const value = useMemo(() => ({ bindings, addBinding, removeBinding, resetBindings }), [bindings]);

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
};
