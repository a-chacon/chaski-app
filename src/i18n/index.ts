import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enSidebar from './locales/en/sidebar.json';
import enTitlebar from './locales/en/titlebar.json';
import enConfigurations from './locales/en/configurations.json';
import enOnboarding from './locales/en/onboarding.json';
import enAlerts from './locales/en/alerts.json';
import enEntries from './locales/en/entries.json';
import enFeeds from './locales/en/feeds.json';
import enAccounts from './locales/en/accounts.json';
import enAbout from './locales/en/about.json';
import enSearch from './locales/en/search.json';
import enShare from './locales/en/share.json';

import esCommon from './locales/es/common.json';
import esSidebar from './locales/es/sidebar.json';
import esTitlebar from './locales/es/titlebar.json';
import esConfigurations from './locales/es/configurations.json';
import esOnboarding from './locales/es/onboarding.json';
import esAlerts from './locales/es/alerts.json';
import esEntries from './locales/es/entries.json';
import esFeeds from './locales/es/feeds.json';
import esAccounts from './locales/es/accounts.json';
import esAbout from './locales/es/about.json';
import esSearch from './locales/es/search.json';
import esShare from './locales/es/share.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      sidebar: enSidebar,
      titlebar: enTitlebar,
      configurations: enConfigurations,
      onboarding: enOnboarding,
      alerts: enAlerts,
      entries: enEntries,
      feeds: enFeeds,
      accounts: enAccounts,
      about: enAbout,
      search: enSearch,
      share: enShare,
    },
    es: {
      common: esCommon,
      sidebar: esSidebar,
      titlebar: esTitlebar,
      configurations: esConfigurations,
      onboarding: esOnboarding,
      alerts: esAlerts,
      entries: esEntries,
      feeds: esFeeds,
      accounts: esAccounts,
      about: esAbout,
      search: esSearch,
      share: esShare,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
