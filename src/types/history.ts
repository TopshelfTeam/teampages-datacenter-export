export type History = {
  id: number;
  date: string;
  page: {
    id: number;
    title: string;
    key: string;
    viewed: boolean | null;
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
  };
  author: {
    username: string;
    displayName: string;
  };
  entity: string;
  action: string;
  details: {
    private: string;
  };
};

export interface WikiHistory {
  success: boolean;
  values: History[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}
