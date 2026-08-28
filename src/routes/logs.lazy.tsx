import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Select, SelectItem, Switch } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import { useTranslation } from 'react-i18next';

export const Route = createLazyFileRoute("/logs")({
  component: LogsPage,
});

type LogLevel = "ALL" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";

interface ParsedLine {
  raw: string;
  level: LogLevel;
  timestamp: string;
  target: string;
  message: string;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  ALL: 0,
  TRACE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  ALL: "",
  TRACE: "text-foreground-400",
  DEBUG: "text-blue-400",
  INFO: "text-green-500",
  WARN: "text-yellow-500",
  ERROR: "text-red-500",
};

const LEVEL_BG: Record<LogLevel, string> = {
  ALL: "",
  TRACE: "",
  DEBUG: "",
  INFO: "",
  WARN: "bg-yellow-500/5",
  ERROR: "bg-red-500/10",
};

// Matches tauri-plugin-log format: [2024-01-15][12:34:56][chaski:target][INFO] message
const LOG_LINE_RE =
  /^\[(\d{4}-\d{2}-\d{2})\]\[([^\]]+)\]\[([^\]]+)\]\[(TRACE|DEBUG|INFO|WARN|ERROR)\]\s*(.*)$/;

function parseLine(raw: string): ParsedLine {
  const m = raw.match(LOG_LINE_RE);
  if (m) {
    return {
      raw,
      timestamp: `${m[1]} ${m[2]}`,
      target: m[3],
      level: m[4] as LogLevel,
      message: m[5],
    };
  }

  // Fallback: try to detect level keyword anywhere in line
  for (const lvl of ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"] as LogLevel[]) {
    if (raw.includes(`[${lvl}]`)) {
      return { raw, level: lvl, timestamp: "", target: "", message: raw };
    }
  }

  return { raw, level: "INFO", timestamp: "", target: "", message: raw };
}

function LogsPage() {
  const [lines, setLines] = useState<ParsedLine[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel>("ALL");
  const [filterText, setFilterText] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('logs');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const content = await invoke<string>("get_log_content");
      const parsed = content
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map(parseLine);
      setLines(parsed);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines, autoScroll]);

  const filteredLines = lines.filter((line) => {
    const levelOk =
      filterLevel === "ALL" ||
      LEVEL_ORDER[line.level] >= LEVEL_ORDER[filterLevel];
    const textOk =
      filterText.trim() === "" ||
      line.raw.toLowerCase().includes(filterText.toLowerCase());
    return levelOk && textOk;
  });

  const levels: { key: LogLevel; label: string }[] = [
    { key: "ALL", label: t('levelAll') },
    { key: "TRACE", label: t('levelTrace') },
    { key: "DEBUG", label: t('levelDebug') },
    { key: "INFO", label: t('levelInfo') },
    { key: "WARN", label: t('levelWarn') },
    { key: "ERROR", label: t('levelError') },
  ];

  return (
    <MainSectionLayout>
      <div className="flex flex-col h-full p-4 gap-3">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold flex-1">{t('title')}</h1>

          <Switch
            size="sm"
            isSelected={autoScroll}
            onValueChange={setAutoScroll}
          >
            {t('autoScroll')}
          </Switch>

          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={fetchLogs}
            isLoading={loading}
            startContent={<RiRefreshLine className="h-4 w-4" />}
          >
            {t('refresh')}
          </Button>


        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            size="sm"
            className="w-44"
            selectedKeys={[filterLevel]}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel)}
            aria-label="Filter by log level"
          >
            {levels.map((l) => (
              <SelectItem key={l.key}>{l.label}</SelectItem>
            ))}
          </Select>

          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 min-w-0 text-sm px-3 py-1.5 rounded-md border border-default-300 bg-default-100 focus:outline-none focus:border-primary"
          />

          <span className="text-xs text-foreground-500 whitespace-nowrap">
            {t('lineCount', { filtered: filteredLines.length, total: lines.length })}
          </span>
        </div>

        {/* Log output */}
        <div className="flex-1 overflow-auto rounded-xl bg-content1 border border-default-200 font-mono text-xs">
          {error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : filteredLines.length === 0 && !loading ? (
            <p className="p-4 text-foreground-400">{t('noEntries')}</p>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {filteredLines.map((line, i) => (
                  <tr
                    key={i}
                    className={`border-b border-default-100 hover:bg-default-50 ${LEVEL_BG[line.level]}`}
                  >
                    {line.timestamp ? (
                      <>
                        <td className="px-3 py-1 text-foreground-400 whitespace-nowrap align-top select-none">
                          {line.timestamp}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap align-top select-none">
                          <span
                            className={`font-semibold ${LEVEL_COLORS[line.level]}`}
                          >
                            {line.level}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-foreground-400 whitespace-nowrap align-top select-none hidden lg:table-cell">
                          {line.target}
                        </td>
                        <td className="px-2 py-1 break-all align-top">
                          {line.message}
                        </td>
                      </>
                    ) : (
                      <td
                        colSpan={4}
                        className={`px-3 py-1 break-all ${LEVEL_COLORS[line.level]}`}
                      >
                        {line.raw}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </MainSectionLayout>
  );
}
