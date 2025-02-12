import { createRootRoute, Outlet, ScrollRestoration } from "@tanstack/react-router";
import ApplicationLayout from "../components/layout/ApplicationLayout";
import { HeroUIProvider } from "@heroui/react";
import { ArticlesProvider } from "../IndexArticlesContext";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeroUIProvider>
        <ArticlesProvider >
          <ApplicationLayout>
            <ScrollRestoration />
            <Outlet />
          </ApplicationLayout>
        </ArticlesProvider >
      </HeroUIProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
