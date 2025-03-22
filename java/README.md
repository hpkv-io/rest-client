# HPKV Java Client

A Java client library for interacting with the HPKV REST API.

## Requirements

- Java 11 or higher
- Maven 3.6 or higher

## Installation

Add the following to your `pom.xml`:

```xml
<dependency>
    <groupId>io.hpkv</groupId>
    <artifactId>hpkv-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Usage

```java
import io.hpkv.client.HPKVClient;
import io.hpkv.client.HPKVException;
import io.hpkv.client.models.GetRecordResponse;

public class Example {
    public static void main(String[] args) {
        try {
            // Create a new client with your API key and base URL
            HPKVClient client = new HPKVClient("https://api-eu-1.hpkv.io", "your-api-key");
            
            // Store a value
            client.set("greeting", "Hello, HPKV!", false);
            
            // Retrieve a value
            GetRecordResponse result = client.get("greeting");
            System.out.println("Value: " + result.getValue());
            
        } catch (HPKVException e) {
            System.out.println("API Error: " + e.getMessage());
            System.out.println("Status code: " + e.getStatusCode());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
        }
    }
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

```java
HPKVClient client = new HPKVClient(baseUrl, apiKey);
```

### Set a Value

```java
// Simple set
OperationResponse response = client.set("key", "value", false);

// Set with JSON object
Map<String, Object> data = new HashMap<>();
data.put("name", "Alice");
data.put("age", 30);
OperationResponse response = client.set("user:123", data, false);

// Partial update (JSON merge)
Map<String, Object> update = new HashMap<>();
update.put("location", "New York");
OperationResponse response = client.set("user:123", update, true);
```

### Get a Value

```java
GetRecordResponse record = client.get("key");
String value = record.getValue();
```

### Delete a Value

```java
OperationResponse response = client.delete("key");
```

### Increment/Decrement a Value

```java
// Increment by 5
IncrementResponse result = client.increment("counter", 5);

// Decrement by 2
IncrementResponse result = client.increment("counter", -2);
```

### Query Records

```java
// Get records with keys between "user:100" and "user:200", limited to 50 results
RangeQueryResponse results = client.query("user:100", "user:200", 50);
for (RecordItem record : results.getRecords()) {
    System.out.println(record.getKey() + ": " + record.getValue());
}
```

## Example

See the [example](./src/main/java/io/hpkv/client/example/Example.java) for a full demonstration of all features.

## Error Handling

The client provides detailed error information when API requests fail:

```java
try {
    client.get("nonexistent-key");
} catch (HPKVException e) {
    System.out.println("API Error: " + e.getMessage());
    System.out.println("Status Code: " + e.getStatusCode());
    if (e.getResponseData() != null) {
        System.out.println("Error details: " + e.getResponseData().getError());
    }
} catch (IOException e) {
    System.out.println("Network error: " + e.getMessage());
}
``` 