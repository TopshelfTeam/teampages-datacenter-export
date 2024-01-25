type WikiComment = {
  author: { username: string; displayName: string };
  displayName: string;
  username: string;
  body: string;
  created: string;
  id: number;
  legacyHtml: string;
  pageId: number;
  updateAuthor: { username: string; displayName: string };
  updated: string;
};

export interface WikiComments {
  success: boolean;
  values: WikiComment[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}
