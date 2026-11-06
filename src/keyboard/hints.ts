import { getActiveDialog, rememberItem } from "./navigation";

/** Home-row first, so the most common hints are the easiest to reach. */
const HINT_CHARS = "asdfghjklqwertyuiopzxcvbnm";

const CLICKABLE_SELECTOR = [
  "a[href]",
  "button",
  "input:not([type=hidden])",
  "select",
  "textarea",
  "summary",
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  "[data-nav-item]",
].join(",");

/** Inputs that are pressed rather than typed into. */
const PRESSABLE_INPUT_TYPES = ["checkbox", "radio", "button", "submit", "reset", "file", "image"];

interface Hint {
  el: HTMLElement;
  label: string;
  node: HTMLElement;
  typedNode: HTMLElement;
  restNode: HTMLElement;
}

interface HintSession {
  overlay: HTMLElement;
  hints: Hint[];
  typed: string;
  cleanup: () => void;
}

let session: HintSession | null = null;

export const isHintModeActive = () => session !== null;

function isClickable(el: HTMLElement): boolean {
  if (el.matches(":disabled") || el.getAttribute("aria-disabled") === "true") return false;

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
    return false;
  }

  // Skips elements that are clipped by a scroll container or covered by something else.
  const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
  const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
  const top = document.elementFromPoint(x, y);
  return !!top && el.contains(top);
}

/** Fixed-length labels so that no label is a prefix of another one. */
function makeLabels(count: number): string[] {
  const base = HINT_CHARS.length;
  let length = 1;
  while (base ** length < count) length++;

  return Array.from({ length: count }, (_, index) => {
    let n = index;
    let label = "";
    for (let i = 0; i < length; i++) {
      label = HINT_CHARS[n % base] + label;
      n = Math.floor(n / base);
    }
    return label;
  });
}

function createHintNode(label: string, rect: DOMRect) {
  const node = document.createElement("span");
  Object.assign(node.style, {
    position: "fixed",
    left: `${Math.max(0, rect.left)}px`,
    top: `${Math.max(0, rect.top)}px`,
    padding: "1px 4px",
    borderRadius: "4px",
    font: "700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "hsl(var(--heroui-warning))",
    color: "hsl(var(--heroui-warning-foreground, 0 0% 0%))",
    boxShadow: "0 1px 4px rgb(0 0 0 / 0.4)",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);

  const typedNode = document.createElement("span");
  typedNode.style.opacity = "0.45";
  const restNode = document.createElement("span");
  restNode.textContent = label;
  node.append(typedNode, restNode);

  return { node, typedNode, restNode };
}

function render(current: HintSession) {
  for (const hint of current.hints) {
    const matches = hint.label.startsWith(current.typed);
    hint.node.style.display = matches ? "" : "none";
    hint.typedNode.textContent = matches ? current.typed : "";
    hint.restNode.textContent = matches ? hint.label.slice(current.typed.length) : hint.label;
  }
}

function activate(el: HTMLElement) {
  rememberItem(el);

  const isTextField =
    (el instanceof HTMLInputElement && !PRESSABLE_INPUT_TYPES.includes(el.type)) ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement;

  if (isTextField) el.focus();
  else el.click();
}

export function hideHints() {
  session?.cleanup();
  session = null;
}

export function showHints() {
  if (session) return;

  // An open dialog is the only thing the user can interact with.
  const scope: ParentNode = getActiveDialog() ?? document;
  const targets = Array.from(scope.querySelectorAll<HTMLElement>(CLICKABLE_SELECTOR)).filter(isClickable);
  if (targets.length === 0) return;

  const labels = makeLabels(targets.length);
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);

  const hints: Hint[] = targets.map((el, index) => {
    const parts = createHintNode(labels[index], el.getBoundingClientRect());
    overlay.appendChild(parts.node);
    return { el, label: labels[index], ...parts };
  });
  document.body.appendChild(overlay);

  const onKeyDown = (event: KeyboardEvent) => {
    const current = session;
    if (!current) return;
    if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(event.key)) return;

    // Hint mode owns the keyboard: nothing reaches the global shortcuts.
    event.preventDefault();
    event.stopImmediatePropagation();

    if (event.key === "Escape") return hideHints();

    if (event.key === "Backspace") {
      if (current.typed === "") return hideHints();
      current.typed = current.typed.slice(0, -1);
      return render(current);
    }

    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;

    const typed = current.typed + event.key.toLowerCase();
    const matching = current.hints.filter((hint) => hint.label.startsWith(typed));
    if (matching.length === 0) return;

    current.typed = typed;
    if (matching.length === 1 && matching[0].label === typed) {
      const { el } = matching[0];
      hideHints();
      activate(el);
      return;
    }
    render(current);
  };

  // The hints are positioned once: anything that moves the page makes them stale.
  const exit = () => hideHints();

  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("scroll", exit, true);
  window.addEventListener("resize", exit);
  window.addEventListener("mousedown", exit, true);
  window.addEventListener("blur", exit);

  session = {
    overlay,
    hints,
    typed: "",
    cleanup: () => {
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", exit, true);
      window.removeEventListener("resize", exit);
      window.removeEventListener("mousedown", exit, true);
      window.removeEventListener("blur", exit);
      overlay.remove();
    },
  };
}
