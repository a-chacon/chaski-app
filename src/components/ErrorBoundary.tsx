import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;
  resetKey?: unknown;
  title?: string;
}

interface State {
  error: Error | null;
}

export function ErrorMessage({ error, title }: { error: unknown; title?: string }) {
  const { t } = useTranslation("common");
  const [showDetails, setShowDetails] = useState(false);
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="m-4 p-4 rounded-xl border border-danger-500 bg-danger-50 text-danger-700 text-sm break-words">
      <p className="font-semibold">{title ?? t("errorTitle")}</p>
      <button
        type="button"
        className="mt-2 underline text-xs"
        onClick={() => setShowDetails((v) => !v)}
      >
        {showDetails ? t("hideDetails") : t("showDetails")}
      </button>
      {showDetails && (
        <pre className="mt-2 whitespace-pre-wrap text-xs opacity-80">{message}</pre>
      )}
    </div>
  );
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} title={this.props.title} />;
    }
    return this.props.children;
  }
}
