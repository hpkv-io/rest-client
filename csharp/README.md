# HPKV REST Client for C#

A C# client library for interacting with the HPKV (High-Performance Key-Value) REST API.

## Features

- Simple and intuitive API
- Async/await support
- Comprehensive error handling
- Strongly-typed request and response models
- Supports all HPKV operations:
  - Get/Set/Delete records
  - Atomic increments
  - Range queries
  - Partial updates

## Installation

### Via NuGet (coming soon)

```bash
dotnet add package HPKVClient
```

### Manual Installation

1. Clone this repository
2. Build the solution
3. Reference the HPKVClient assembly in your project

## Usage

```csharp
using System;
using System.Threading.Tasks;
using HPKVClient;
using HPKVClient.Models;

class Program
{
    static async Task Main(string[] args)
    {
        // Initialize the client
        var client = new HPKVClient.HPKVClient(
            "https://api-eu-1.hpkv.io",  // Your HPKV API endpoint
            "your-api-key"               // Your HPKV API key
        );

        // Set a value
        await client.SetAsync("mykey", "Hello, HPKV!");

        // Get a value
        var result = await client.GetAsync("mykey");
        Console.WriteLine($"Value: {result.Value}");

        // Store a complex object
        var user = new
        {
            id = 1001,
            name = "John Doe",
            email = "john@example.com"
        };
        await client.SetAsync("user:1001", user);

        // Partial update
        await client.SetAsync("user:1001", new { lastLogin = DateTime.UtcNow }, partialUpdate: true);

        // Increment a counter
        await client.SetAsync("visits", "10");
        var newValue = await client.IncrementAsync("visits", 5);
        Console.WriteLine($"New count: {newValue.Result}");

        // Query a range of keys
        var rangeResult = await client.QueryAsync("user:1000", "user:2000", 100);
        foreach (var record in rangeResult.Records)
        {
            Console.WriteLine($"{record.Key}: {record.Value}");
        }
        
        Console.WriteLine($"Total records: {rangeResult.Count}");
        Console.WriteLine($"Truncated: {rangeResult.Truncated}");

        // Delete a key
        await client.DeleteAsync("mykey");
    }
}
```

## Response Models

The client uses strongly-typed models for API responses:

- `GetRecordResponse` - Response when retrieving a single record
- `RangeQueryResponse` - Response when querying a range of records
- `OperationResponse` - Response for set/delete operations
- `IncrementResponse` - Response for increment/decrement operations

## Error Handling

The client throws `HPKVException` when an API error occurs. This exception includes:

- Error message
- HTTP status code
- Response data

Example:

```csharp
try
{
    await client.GetAsync("non-existent-key");
}
catch (HPKVException ex)
{
    Console.WriteLine($"Error: {ex.Message}");
    Console.WriteLine($"Status code: {(int)ex.StatusCode}");
}
```

## License

MIT License 