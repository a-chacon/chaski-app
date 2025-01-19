import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { RiArrowUpLine } from "@remixicon/react";
import { useAppContext } from "../../AppContext";

interface ApplicationProps {
  children: React.ReactNode;
}

const MainSectionLayout: React.FC<ApplicationProps> = ({ children }) => {
  const [showButton, setShowButton] = useState(false);
  const { isMobile, setSideBarOpen } = useAppContext();

  const handleScroll = () => {
    const element = document.getElementById("mainDiv");
    if (element) {
      const scrollY = element.scrollTop;
      const windowHeight = window.innerHeight;

      if (scrollY > windowHeight * 1.5) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    }
  };

  useEffect(() => {
    if (isMobile) {
      setSideBarOpen(false);
    }

    const element = document.getElementById("mainDiv");
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const element = document.getElementById("mainDiv");
    if (element) {
      element.scrollTop = 0;
    }
  };

  return (
    <div
      id="mainDiv"
      className="rounded-3xl h-full w-full overflow-auto border border-primary-100 shadow-xl"
    >
      {children}
      {showButton && (
        <div>
          <Button
            onClick={scrollToTop}
            variant="flat"
            color="primary"
            isIconOnly
            className="rounded-full absolute bottom-20 md:bottom-4 right-5 p-3 transition"
          >
            <RiArrowUpLine></RiArrowUpLine>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MainSectionLayout;
