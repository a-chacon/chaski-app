type Zone = "sidebar" | "main" | "modal";

const SIDEBAR_SELECTOR = '[data-nav-zone="sidebar"] a[href], [data-nav-zone="sidebar"] [data-nav-item]';
const MAIN_SELECTOR = "#mainDiv [data-nav-item]";
const MODAL_SELECTOR = "[data-nav-item]";

interface Remembered {
  el: HTMLElement;
  /** Stable identity: survives the element being unmounted and re-created (e.g. after visiting an entry and coming back). */
  key: string | null;
}

const lastFocused: Partial<Record<Zone, Remembered>> = {};

const keyOf = (el: HTMLElement) => el.dataset.navKey ?? el.getAttribute("href");

const isVisible = (el: HTMLElement) => el.getClientRects().length > 0;

/** The topmost open modal/popover dialog, which owns the keyboard while it is open. */
export function getActiveDialog(): HTMLElement | null {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
  return dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
}

function getItems(zone: Zone): HTMLElement[] {
  if (zone === "modal") {
    const dialog = getActiveDialog();
    if (!dialog) return [];
    return Array.from(dialog.querySelectorAll<HTMLElement>(MODAL_SELECTOR)).filter(isVisible);
  }
  const selector = zone === "sidebar" ? SIDEBAR_SELECTOR : MAIN_SELECTOR;
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(isVisible);
}

function currentZone(): Zone {
  if (getActiveDialog()) return "modal";
  const active = document.activeElement;
  return active?.closest('[data-nav-zone="sidebar"]') ? "sidebar" : "main";
}

/** Max distance kept between the focused item and the edges of the scroll area. */
const SCROLL_MARGIN_MAX = 160;

/**
 * Scrolls just enough to show the item, keeping some room around it so the
 * selection never sits glued to the bottom (or top) edge of the page.
 */
function scrollIntoComfortView(el: HTMLElement, container: HTMLElement) {
  const area = container.getBoundingClientRect();
  const rect = el.getBoundingClientRect();

  // Never ask for more room than there is: tall items just get aligned.
  const margin = Math.min(SCROLL_MARGIN_MAX, area.height * 0.25, Math.max(0, (area.height - rect.height) / 2));

  if (rect.bottom > area.bottom - margin) {
    container.scrollBy({ top: rect.bottom - (area.bottom - margin) });
  } else if (rect.top < area.top + margin) {
    container.scrollBy({ top: rect.top - (area.top + margin) });
  }
}

function focusItem(zone: Zone, el: HTMLElement) {
  el.focus({ preventScroll: true });
  const container = zone === "sidebar" ? null : getScrollContainer();
  if (container) scrollIntoComfortView(el, container);
  else el.scrollIntoView({ block: "nearest" });
  // Dialogs are short-lived: nothing to come back to.
  if (zone !== "modal") lastFocused[zone] = { el, key: keyOf(el) };
}

/** The element that scrolls: the body of the open dialog, or the main content. */
function getScrollContainer(): HTMLElement | null {
  const dialog = getActiveDialog();
  if (dialog) return dialog.querySelector<HTMLElement>('[data-slot="body"]') ?? dialog;
  return document.getElementById("mainDiv");
}

/** The item last focused in this zone, even if its element has since been re-created. */
function findRemembered(zone: Zone, items: HTMLElement[]): HTMLElement | undefined {
  const remembered = lastFocused[zone];
  if (!remembered) return undefined;
  if (items.includes(remembered.el)) return remembered.el;
  if (!remembered.key) return undefined;
  return items.find((el) => keyOf(el) === remembered.key);
}

function isInMainViewport(el: HTMLElement) {
  const main = document.getElementById("mainDiv");
  if (!main) return true;
  const container = main.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return rect.bottom > container.top && rect.top < container.bottom;
}

export function scrollMain(amount: number) {
  getScrollContainer()?.scrollBy({ top: amount });
}

export function scrollPage(direction: 1 | -1) {
  const container = getScrollContainer();
  if (container) container.scrollBy({ top: direction * container.clientHeight * 0.9 });
}

/** Moves focus to the next/previous item in the current zone. Scrolls instead when the page has no list. */
export function moveFocus(direction: 1 | -1) {
  const zone = currentZone();
  const items = getItems(zone);

  if (items.length === 0) {
    if (zone !== "sidebar") scrollMain(direction * 80);
    return;
  }

  let index = items.indexOf(document.activeElement as HTMLElement);
  if (index < 0) {
    // Focus was lost (e.g. returning from an entry): continue from the last
    // focused item, as long as it is still on screen.
    const remembered = findRemembered(zone, items);
    if (remembered && (zone === "sidebar" || isInMainViewport(remembered))) {
      index = items.indexOf(remembered);
    }
  }

  let next: number;
  if (index < 0) {
    next = direction > 0 ? 0 : items.length - 1;
  } else {
    next = Math.min(items.length - 1, Math.max(0, index + direction));
  }
  focusItem(zone, items[next]);
}

/** Marks an item as the current one of its zone, e.g. after it was activated without moving focus to it. */
export function rememberItem(el: HTMLElement) {
  const zone: Zone = el.closest('[data-nav-zone="sidebar"]') ? "sidebar" : "main";
  if (zone === "main" && !el.matches("[data-nav-item]")) return;
  lastFocused[zone] = { el, key: keyOf(el) };
}

/**
 * Re-focuses the remembered item of a zone if it is present again and nothing
 * else holds focus. Doesn't scroll: the scroll position is restored by the
 * list cache. Returns true once the item has been focused.
 */
export function restoreFocus(zone: Zone): boolean {
  const active = document.activeElement;
  if (active && active !== document.body) return true;

  const remembered = findRemembered(zone, getItems(zone));
  if (!remembered) return false;

  remembered.focus({ preventScroll: true });
  lastFocused[zone] = { el: remembered, key: keyOf(remembered) };
  return true;
}

export function focusZone(zone: Zone) {
  const items = getItems(zone);
  if (items.length === 0) return;

  const target =
    findRemembered(zone, items) ||
    (zone === "sidebar" && items.find((el) => el.getAttribute("aria-current") === "page")) ||
    items[0];
  focusItem(zone, target);
}
