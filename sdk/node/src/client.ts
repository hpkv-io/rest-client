import {
  ApiError,
  RecordResponse,
  RangeResponse,
  QueryOptions,
  QueryResponse,
  RequestOptions,
  SearchOptions,
  SearchResponse,
} from "./types";

/**
 * Client for interacting with the HPKV REST API
 *
 * This client provides methods for all HPKV REST API endpoints including:
 * - Record operations (get, set, delete)
 * - Atomic operations (increment/decrement)
 * - Range queries
 * - Nexus Search and Query capabilities
 */
export class HPKVRestClient {
  private baseUrl: string;
  private nexusBaseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  /**
   * Creates a new HPKV client
   * @param baseUrl - The base URL for the HPKV REST API
   * @param nexusBaseUrl - The base URL for the HPKV Nexus API
   * @param apiKey - Your HPKV API key
   * @throws {Error} When required parameters are missing
   */
  constructor(baseUrl: string, nexusBaseUrl: string, apiKey: string) {
    if (!baseUrl) throw new Error("baseUrl is required");
    if (!nexusBaseUrl) throw new Error("nexusBaseUrl is required");
    if (!apiKey) throw new Error("apiKey is required");
    this.baseUrl = baseUrl;
    this.nexusBaseUrl = nexusBaseUrl;
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };
  }

  /**
   * Make an HTTP request to the API
   * @private
   * @param method - HTTP method (GET, POST, DELETE)
   * @param path - API endpoint path
   * @param options - Request options (body, etc.)
   * @returns API response data
   * @throws {ApiError} When the API returns an error
   */
  private async _request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const baseUrl =
      path.startsWith("/search") || path.startsWith("/query")
        ? this.nexusBaseUrl
        : this.baseUrl;
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorData =
        typeof data === "object" && data !== null
          ? (data as Record<string, unknown>)
          : {};
      const error = new Error(
        (errorData.error as string) || `HTTP error ${response.status}`,
      ) as ApiError;
      error.status = response.status;
      error.data = errorData;
      error.code = this._getErrorCode(response.status);
      throw error;
    }

    return data as T;
  }

  /**
   * Get error code based on HTTP status
   * @private
   * @param status - HTTP status code
   * @returns Error code
   */
  private _getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "RATE_LIMIT_EXCEEDED",
      500: "INTERNAL_ERROR",
    };
    return errorCodes[status] || "UNKNOWN_ERROR";
  }

  /**
   * Insert or update a record
   *
   * This method supports three operations:
   * 1. Insert a new record if the key doesn't exist
   * 2. Update an existing record by completely replacing its value
   * 3. Perform a partial update (append or JSON patch) when partialUpdate is true
   *
   * @param key - The key to store the value under
   * @param value - The value to store (string or object that will be stringified)
   * @param partialUpdate - If true, append to existing value or apply JSON patch if both values are valid JSON
   * @returns Response with success status and message
   * @throws {ApiError} When the API returns an error (400 Bad Request, 401 Unauthorized, etc.)
   *
   * @example
   * // Insert a new record
   * client.set("user:123", { name: "John", age: 30 });
   *
   * @example
   * // Update with JSON patch (when partialUpdate=true and both values are JSON)
   * client.set("user:123", { age: 31, city: "New York" }, true);
   */
  async set(
    key: string,
    value: unknown,
    partialUpdate = false,
  ): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>("POST", "/record", {
        body: JSON.stringify({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
          partialUpdate,
        }),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Get a record by key
   *
   * Retrieves the value stored at the specified key.
   *
   * @param key - The key to retrieve
   * @returns Response containing the key and value
   * @throws {ApiError} When the API returns an error (404 Not Found if key doesn't exist)
   */
  async get(key: string): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>(
        "GET",
        `/record/${encodeURIComponent(key)}`,
      );
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Delete a record
   *
   * Removes the record stored at the specified key.
   *
   * @param key - The key to delete
   * @returns Response with success status and message
   * @throws {ApiError} When the API returns an error (404 Not Found if key doesn't exist)
   */
  async delete(key: string): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>(
        "DELETE",
        `/record/${encodeURIComponent(key)}`,
      );
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Increment or decrement a numeric value
   *
   * Atomically increments or decrements the numeric value stored at the specified key.
   * This operation is useful for counters, rate limiters, and other scenarios where
   * you need to ensure consistency without race conditions.
   *
   * @param key - The key containing the numeric value to increment/decrement
   * @param increment - Value to add (positive) or subtract (negative)
   * @returns Response with the new value after increment/decrement
   * @throws {ApiError} When the API returns an error (404 Not Found if key doesn't exist)
   *
   * @example
   * // Increment a counter
   * const response = await client.atomicIncrement("counter:123", 1);
   * console.log(response.result); // The new counter value
   *
   * @example
   * // Decrement a counter
   * const response = await client.atomicIncrement("counter:123", -1);
   * console.log(response.result); // The new counter value
   */
  async atomicIncrement(
    key: string,
    increment: number,
  ): Promise<RecordResponse> {
    try {
      return await this._request<RecordResponse>("POST", "/record/atomic", {
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
   *
   * Retrieves multiple records with keys that fall within the specified range.
   * This is useful for retrieving related data with similar keys, such as all users
   * with IDs in a certain range.
   *
   * @param startKey - Starting key for the range (inclusive)
   * @param endKey - Ending key for the range (inclusive)
   * @param limit - Maximum number of records to return (default: 100, max: 1000)
   * @returns Response containing matching records, count, and truncation status
   * @throws {ApiError} When the API returns an error
   */
  async range(
    startKey: string,
    endKey: string,
    limit = 100,
  ): Promise<RangeResponse> {
    try {
      const params = new URLSearchParams({
        startKey: encodeURIComponent(startKey),
        endKey: encodeURIComponent(endKey),
        limit: limit.toString(),
      });
      return await this._request<RangeResponse>("GET", `/records?${params}`);
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Perform semantic search using Nexus Search
   *
   * Searches for records that match the semantic meaning of the query.
   *
   * @param query - The search query
   * @param options - Search options (topK, minScore)
   * @returns Search results
   * @throws {ApiError} When the API returns an error
   * @throws {Error} When query is empty
   */
  async nexusSearch(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResponse> {
    try {
      if (!query) throw new Error("Query is required");
      const body = {
        query,
        topK: Math.min(Math.max(options.topK || 5, 1), 20),
        minScore: Math.min(Math.max(options.minScore || 0.5, 0), 1),
      };

      return await this._request<SearchResponse>("POST", "/search", {
        body: JSON.stringify(body),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Get AI-generated answers using Nexus Query
   *
   * Retrieves AI-generated answers based on the provided query.
   *
   * @param query - The query for which to generate answers
   * @param options - Query options (topK, minScore)
   * @returns Query results with AI-generated answers
   * @throws {ApiError} When the API returns an error
   * @throws {Error} When query is empty
   */
  async nexusQuery(
    query: string,
    options: QueryOptions = {},
  ): Promise<QueryResponse> {
    try {
      if (!query) throw new Error("Query is required");
      const body = {
        query,
        topK: Math.min(Math.max(options.topK || 5, 1), 20),
        minScore: Math.min(Math.max(options.minScore || 0.5, 0), 1),
      };

      return await this._request<QueryResponse>("POST", "/query", {
        body: JSON.stringify(body),
      });
    } catch (error) {
      this._handleError(error as ApiError);
    }
  }

  /**
   * Handle API errors
   *
   * @private
   * @param error - The API error to handle
   * @throws {ApiError} Enhanced error with additional context
   */
  private _handleError(error: ApiError): never {
    if (error.status) {
      const errorMessage = this._getErrorMessage(error.status, error.data);
      const enhancedError = new Error(errorMessage) as ApiError;
      enhancedError.status = error.status;
      enhancedError.code = error.code;
      enhancedError.data = error.data;
      throw enhancedError;
    } else if (error.message === "Failed to fetch") {
      const networkError = new Error(
        "No response received from server",
      ) as ApiError;
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    } else {
      throw error;
    }
  }

  /**
   * Get human-readable error message based on status code
   *
   * @private
   * @param status - HTTP status code
   * @param data - Error data from the API
   * @returns Human-readable error message
   */
  private _getErrorMessage(status: number, data: unknown): string {
    const messages: Record<number, string> = {
      400: "Invalid parameters or request body",
      401: "Missing or invalid API key",
      403: "Permission denied",
      404: "Record not found",
      409: "Timestamp conflict",
      429: "Rate limit exceeded",
      500: "Server error",
    };

    return (
      (data as { error?: string })?.error ||
      messages[status] ||
      `HTTP error ${status}`
    );
  }
}
