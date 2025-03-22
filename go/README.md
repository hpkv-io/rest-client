# HPKV Go Client

A Go client library for interacting with the HPKV REST API.

## Installation

```bash
go get github.com/hpkv/rest-client/go
```

## Usage

```go
package main

import (
    "fmt"
    "log"
    
    hpkvclient "github.com/hpkv/rest-client/go"
)

func main() {
    // Create a new client with your API key and base URL
    client, err := hpkvclient.NewClient("https://api-eu-1.hpkv.io", "your-api-key")
    if err != nil {
        log.Fatalf("Failed to create client: %v", err)
    }
    
    // Store a value
    _, err = client.Set("greeting", "Hello, HPKV!", false)
    if err != nil {
        log.Fatalf("Failed to set value: %v", err)
    }
    
    // Retrieve a value
    result, err := client.Get("greeting")
    if err != nil {
        log.Fatalf("Failed to get value: %v", err)
    }
    
    fmt.Printf("Value: %s\n", result.Value)
}
```

## Features

- Set and get string or structured data
- Delete records
- Increment/decrement numeric values
- Query records by key range
- Support for partial updates (JSON merge)
- Robust error handling

## API Reference

### Create a Client

```go
client, err := hpkvclient.NewClient(baseURL, apiKey)
```

### Set a Value

```go
// Simple set
response, err := client.Set("key", "value", false)

// Set with JSON object
data := map[string]interface{}{
    "name": "Alice",
    "age": 30,
}
response, err := client.Set("user:123", data, false)

// Partial update (JSON merge)
update := map[string]interface{}{
    "location": "New York",
}
response, err := client.Set("user:123", update, true)
```

### Get a Value

```go
record, err := client.Get("key")
if err == nil {
    fmt.Println(record.Value)
}
```

### Delete a Value

```go
response, err := client.Delete("key")
```

### Increment/Decrement a Value

```go
// Increment by 5
result, err := client.Increment("counter", 5)

// Decrement by 2
result, err := client.Increment("counter", -2)
```

### Query Records

```go
// Get records with keys between "user:100" and "user:200", limited to 50 results
results, err := client.Query("user:100", "user:200", 50)
for _, record := range results.Records {
    fmt.Printf("%s: %s\n", record.Key, record.Value)
}
```

## Example

See the [example](./example/main.go) for a full demonstration of all features.

## Error Handling

The client provides detailed error information when API requests fail:

```go
_, err := client.Get("nonexistent-key")
if err != nil {
    if hpkvErr, ok := err.(*hpkvclient.HPKVError); ok {
        fmt.Printf("API Error: %s\n", hpkvErr.Message)
        fmt.Printf("Status Code: %d\n", hpkvErr.StatusCode)
    } else {
        fmt.Printf("Network error: %v\n", err)
    }
}
``` 