export interface Project {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: Record<"16x16" | "24x24" | "32x32" | "48x48", string>;
  projectCategory: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
  projectTypeKey: string;
  archived: boolean;
}

type WikiProject = {
  id: boolean;
  key: string;
  name: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  projectTypeKey: string;
  wikiData: {
    wikiHome: string;
    pageCount: number;
  };
  permissions?: Record<string, string>[];
};

export interface WikiProjects {
  success: boolean;
  values: WikiProject[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}
