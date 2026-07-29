import { createLazyFileRoute } from '@tanstack/react-router';
import MainSectionLayout from '../components/layout/MainSectionLayout';
import { getVersion } from '@tauri-apps/api/app';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createLazyFileRoute('/about')({ component: RouteComponent });

function RouteComponent() {
  const { t } = useTranslation('about');
  const [appVersion, setAppVersion] = useState("");

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
      <div className="grid h-screen place-items-center">
        <div className="flex flex-col content-center text-center text-lg w-1/2">
          <img className="w-40 mx-auto" src="chaski.png" alt="" />
          <h1 className="text-2xl font-bold">{t('version', { version: appVersion })}</h1>
          <h3 className="py-2">{t('tagline')}</h3>
          <p className="py-2">
            {t('developedBy')}{' '}
            <a className="underline text-primary" target='_blank' href="https://a-chacon.com">a-chacon</a>{' '}
            {t('licenseText')}{' '}
            <a className="underline text-primary" href="https://github.com/a-chacon/chaski-app" target='_blank'>{t('here')}</a>.
          </p>
          <p className="py-4">
            <strong>{t('wantToHelp')}</strong>{' '}
            <a className="underline text-primary" target='_blank' href="https://buymeacoffee.com/achacon">{t('buyMeCoffee')}</a>.
          </p>
        </div>
      </div>
    </MainSectionLayout>
  );
}
