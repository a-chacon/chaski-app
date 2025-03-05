import { createRootRoute, Outlet } from "@tanstack/react-router";
import ApplicationLayout from "../components/layout/ApplicationLayout";
import { HeroUIProvider } from "@heroui/react";
import { ArticlesProvider } from "../IndexArticlesContext";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeroUIProvider>
        <ArticlesProvider >
          <ApplicationLayout>
            <Outlet />
          </ApplicationLayout>
        </ArticlesProvider >
      </HeroUIProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
