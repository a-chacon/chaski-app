import { createLazyFileRoute } from "@tanstack/react-router";
import NewFeedSite from "../components/NewFeedSite";
import MainSectionLayout from "../components/layout/MainSectionLayout";

export const Route = createLazyFileRoute("/new_feed")({
  component: NewFeed,
});

function NewFeed() {

  return (
    <MainSectionLayout>
      <div className="grid p-4 h-full place-items-center">
        <div>
          <h1 className="text-3xl m-4 font-bold text-center">
            Add new feeds here!
          </h1>
          <div className="w-80 md:w-96">
            <NewFeedSite />
          </div>
        </div>
      </div>
    </MainSectionLayout>
  );
}
