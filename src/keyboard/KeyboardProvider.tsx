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
  loadKeyboardEnabled,
  saveBindings,
  saveKeyboardEnabled,
} from "./keybindings";
import { focusZone, getActiveDialog, moveFocus, restoreFocus, scrollPage } from "./navigation";
import { hideHints, showHints } from "./hints";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface KeyboardContextType {
  /** Whether the user turned keyboard navigation on. Off by default. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /** False on mobile platforms, where keyboard navigation is not offered at all. */
  supported: boolean;
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

function isTextField(target: HTMLElement | null): boolean {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function shouldIgnore(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return true;

  if (isTextField(event.target as HTMLElement | null)) return true;

  // An open menu or listbox owns the keyboard.
  return !!document.querySelector('[role="menu"], [role="listbox"]');
}

/** Actions that make sense inside an open dialog; the rest would act on the page behind it. */
const DIALOG_ACTIONS: ActionId[] = ["nav.next", "nav.prev", "scroll.down", "scroll.up", "hints.show"];

export const KeyboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setSideBarOpen, isMobile } = useAppContext();
  const router = useRouter();
  const [bindings, setBindings] = useState<Bindings>(DEFAULT_BINDINGS);
  const [enabled, setEnabledState] = useState(false);
  const [supported] = useState(() => !isMobile);

  const active = supported && enabled;

  useEffect(() => {
    loadBindings().then(setBindings).catch(() => { });
    loadKeyboardEnabled().then(setEnabledState).catch(() => { });
  }, []);

  const setEnabled = (next: boolean) => {
    setEnabledState(next);
    saveKeyboardEnabled(next);
  };

  useEffect(() => {
    if (!active) hideHints();
  }, [active]);

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
    if (!active) return;

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
      "hints.show": () => showHints(),
      "window.close": () => {
        // Same as the titlebar close button: hide the window, the app keeps running in the tray.
        getCurrentWindow().hide().catch(() => { });
      },
    };

    const map: Record<string, (event: KeyboardEvent) => void> = {};
    for (const id of ACTION_IDS) {
      for (const key of bindings[id]) {
        map[key] = (event) => {
          if (shouldIgnore(event)) return;
          if (getActiveDialog() && !DIALOG_ACTIONS.includes(id)) return;
          // Space/Enter on a focused button should keep pressing it.
          const target = event.target as HTMLElement | null;
          if (key.endsWith("Space") && target?.closest("button, [role='button']")) return;
          event.preventDefault();
          handlers[id](event);
        };
      }
    }

    return tinykeys(window, map);
  }, [bindings, active, router]);

  // Escape leaves a focused text field so the navigation keys work again.
  // Runs in the capture phase and stops the event so the field itself never
  // sees it (clearable inputs would otherwise erase their value). While an
  // overlay is open it is left alone so popups and modals can close first.
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (!isTextField(target)) return;
      if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) return;

      event.preventDefault();
      event.stopPropagation();
      target!.blur();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [active]);

  // After navigating (e.g. back from an entry) the list is re-created: put the
  // focus back on the entry the user left, once it has rendered.
  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const unsubscribe = router.subscribe("onResolved", () => {
      cancelAnimationFrame(frame);
      let attempts = 0;
      const tryRestore = () => {
        if (restoreFocus("main") || ++attempts > 30) return;
        frame = requestAnimationFrame(tryRestore);
      };
      frame = requestAnimationFrame(tryRestore);
    });

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [active, router]);

  const value = useMemo(
    () => ({ enabled, setEnabled, supported, bindings, addBinding, removeBinding, resetBindings }),
    [enabled, supported, bindings],
  );

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
};
