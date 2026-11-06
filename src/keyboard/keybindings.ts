import { load } from "@tauri-apps/plugin-store";

export type ActionId =
  | "nav.next"
  | "nav.prev"
  | "focus.sidebar"
  | "focus.main"
  | "scroll.down"
  | "scroll.up"
  | "back"
  | "sidebar.toggle"
  | "hints.show"
  | "window.close";

export type Bindings = Record<ActionId, string[]>;

export const ACTION_IDS: ActionId[] = [
  "nav.next",
  "nav.prev",
  "focus.sidebar",
  "focus.main",
  "scroll.down",
  "scroll.up",
  "back",
  "sidebar.toggle",
  "hints.show",
  "window.close",
];

// Key strings use the tinykeys syntax ("$mod" = Ctrl on Linux/Windows, Cmd on macOS).
export const DEFAULT_BINDINGS: Bindings = {
  "nav.next": ["j", "ArrowDown"],
  "nav.prev": ["k", "ArrowUp"],
  "focus.sidebar": ["h", "ArrowLeft"],
  "focus.main": ["l", "ArrowRight"],
  "scroll.down": ["Space"],
  "scroll.up": ["Shift+Space"],
  back: ["Backspace"],
  "sidebar.toggle": ["$mod+b"],
  "hints.show": ["f"],
  // Space-separated keys are a sequence: press q, then q again.
  "window.close": ["q q"],
};

const STORE_KEY = "keybindings";
const ENABLED_STORE_KEY = "keyboardEnabled";

/** Keyboard navigation is opt-in: it is off until the user turns it on in the settings. */
export async function loadKeyboardEnabled(): Promise<boolean> {
  const store = await load("settings.json", { autoSave: true });
  const stored = await store.get<{ value: boolean }>(ENABLED_STORE_KEY);
  return stored?.value === true;
}

export async function saveKeyboardEnabled(enabled: boolean): Promise<void> {
  const store = await load("settings.json", { autoSave: true });
  await store.set(ENABLED_STORE_KEY, { value: enabled });
}

export async function loadBindings(): Promise<Bindings> {
  const store = await load("settings.json", { autoSave: true });
  const stored = await store.get<{ value: Partial<Bindings> }>(STORE_KEY);
  const merged = { ...DEFAULT_BINDINGS };
  for (const id of ACTION_IDS) {
    const keys = stored?.value?.[id];
    if (Array.isArray(keys)) merged[id] = keys;
  }
  return merged;
}

export async function saveBindings(bindings: Bindings): Promise<void> {
  const store = await load("settings.json", { autoSave: true });
  await store.set(STORE_KEY, { value: bindings });
}

const KEY_LABELS: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Space: "Space",
  Backspace: "Backspace",
  Escape: "Esc",
  $mod: "Ctrl",
};

export function formatKey(binding: string): string {
  return binding
    .split(" ")
    .map((step) =>
      step
        .split("+")
        .map((part) => KEY_LABELS[part] ?? (part.length === 1 ? part.toUpperCase() : part))
        .join("+"),
    )
    .join(" ");
}

const MODIFIER_KEYS = ["Control", "Shift", "Alt", "Meta", "AltGraph", "CapsLock"];

/** Builds a tinykeys binding string from a keydown event, or null for bare modifier presses. */
export function eventToBinding(event: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.includes(event.key)) return null;

  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push("$mod");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");

  let key = event.key === " " ? "Space" : event.key;
  if (key.length === 1) key = key.toLowerCase();
  parts.push(key);

  return parts.join("+");
}
