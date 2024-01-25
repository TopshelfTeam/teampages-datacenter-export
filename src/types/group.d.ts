export interface Group {
  name?: string;
  id: string | number;
  html?: string;
  labels?: {
    text: string;
    title: string;
    type: string;
  }[];
}

export interface Groups {
  header: string;
  total: number;
  groups: Group[];
}
