package hpkvclient

// Request Models

// SetRecordRequest represents a request to insert or update a record
type SetRecordRequest struct {
	// Key to store
	Key string `json:"key"`
	// Value to store
	Value interface{} `json:"value"`
	// Whether to perform a partial update (JSON patch if both values are valid JSON)
	PartialUpdate bool `json:"partialUpdate"`
}

// IncrementRequest represents a request to increment or decrement a numeric value
type IncrementRequest struct {
	// Key to increment/decrement
	Key string `json:"key"`
	// Value to add (positive) or subtract (negative)
	Increment int `json:"increment"`
}

// Response Models

// BaseResponse is the base for all API responses
type BaseResponse struct {
	// Error message if operation failed
	Error string `json:"error,omitempty"`
}

// GetRecordResponse is the response for get record operations
type GetRecordResponse struct {
	BaseResponse
	// Key of the record
	Key string `json:"key,omitempty"`
	// Value of the record
	Value string `json:"value,omitempty"`
}

// RecordItem represents a record in a range query response
type RecordItem struct {
	// Key of the record
	Key string `json:"key,omitempty"`
	// Value of the record
	Value string `json:"value,omitempty"`
}

// RangeQueryResponse is the response for range query operations
type RangeQueryResponse struct {
	BaseResponse
	// List of records matching the query
	Records []RecordItem `json:"records,omitempty"`
	// Total number of records returned
	Count int `json:"count,omitempty"`
	// Whether there are more records available beyond the limit
	Truncated bool `json:"truncated,omitempty"`
}

// OperationResponse is the response for basic operations (set, delete)
type OperationResponse struct {
	BaseResponse
	// Whether the operation was successful
	Success bool `json:"success,omitempty"`
	// Message describing the result of the operation
	Message string `json:"message,omitempty"`
}

// IncrementResponse is the response for increment/decrement operations
type IncrementResponse struct {
	OperationResponse
	// The new value after increment/decrement
	Result int `json:"result,omitempty"`
} 