import 'i18next';

import type enCommon from './locales/en/common.json';
import type enSidebar from './locales/en/sidebar.json';
import type enTitlebar from './locales/en/titlebar.json';
import type enConfigurations from './locales/en/configurations.json';
import type enOnboarding from './locales/en/onboarding.json';
import type enAlerts from './locales/en/alerts.json';
import type enEntries from './locales/en/entries.json';
import type enFeeds from './locales/en/feeds.json';
import type enAccounts from './locales/en/accounts.json';
import type enAbout from './locales/en/about.json';
import type enSearch from './locales/en/search.json';
import type enShare from './locales/en/share.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      sidebar: typeof enSidebar;
      titlebar: typeof enTitlebar;
      configurations: typeof enConfigurations;
      onboarding: typeof enOnboarding;
      alerts: typeof enAlerts;
      entries: typeof enEntries;
      feeds: typeof enFeeds;
      accounts: typeof enAccounts;
      about: typeof enAbout;
      search: typeof enSearch;
      share: typeof enShare;
    };
  }
}
