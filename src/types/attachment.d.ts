export type WikiAttachment = {
  id: number;
  filename: string;
  created: string;
  author: {
    username: string;
    displayName: string;
  };
  mimeType: string;
  content: string;
  size: number;
};
export interface WikiAttachments {
  success: boolean;
  values: WikiAttachment[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}
