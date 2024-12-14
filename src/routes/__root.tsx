import { createRootRoute, Outlet, ScrollRestoration } from "@tanstack/react-router";
import ApplicationLayout from "../components/layout/ApplicationLayout";
import { NextUIProvider } from "@nextui-org/react";
import { ArticlesProvider } from "../IndexArticlesContext";

export const Route = createRootRoute({
  component: () => (
    <>
      <NextUIProvider>
        <ArticlesProvider >
          <ApplicationLayout>
            <ScrollRestoration />
            <Outlet />
          </ApplicationLayout>
        </ArticlesProvider >
      </NextUIProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
