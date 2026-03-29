export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

export interface ApiPageData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
