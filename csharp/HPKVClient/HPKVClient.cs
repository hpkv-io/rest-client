using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using RestSharp;
using HPKVClient.Models;

namespace HPKVClient
{
    /// <summary>
    /// Client for interacting with the HPKV REST API
    /// </summary>
    public class HPKVClient
    {
        private readonly RestClient _client;
        private readonly string _apiKey;
        private readonly JsonSerializerOptions _jsonOptions;

        /// <summary>
        /// Creates a new HPKV client
        /// </summary>
        /// <param name="baseUrl">The base URL for the HPKV API</param>
        /// <param name="apiKey">Your HPKV API key</param>
        public HPKVClient(string baseUrl, string apiKey)
        {
            if (string.IsNullOrEmpty(baseUrl))
                throw new ArgumentException("baseUrl is required", nameof(baseUrl));
            if (string.IsNullOrEmpty(apiKey))
                throw new ArgumentException("apiKey is required", nameof(apiKey));

            _apiKey = apiKey;
            
            var options = new RestClientOptions(baseUrl)
            {
                ThrowOnAnyError = false
            };
            
            _client = new RestClient(options);
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        /// <summary>
        /// Insert or update a record
        /// </summary>
        /// <param name="key">Key to store</param>
        /// <param name="value">Value to store</param>
        /// <param name="partialUpdate">Whether to perform a partial update</param>
        /// <returns>The API response</returns>
        public async Task<OperationResponse> SetAsync(string key, object value, bool partialUpdate = false)
        {
            var request = new RestRequest("/record", Method.Post);
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("x-api-key", _apiKey);

            var payload = new SetRecordRequest
            {
                Key = Uri.EscapeDataString(key),
                Value = value is string ? value : JsonSerializer.Serialize(value),
                PartialUpdate = partialUpdate
            };

            request.AddJsonBody(payload);

            var response = await _client.ExecuteAsync(request);
            HandleErrors(response);

            return JsonSerializer.Deserialize<OperationResponse>(response.Content, _jsonOptions);
        }

        /// <summary>
        /// Get a record by key
        /// </summary>
        /// <param name="key">Key to retrieve</param>
        /// <returns>The record</returns>
        public async Task<GetRecordResponse> GetAsync(string key)
        {
            var request = new RestRequest($"/record/{Uri.EscapeDataString(key)}", Method.Get);
            request.AddHeader("x-api-key", _apiKey);

            var response = await _client.ExecuteAsync(request);
            HandleErrors(response);

            return JsonSerializer.Deserialize<GetRecordResponse>(response.Content, _jsonOptions);
        }

        /// <summary>
        /// Delete a record
        /// </summary>
        /// <param name="key">Key to delete</param>
        /// <returns>The API response</returns>
        public async Task<OperationResponse> DeleteAsync(string key)
        {
            var request = new RestRequest($"/record/{Uri.EscapeDataString(key)}", Method.Delete);
            request.AddHeader("x-api-key", _apiKey);

            var response = await _client.ExecuteAsync(request);
            HandleErrors(response);

            return JsonSerializer.Deserialize<OperationResponse>(response.Content, _jsonOptions);
        }

        /// <summary>
        /// Increment or decrement a numeric value
        /// </summary>
        /// <param name="key">Key to increment/decrement</param>
        /// <param name="increment">Value to add (positive) or subtract (negative)</param>
        /// <returns>The API response with the new value</returns>
        public async Task<IncrementResponse> IncrementAsync(string key, int increment = 1)
        {
            var request = new RestRequest("/record/atomic", Method.Post);
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("x-api-key", _apiKey);

            var payload = new IncrementRequest
            {
                Key = Uri.EscapeDataString(key),
                Increment = increment
            };

            request.AddJsonBody(payload);

            var response = await _client.ExecuteAsync(request);
            HandleErrors(response);

            return JsonSerializer.Deserialize<IncrementResponse>(response.Content, _jsonOptions);
        }

        /// <summary>
        /// Query records within a key range
        /// </summary>
        /// <param name="startKey">Starting key (inclusive)</param>
        /// <param name="endKey">Ending key (inclusive)</param>
        /// <param name="limit">Maximum number of records to return</param>
        /// <returns>Records in the range</returns>
        public async Task<RangeQueryResponse> QueryAsync(string startKey, string endKey, int limit = 100)
        {
            var request = new RestRequest("/records", Method.Get);
            request.AddHeader("x-api-key", _apiKey);
            request.AddParameter("startKey", Uri.EscapeDataString(startKey));
            request.AddParameter("endKey", Uri.EscapeDataString(endKey));
            request.AddParameter("limit", limit);

            var response = await _client.ExecuteAsync(request);
            HandleErrors(response);

            return JsonSerializer.Deserialize<RangeQueryResponse>(response.Content, _jsonOptions);
        }

        /// <summary>
        /// Handle API errors
        /// </summary>
        /// <param name="response">The response to check for errors</param>
        private void HandleErrors(RestResponse response)
        {
            if (!response.IsSuccessful)
            {
                BaseResponse errorResponse = null;
                string message;

                try
                {
                    if (!string.IsNullOrEmpty(response.Content))
                    {
                        errorResponse = JsonSerializer.Deserialize<BaseResponse>(response.Content, _jsonOptions);
                    }
                }
                catch { /* Ignore JSON parse error */ }

                if (errorResponse != null && !string.IsNullOrEmpty(errorResponse.Error))
                {
                    message = errorResponse.Error;
                }
                else
                {
                    message = $"HTTP error {(int)response.StatusCode}";
                }

                var exception = new HPKVException(message)
                {
                    StatusCode = response.StatusCode,
                    ResponseData = errorResponse
                };

                throw exception;
            }
        }
    }

    /// <summary>
    /// Exception thrown for HPKV API errors
    /// </summary>
    public class HPKVException : Exception
    {
        /// <summary>
        /// HTTP status code of the response
        /// </summary>
        public HttpStatusCode StatusCode { get; set; }

        /// <summary>
        /// Data returned in the error response
        /// </summary>
        public BaseResponse ResponseData { get; set; }

        /// <summary>
        /// Creates a new HPKVException
        /// </summary>
        /// <param name="message">Error message</param>
        public HPKVException(string message) : base(message)
        {
        }
    }
} 