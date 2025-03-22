package hpkvclient

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strconv"

	"github.com/go-resty/resty/v2"
)

// HPKVClient is a client for interacting with the HPKV REST API
type HPKVClient struct {
	client  *resty.Client
	apiKey  string
	baseURL string
}

// HPKVError represents an error returned by the HPKV API
type HPKVError struct {
	StatusCode   int
	Message      string
	ResponseData *BaseResponse
}

// Error implements the error interface for HPKVError
func (e *HPKVError) Error() string {
	return e.Message
}

// NewClient creates a new HPKV client
// baseURL: The base URL for the HPKV API
// apiKey: Your HPKV API key
func NewClient(baseURL, apiKey string) (*HPKVClient, error) {
	if baseURL == "" {
		return nil, errors.New("baseURL is required")
	}
	if apiKey == "" {
		return nil, errors.New("apiKey is required")
	}

	client := resty.New().
		SetBaseURL(baseURL).
		SetHeader("x-api-key", apiKey)

	return &HPKVClient{
		client:  client,
		apiKey:  apiKey,
		baseURL: baseURL,
	}, nil
}

// Set inserts or updates a record
// key: Key to store
// value: Value to store
// partialUpdate: Whether to perform a partial update
func (c *HPKVClient) Set(key string, value interface{}, partialUpdate bool) (*OperationResponse, error) {
	var valueStr interface{}

	// Handle string values directly, serialize other types to JSON
	switch v := value.(type) {
	case string:
		valueStr = v
	default:
		jsonBytes, err := json.Marshal(v)
		if err != nil {
			return nil, fmt.Errorf("failed to serialize value: %w", err)
		}
		valueStr = string(jsonBytes)
	}

	payload := SetRecordRequest{
		Key:           url.PathEscape(key),
		Value:         valueStr,
		PartialUpdate: partialUpdate,
	}

	response := &OperationResponse{}
	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(payload).
		SetResult(response).
		Post("/record")

	if err != nil {
		return nil, err
	}

	return response, c.handleResponseError(resp)
}

// Get retrieves a record by key
// key: Key to retrieve
func (c *HPKVClient) Get(key string) (*GetRecordResponse, error) {
	response := &GetRecordResponse{}
	resp, err := c.client.R().
		SetResult(response).
		Get("/record/" + url.PathEscape(key))

	if err != nil {
		return nil, err
	}

	return response, c.handleResponseError(resp)
}

// Delete removes a record
// key: Key to delete
func (c *HPKVClient) Delete(key string) (*OperationResponse, error) {
	response := &OperationResponse{}
	resp, err := c.client.R().
		SetResult(response).
		Delete("/record/" + url.PathEscape(key))

	if err != nil {
		return nil, err
	}

	return response, c.handleResponseError(resp)
}

// Increment increments or decrements a numeric value
// key: Key to increment/decrement
// increment: Value to add (positive) or subtract (negative)
func (c *HPKVClient) Increment(key string, increment int) (*IncrementResponse, error) {
	payload := IncrementRequest{
		Key:       url.PathEscape(key),
		Increment: increment,
	}

	response := &IncrementResponse{}
	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(payload).
		SetResult(response).
		Post("/record/atomic")

	if err != nil {
		return nil, err
	}

	return response, c.handleResponseError(resp)
}

// Query fetches records within a key range
// startKey: Starting key (inclusive)
// endKey: Ending key (inclusive)
// limit: Maximum number of records to return
func (c *HPKVClient) Query(startKey, endKey string, limit int) (*RangeQueryResponse, error) {
	response := &RangeQueryResponse{}
	resp, err := c.client.R().
		SetQueryParam("startKey", url.QueryEscape(startKey)).
		SetQueryParam("endKey", url.QueryEscape(endKey)).
		SetQueryParam("limit", strconv.Itoa(limit)).
		SetResult(response).
		Get("/records")

	if err != nil {
		return nil, err
	}

	return response, c.handleResponseError(resp)
}

// handleResponseError checks for and processes API errors
func (c *HPKVClient) handleResponseError(resp *resty.Response) error {
	if resp.IsError() {
		var errorResponse BaseResponse
		var message string

		// Try to parse error response
		err := json.Unmarshal(resp.Body(), &errorResponse)
		if err == nil && errorResponse.Error != "" {
			message = errorResponse.Error
		} else {
			message = fmt.Sprintf("HTTP error %d", resp.StatusCode())
		}

		return &HPKVError{
			StatusCode:   resp.StatusCode(),
			Message:      message,
			ResponseData: &errorResponse,
		}
	}
	return nil
}
