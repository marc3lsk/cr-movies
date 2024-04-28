import { useEffect, useState } from "react";
import { Squash as Hamburger } from "hamburger-react";
import useResponsiveBreakpoints from "../../hooks/use-responsive-breakpoints";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

function HeaderLink({ url, text }: { url: string; text: string }) {
  return (
    <div className="block pr-4 lg:inline-block">
      <Link to={url} className="whitespace-nowrap text-xl uppercase">
        {text}
      </Link>
    </div>
  );
}

function MenuItems({
  isOpen,
  isVertical,
}: {
  isOpen: boolean;
  isVertical: boolean;
}) {
  return (
    <nav
      className={clsx(
        "gap-y-3 gap-x-8 overflow-hidden transition-[height] duration-300 lg:flex lg:gap-y-0 lg:px-0",
        !isOpen && "h-0",
        isVertical && isOpen && "h-16",
        !isVertical && "py-5",
      )}
    >
      <HeaderLink url="/" text="Search movies" />
      <HeaderLink url="/favourites" text="Favourite movies" />
    </nav>
  );
}

export default function TopNavigation() {
  const location = useLocation();
  const responsiveBreakPoints = useResponsiveBreakpoints();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div>
      <div className="mx-auto flex">
        <div className="grow self-center">
          <div className="mt-3 flex flex-col">
            {responsiveBreakPoints.isLg ? (
              <MenuItems
                isOpen={responsiveBreakPoints.isLg || isMenuOpen}
                isVertical={!responsiveBreakPoints.isLg}
              />
            ) : (
              <div className="mr-2 inline-block self-start pt-1 pb-1">
                <Hamburger toggled={isMenuOpen} toggle={setIsMenuOpen} />
              </div>
            )}
          </div>
        </div>
      </div>
      {responsiveBreakPoints.isLg ? null : (
        <MenuItems
          isOpen={responsiveBreakPoints.isLg || isMenuOpen}
          isVertical={!responsiveBreakPoints.isLg}
        />
      )}
    </div>
  );
}
