import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useEffect, useState } from "react";
import { EntryInterface } from "../interfaces";
import parse from "html-react-parser";
import EntryActions from "../components/EntryActions";
import ThumbnailOrMedia from "../components/ThumbnailOrMedia";
import EntryShare from "../components/EntryShare";
import { RiArrowLeftLine } from "@remixicon/react";
import { Button, Spinner } from "@heroui/react";
import { getEntry, updateEntryAsRead } from "../helpers/entriesData";
import { useAppContext } from "../AppContext";

export const Route = createFileRoute("/entries/$entryId")({
  component: Entry,
});

function Entry() {
  const { entryId } = Route.useParams();
  const [entry, setEntry] = useState<EntryInterface>();
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const { setSideBarOpen, currentTheme } = useAppContext();

  useEffect(() => {
    const loadEntry = async () => {
      setSideBarOpen(false);
      setIsLoadingEntry(true);

      try {
        const entry = await getEntry(parseInt(entryId));
        if (!entry) {
          return;
        }

        setEntry(entry);
        updateEntryAsRead(entry);
      } finally {
        setIsLoadingEntry(false);
      }
    };

    loadEntry();
  }, [entryId]);

  const { history } = useRouter();

  const isDarkTheme = (theme: string) => theme.endsWith('-dark');

  if (isLoadingEntry) {
    return (
      <MainSectionLayout>
        <div className="h-full w-full flex items-center justify-center gap-2 text-sm opacity-80">
          <Spinner size="sm" color="default" />
          Loading entry...
        </div>
      </MainSectionLayout>
    );
  }

  return (
    entry && (
      <MainSectionLayout>
        <div className="flex flex-col p-4 mx-auto max-w-prose">
          <div className="mx-2 flex justify-between bg-primary-100 border border-primary-500 sticky top-3 p-1.5 rounded-xl shadow-xl">
            <div className="flex flex-row">
              <EntryActions
                entry={entry}
                setEntry={setEntry}
                backAfterAction={true}
              >
                <Button
                  color="primary"
                  variant="flat"
                  isIconOnly
                  size="sm"
                  onPress={() => history.back()}
                >
                  <RiArrowLeftLine className="text-primary-500" />
                </Button>


              </EntryActions>
            </div>
            <EntryShare entry={entry} />
          </div>
          <div className="flex flex-col justify-between w-full">
            <Link
              to="/feeds/$feedId"
              params={{ feedId: entry.feed!.id!.toString() }}
              className="flex gap-2 items-center pt-6"
            >
              <img
                alt={entry.feed?.title}
                className="h-5 w-5 object-cover"
                src={entry.feed?.icon}
              />
              <span className="text-sm line-clamp-1">
                {entry.feed?.title}
              </span>
            </Link>
            <div className="flex flex-col py-6">
              <h1 className="text-xl md:text-3xl font-semibold">
                {entry.title}
              </h1>
            </div>

            <ThumbnailOrMedia
              entry={entry}
            />

          </div>


          <div className={`prose md:prose-lg text-foreground prose-a:text-foreground mx-auto ${isDarkTheme(currentTheme) ? 'prose-invert' : ''}`}>
            <p className="py-6 line-clamp-3">
              {parse(entry.description || "")}
            </p>
            <hr />
            {parse(entry.content || "")}
          </div>
        </div>
      </MainSectionLayout>
    )
  );
}

export default Entry;
