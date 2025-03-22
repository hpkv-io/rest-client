using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HPKVClient.Models
{
    #region Request Models

    /// <summary>
    /// Request model for inserting or updating a record
    /// </summary>
    public class SetRecordRequest
    {
        /// <summary>
        /// Key to store
        /// </summary>
        [JsonPropertyName("key")]
        public string Key { get; set; }

        /// <summary>
        /// Value to store
        /// </summary>
        [JsonPropertyName("value")]
        public object Value { get; set; }

        /// <summary>
        /// Whether to perform a partial update (JSON patch if both values are valid JSON)
        /// </summary>
        [JsonPropertyName("partialUpdate")]
        public bool PartialUpdate { get; set; }
    }

    /// <summary>
    /// Request model for incrementing or decrementing a numeric value
    /// </summary>
    public class IncrementRequest
    {
        /// <summary>
        /// Key to increment/decrement
        /// </summary>
        [JsonPropertyName("key")]
        public string Key { get; set; }

        /// <summary>
        /// Value to add (positive) or subtract (negative)
        /// </summary>
        [JsonPropertyName("increment")]
        public int Increment { get; set; }
    }

    #endregion

    #region Response Models

    /// <summary>
    /// Base response for all API calls
    /// </summary>
    public class BaseResponse
    {
        /// <summary>
        /// Error message if operation failed
        /// </summary>
        [JsonPropertyName("error")]
        public string Error { get; set; }
    }

    /// <summary>
    /// Response for get record operations
    /// </summary>
    public class GetRecordResponse : BaseResponse
    {
        /// <summary>
        /// Key of the record
        /// </summary>
        [JsonPropertyName("key")]
        public string Key { get; set; }

        /// <summary>
        /// Value of the record
        /// </summary>
        [JsonPropertyName("value")]
        public string Value { get; set; }
    }

    /// <summary>
    /// Record item in a range query response
    /// </summary>
    public class RecordItem
    {
        /// <summary>
        /// Key of the record
        /// </summary>
        [JsonPropertyName("key")]
        public string Key { get; set; }

        /// <summary>
        /// Value of the record
        /// </summary>
        [JsonPropertyName("value")]
        public string Value { get; set; }
    }

    /// <summary>
    /// Response for range query operations
    /// </summary>
    public class RangeQueryResponse : BaseResponse
    {
        /// <summary>
        /// List of records matching the query
        /// </summary>
        [JsonPropertyName("records")]
        public List<RecordItem> Records { get; set; }

        /// <summary>
        /// Total number of records returned
        /// </summary>
        [JsonPropertyName("count")]
        public int Count { get; set; }

        /// <summary>
        /// Whether there are more records available beyond the limit
        /// </summary>
        [JsonPropertyName("truncated")]
        public bool Truncated { get; set; }
    }

    /// <summary>
    /// Response for basic operations (set, delete)
    /// </summary>
    public class OperationResponse : BaseResponse
    {
        /// <summary>
        /// Whether the operation was successful
        /// </summary>
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        /// <summary>
        /// Message describing the result of the operation
        /// </summary>
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }

    /// <summary>
    /// Response for increment/decrement operations
    /// </summary>
    public class IncrementResponse : OperationResponse
    {
        /// <summary>
        /// The new value after increment/decrement
        /// </summary>
        [JsonPropertyName("result")]
        public int Result { get; set; }
    }

    #endregion
} 