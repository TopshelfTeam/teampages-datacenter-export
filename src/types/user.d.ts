export interface User {
  self?: string;
  key?: string;
  name: string;
  emailAddress?: string;
  avatarUrls?: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  displayName?: string;
  active?: boolean;
  deleted?: boolean;
  timeZone?: string;
  locale?: string;
  groups?: {
    size?: number;
    items?: [];
  };
  applicationRoles?: {
    size?: number;
    items?: [];
  };
  expand?: string;
}
