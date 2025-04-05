export interface RequestOptions {
  body?: string;
  headers?: Record<string, string>;
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
}

export interface QueryOptions extends SearchOptions {}

export interface RecordResponse {
  key: string;
  value: string;
  result?: number;
}

export interface SearchResponse {
  results: Array<{
    key: string;
    score: number;
  }>;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    key: string;
    score: number;
  }>;
}

export interface RangeResponse {
  records: Array<{
    key: string;
    value: string;
  }>;
  count: number;
  truncated: boolean;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: Record<string, unknown>;
}

export interface RangeQueryOptions {
  limit?: number;
}
