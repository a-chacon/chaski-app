import { createLazyFileRoute, Link } from '@tanstack/react-router';
import MainSectionLayout from '../components/layout/MainSectionLayout';
import FeedbackModal from '../components/FeedbackModal';
import { getVersion } from '@tauri-apps/api/app';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, useDisclosure } from '@heroui/react';
import { RiFeedbackLine, RiFileListLine } from '@remixicon/react';

export const Route = createLazyFileRoute('/about')({ component: RouteComponent });

function RouteComponent() {
  const { t } = useTranslation('about');
  const [appVersion, setAppVersion] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

            <Link to="/logs" className="w-full">
              <Button
                variant="flat"
                color="default"
                startContent={<RiFileListLine size={18} />}
                className="justify-start"
                fullWidth
              >
                {t('viewLogs')}
              </Button>
            </Link>
          </div>

        </div>
      </div>

      <FeedbackModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </MainSectionLayout>
  );
}
