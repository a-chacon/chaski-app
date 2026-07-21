import { createRootRoute, Outlet } from "@tanstack/react-router";
import ApplicationLayout from "../components/layout/ApplicationLayout";
import { HeroUIProvider } from "@heroui/react";
import { EntriesProvider } from "../IndexEntriesContext";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeroUIProvider>
        <EntriesProvider >
          <ApplicationLayout>
            <Outlet />
          </ApplicationLayout>
        </EntriesProvider >
      </HeroUIProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
