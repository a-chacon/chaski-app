export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FeedInterface {
  id?: number;
  title: string;
  description: string;
  link: string;
  icon: string;
  last_fetch: Date;
  latest_entry: Date;
  items_count: number;
  kind: string;
  folder?: string;
  proxy?: string;
  entry_limit: number;
  history_limit: number;
  update_interval_minutes: number;
  notifications_enabled: number;
  unread_count: number;
  account_id: number;
  default_entry_type: string;
}

export interface ArticleInterface {
  id?: number;
  title: string;
  link: string;
  thumbnail: string;
  pub_date: Date;
  description: string;
  content: string;
  read_later: number;
  read: number;
  hide: number;
  author: string;
  feed?: FeedInterface;
  entry_type: string;
  media_content_url?: string;
  media_content_type?: string;
}

export interface FilterInterface {
  id?: number;
  field: string;
  operator: string;
  value: string;
  logical_operator: string;
  feed_id: number;
}

export interface ConfigurationInterface {
  id: number;
  name: string;
  value: string;
  updated_at: Date;
  created_at: Date;
}

export interface AccountInterface {
  id?: number;
  name: string;
  kind: string;
  auth_token?: string;
  credentials?: {
    username: string;
    password: string;
  };
  server_url?: string;
  updated_at: Date;
  created_at: Date;
}

export interface AppContextInterface {
  sideBarOpen: boolean;
  setSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  articlesLayout: string;
  setArticlesLayout: React.Dispatch<React.SetStateAction<string>>;
  currentTheme: string;
  handleSetCurrentTheme: (theme: string) => void;
  currentFont: string;
  handleSetCurrentFont: (font: string) => void;
  currentFontSize: number;
  handleSetCurrentFontSize: (font_size: number) => void;
  currentFontSpace: number;
  handleSetCurrentFontSpace: (font_size: number) => void;
  isMobile: boolean;
  handleSetMarkAsReadOnHover: (mark_as_read_on_hover: boolean) => void;
  currentMarkAsReadOnHover: boolean;
  setConfigurations: React.Dispatch<
    React.SetStateAction<ConfigurationInterface[]>
  >;
  configurations: ConfigurationInterface[];
  setAccounts: React.Dispatch<
    React.SetStateAction<AccountInterface[]>
  >;
  accounts: AccountInterface[];
}

export interface SearchResultsInterface {
  feeds: FeedInterface[];
  articles: ArticleInterface[];
}
