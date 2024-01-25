export type WikiPage = {
  success: boolean;
  id: 4;
  title: string;
  key: string;
  type: string;
  url: string;
  created: string;
  updated: string;
  viewed: string;
  secured: boolean;
  favorite: boolean;
  archived: boolean;
  anonymousAllowed: boolean;
  watchers: {
    username: string;
    displayName: string;
  }[];
  watched: boolean;
  canWrite: boolean;
  labels: string[];
  permissions: [
    {
      id: number;
      type: string;
      permissionLevels: string[];
      name: string;
      displayName?: string;
    }
  ];
  owner: {
    username: string;
    displayName: string;
  };
  updateAuthor: {
    username: string;
    displayName: string;
  };
  project: {
    id: number;
    key: string;
    name: string;
    avatarUrls: {
      "48x48": string;
      "24x24": string;
      "16x16": string;
      "32x32": string;
    };
    url: string;
    projectTypeKey: string;
  };
  body: string;
  html: string;
  versionInfo: { id: number; index: number; date: string };
};

export interface WikiPages {
  success: boolean;
  values: WikiPage[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}
