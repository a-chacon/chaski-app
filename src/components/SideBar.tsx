import { RiBookmarkFill, RiFileListLine, RiCompassDiscoverLine, RiSettings4Line, RiInformationLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAppContext } from "../AppContext";
import AccountItemContent from "./SidebarItem/AccountItemContent";
import { useTranslation } from "react-i18next";

function SideBar() {
  const { currentAccount, isMobile, setSideBarOpen } = useAppContext();
  const { t } = useTranslation("sidebar");

  const classes = "overflow-auto px-2 py-4 h-full w-full absolute z-30 top-0 left-0 right-0 md:static bg-background/90 border-r border-default-200/70";
  const linkClass = `w-full h-full flex flex-row items-center gap-3 hover:bg-default/40 rounded-md px-3 ${isMobile ? "py-3.5 text-base" : "py-1.5 text-sm"
    }`;
  const iconSize = isMobile ? 22 : 20;
  const handleLinkClick = () => {
    if (isMobile) setSideBarOpen(false);
  };

  return (
    <nav className={classes}>
      <div className="flex flex-col gap-1">
        <div className="px-1 flex flex-col py-2 gap-1">
          <Link
            to="/"
            className={linkClass}
            activeProps={{ className: "bg-default/40" }}
            onClick={handleLinkClick}
          >
            <RiFileListLine size={iconSize} className="opacity-90 shrink-0" />
            {t("entries")}
          </Link>
          <Link
            to="/read_later"
            className={linkClass}
            activeProps={{ className: "bg-default/40" }}
            onClick={handleLinkClick}
          >
            <RiBookmarkFill size={iconSize} className="opacity-90 shrink-0" />
            {t("readLater")}
          </Link>
          <Link
            to="/discover"
            className={linkClass}
            activeProps={{ className: "bg-default/40" }}
            onClick={handleLinkClick}
          >
            <RiCompassDiscoverLine size={iconSize} className="opacity-90 shrink-0" />
            {t("discover")}
          </Link>
          <Link
            to="/configurations"
            className={linkClass}
            activeProps={{ className: "bg-default/40" }}
            onClick={handleLinkClick}
          >
            <RiSettings4Line size={iconSize} className="opacity-90 shrink-0" />
            {t("configurations")}
          </Link>
          <Link
            to="/about"
            className={linkClass}
            activeProps={{ className: "bg-default/40" }}
            onClick={handleLinkClick}
          >
            <RiInformationLine size={iconSize} className="opacity-90 shrink-0" />
            {t("about")}
          </Link>
        </div>

        <div className="px-3 pt-2 pb-1">
          <h5 className="font-semibold text-xs uppercase tracking-wide text-foreground-500">{t("feeds")}</h5>
        </div>

        <div className="w-full relative flex flex-col gap-1 py-1">
          {currentAccount ? (
            <AccountItemContent account={currentAccount} />
          ) : (
            <p className="px-3 text-sm text-foreground-500">{t("noAccountSelected")}</p>
          )}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;
