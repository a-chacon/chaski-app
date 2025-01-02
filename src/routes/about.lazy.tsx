import { createLazyFileRoute } from '@tanstack/react-router';
import MainSectionLayout from '../components/layout/MainSectionLayout';
import { getVersion } from '@tauri-apps/api/app';
import { useState, useEffect } from 'react';

export const Route = createLazyFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
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
          <h1 className="text-2xl font-bold">Chaski Version {appVersion} </h1>
          <h3 className="py-2">Read Without Compromise</h3>

          <p className="py-2">
            Chaski is developed by{' '}
            <a className="underline text-primary"
              target='_blank'
              href="https://a-chacon.com">
              a-chacon
            </a>{' '}
            as a free and open source software released under the GLP V3 license.
            You can check the code repository{' '}
            <a
              className="underline text-primary"
              href="https://github.com/a-chacon/chaski-app"
              target='_blank'
            >
              here
            </a>
            .
          </p>

          <p className="py-4">
            <strong>Want to help?</strong>{' '}
            <a className="underline text-primary" target='_blank' href="https://buymeacoffee.com/achacon">
              Buy me a coffee
            </a>
            .
          </p>
        </div>
      </div>
    </MainSectionLayout>
  );
}

