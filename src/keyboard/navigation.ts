type Zone = "sidebar" | "main";

const SIDEBAR_SELECTOR = '[data-nav-zone="sidebar"] a[href], [data-nav-zone="sidebar"] [data-nav-item]';
const MAIN_SELECTOR = "#mainDiv [data-nav-item]";

const lastFocused: Partial<Record<Zone, HTMLElement>> = {};

const isVisible = (el: HTMLElement) => el.getClientRects().length > 0;

function getItems(zone: Zone): HTMLElement[] {
  const selector = zone === "sidebar" ? SIDEBAR_SELECTOR : MAIN_SELECTOR;
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(isVisible);
}

function currentZone(): Zone {
  const active = document.activeElement;
  return active?.closest('[data-nav-zone="sidebar"]') ? "sidebar" : "main";
}

function focusItem(zone: Zone, el: HTMLElement) {
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "nearest" });
  lastFocused[zone] = el;
}

export function scrollMain(amount: number) {
  document.getElementById("mainDiv")?.scrollBy({ top: amount });
}

export function scrollPage(direction: 1 | -1) {
  const main = document.getElementById("mainDiv");
  if (main) main.scrollBy({ top: direction * main.clientHeight * 0.9 });
}

/** Moves focus to the next/previous item in the current zone. Scrolls instead when the page has no list. */
export function moveFocus(direction: 1 | -1) {
  const zone = currentZone();
  const items = getItems(zone);

  if (items.length === 0) {
    if (zone === "main") scrollMain(direction * 80);
    return;
  }

  const index = items.indexOf(document.activeElement as HTMLElement);
  let next: number;
  if (index < 0) {
    next = direction > 0 ? 0 : items.length - 1;
  } else {
    next = Math.min(items.length - 1, Math.max(0, index + direction));
  }
  focusItem(zone, items[next]);
}

export function focusZone(zone: Zone) {
  const items = getItems(zone);
  if (items.length === 0) return;

  const remembered = lastFocused[zone];
  const target =
    (remembered && items.includes(remembered) && remembered) ||
    (zone === "sidebar" && items.find((el) => el.getAttribute("aria-current") === "page")) ||
    items[0];
  focusItem(zone, target);
}
