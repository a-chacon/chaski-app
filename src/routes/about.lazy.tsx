import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import MainSectionLayout from '../components/layout/MainSectionLayout';
import FeedbackModal from '../components/FeedbackModal';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, useDisclosure } from '@heroui/react';
import { RiFeedbackLine, RiFileListLine, RiMastodonFill } from '@remixicon/react';

export const Route = createLazyFileRoute('/about')({ component: RouteComponent });

function RouteComponent() {
  const { t } = useTranslation('about');
  const [appVersion, setAppVersion] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();
  const [storage, setStorage] = useState<{
    database_bytes: number;
    free_bytes: number;
    entries_count: number;
  } | null>(null);

  useEffect(() => {
    invoke<typeof storage>('get_storage_usage')
      .then(setStorage)
      .catch((e) => console.error('Error fetching storage usage:', e));
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  };

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const version = await getVersion();
        setAppVersion(version);
      } catch (error) {
        console.error('Error fetching app version:', error);
      }
    };
    fetchAppVersion();
  }, []);

  return (
    <MainSectionLayout>
      <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* ── Hero ── */}
          <div className="flex flex-col items-center text-center gap-3 pb-2">
            <img className="w-28 h-28 object-contain" src="chaski.png" alt="Chaski logo" />
            <div>
              <h1 className="text-2xl font-bold">{t('version', { version: appVersion })}</h1>
              <p className="text-foreground-500 mt-1">{t('tagline')}</p>
            </div>
          </div>

          {/* ── Info ── */}
          <div className="rounded-2xl border border-divider bg-content1 px-6 py-5 flex flex-col gap-3 text-sm text-foreground-600">
            <p>
              {t('developedBy')}{' '}
              <a
                className="underline text-primary font-medium"
                href="https://a-chacon.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                a-chacon
              </a>
              .{' '}
              {t('licenseText')}{' '}
              <a
                className="underline text-primary font-medium"
                href="https://github.com/a-chacon/chaski-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('here')}
              </a>
              .
            </p>
            <div className="h-px bg-divider" />
            <p>
              <strong>{t('wantToHelp')}</strong>{' '}
              <a
                className="underline text-primary font-medium"
                href="https://buymeacoffee.com/achacon"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('buyMeCoffee')}
              </a>
              .
            </p>
          </div>

          {/* ── Storage ── */}
          {storage && (
            <div className="rounded-2xl border border-divider bg-content1 px-6 py-5 flex flex-col gap-1 text-sm">
              <h2 className="font-semibold">{t('storage.title')}</h2>
              <p className="text-foreground-600">
                {t('storage.database')}: {formatBytes(storage.database_bytes)}
                {storage.free_bytes > 0 &&
                  ` (${t('storage.reclaimable', { size: formatBytes(storage.free_bytes) })})`}
              </p>
              <p className="text-foreground-600">
                {t('storage.entries', { count: storage.entries_count })}
              </p>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="rounded-2xl border border-divider bg-content1 px-6 py-5 flex flex-col gap-3">
            <Button
              variant="flat"
              color="primary"
              startContent={<RiFeedbackLine size={18} />}
              onPress={onOpen}
              className="justify-start"
              fullWidth
            >
              {t('feedback')}
            </Button>

            <div className="h-px bg-divider" />

            <Button
              as="a"
              href="https://mastodon.social/@chaskiapp"
              target="_blank"
              rel="me noopener noreferrer"
              variant="flat"
              color="secondary"
              startContent={<RiMastodonFill size={18} />}
              className="justify-start"
              fullWidth
            >
              {t('followMastodon')}
            </Button>

            <div className="h-px bg-divider" />

            <Button
              variant="flat"
              color="default"
              startContent={<RiFileListLine size={18} />}
              className="justify-start"
              fullWidth
              onPress={() => navigate({ to: '/logs' })}
            >
              {t('viewLogs')}
            </Button>
          </div>

        </div>
      </div>

      <FeedbackModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </MainSectionLayout>
  );
}
