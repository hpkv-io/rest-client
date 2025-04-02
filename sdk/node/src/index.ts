interface RequestOptions {
  body?: string;
  headers?: Record<string, string>;
}

interface SearchOptions {
  topK?: number;
  minScore?: number;
}

interface QueryOptions extends SearchOptions {}

interface RecordResponse {
  value: string;
  result?: number;
  [key: string]: string | number | undefined;
}

interface SearchResponse {
  results: Array<{
    key: string;
    score: number;
  }>;
}

interface QueryResponse {
  answer: string;
  sources: Array<{
    key: string;
    score: number;
  }>;
}

interface RangeResponse {
  records: Array<{
    key: string;
    value: string;
  }>;
  count: number;
  truncated: boolean;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: Record<string, unknown>;
}

class HPKVRestClient {
  private baseUrl: string;
  private nexusBaseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  /**
   * Creates a new HPKV client
   * @param baseUrl - The base URL for the HPKV REST API
   * @param nexusBaseUrl - The base URL for the HPKV Nexus API
   * @param apiKey - Your HPKV API key
   */
  constructor(baseUrl: string, nexusBaseUrl: string, apiKey: string) {
    if (!baseUrl) throw new Error('baseUrl is required');
    if (!nexusBaseUrl) throw new Error('nexusBaseUrl is required');
    if (!apiKey) throw new Error('apiKey is required');
    this.baseUrl = baseUrl;
    this.nexusBaseUrl = nexusBaseUrl;
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    };
  }

  /**
   * Make an HTTP request to the API
   * @private
   */
  private async _request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const baseUrl =
      path.startsWith('/search') || path.startsWith('/query') ? this.nexusBaseUrl : this.baseUrl;
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || `HTTP error ${response.status}`) as ApiError;
      error.status = response.status;
      error.data = data;
      error.code = this._getErrorCode(response.status);
      throw error;
    }

    return data as T;
  }

  /**
   * Get error code based on HTTP status
   * @private
   */
  private _getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Insert or update a record
   */
  async set(
    key: string,
    value: string | Record<string, unknown>,
    partialUpdate = false
  ): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>('POST', '/record', {
        body: JSON.stringify({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          partialUpdate,
        }),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Get a record by key
   */
  async get(key: string): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>('GET', `/record/${key}`);
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Delete a record
   */
  async delete(key: string): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>('DELETE', `/record/${key}`);
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Increment or decrement a numeric value
   */
  async increment(key: string, increment = 1): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>('POST', '/record/atomic', {
        body: JSON.stringify({
          key,
          increment,
        }),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Query records within a key range
   */
  async getRange(startKey: string, endKey: string, limit = 100): Promise<RangeResponse> {
    try {
      const params = new URLSearchParams({
        startKey,
        endKey,
        limit: limit.toString(),
      });
      return await this._request<RangeResponse>('GET', `/records?${params}`);
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Perform semantic search using Nexus Search
   */
  async nexusSearch(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      if (!query) throw new Error('Query is required');
      const body = {
        query,
        topK: Math.min(Math.max(options.topK || 5, 1), 20),
        minScore: Math.min(Math.max(options.minScore || 0.5, 0), 1),
      };

      return await this._request<SearchResponse>('POST', '/search', {
        body: JSON.stringify(body),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Get AI-generated answers using Nexus Query
   */
  async nexusQuery(query: string, options: QueryOptions = {}): Promise<QueryResponse> {
    try {
      if (!query) throw new Error('Query is required');
      const body = {
        query,
        topK: Math.min(Math.max(options.topK || 5, 1), 20),
        minScore: Math.min(Math.max(options.minScore || 0.5, 0), 1),
      };

      return await this._request<QueryResponse>('POST', '/query', {
        body: JSON.stringify(body),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Handle API errors
   * @private
   */
  private _handleError(error: ApiError): never {
    if (error.status) {
      const errorMessage = this._getErrorMessage(error.status, error.data);
      const enhancedError = new Error(errorMessage) as ApiError;
      enhancedError.status = error.status;
      enhancedError.code = error.code;
      enhancedError.data = error.data;
      throw enhancedError;
    } else if (error.message === 'Failed to fetch') {
      const networkError = new Error('No response received from server') as ApiError;
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    } else {
      throw error;
    }
  }

  /**
   * Get human-readable error message based on status code
   * @private
   */
  private _getErrorMessage(status: number, data: unknown): string {
    const messages: Record<number, string> = {
      400: 'Invalid parameters or request body',
      401: 'Missing or invalid API key',
      403: 'Permission denied',
      404: 'Record not found',
      409: 'Timestamp conflict',
      429: 'Rate limit exceeded',
      500: 'Server error',
    };

    return (data as { error?: string })?.error || messages[status] || `HTTP error ${status}`;
  }
}

export default HPKVRestClient;
