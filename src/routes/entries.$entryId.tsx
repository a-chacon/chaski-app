import { createFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import EntryView from "../components/EntryView";
import { ErrorMessage } from "../components/ErrorBoundary";

export const Route = createFileRoute("/entries/$entryId")({
  component: Entry,
  errorComponent: ({ error }) => (
    <MainSectionLayout>
      <ErrorMessage error={error} />
    </MainSectionLayout>
  ),
});

function Entry() {
  const { entryId } = Route.useParams();
  return <EntryView entryId={entryId} />;
}

export default Entry;
