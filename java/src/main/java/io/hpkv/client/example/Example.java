package io.hpkv.client.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.hpkv.client.HPKVClient;
import io.hpkv.client.HPKVException;
import io.hpkv.client.models.GetRecordResponse;
import io.hpkv.client.models.IncrementResponse;
import io.hpkv.client.models.RangeQueryResponse;
import io.hpkv.client.models.RecordItem;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class Example {
    // Replace with your actual API key and base URL
    private static final String API_KEY = "fa7d6c5846884d0cb56f339961531d45";
    private static final String BASE_URL = "https://api-eu-1.hpkv.io";

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        try {
            System.out.println("HPKV Client Examples:");
            System.out.println("---------------------");

            HPKVClient client = new HPKVClient(BASE_URL, API_KEY);

            // Example 1: Set and get a simple value
            System.out.println("Example 1: Set and get a simple value");
            client.set("greeting", "Hello, HPKV!", false);
            GetRecordResponse greeting = client.get("greeting");
            System.out.println("Retrieved value: " + greeting.getValue());
            System.out.println("---------------------");

            // Example 2: Store and retrieve a JSON object
            System.out.println("Example 2: Store and retrieve a JSON object");
            Map<String, Object> user = new HashMap<>();
            user.put("id", 1001);
            user.put("name", "Alice Johnson");
            user.put("email", "alice@example.com");
            user.put("roles", Arrays.asList("admin", "user"));

            client.set("user:1002", user, false);
            GetRecordResponse retrievedUser = client.get("user:1002");
            System.out.println("Retrieved user: " + retrievedUser.getValue());
            System.out.println("---------------------");

            // Example 3: Partial update (JSON merge)
            System.out.println("Example 3: Partial update (JSON merge)");
            Map<String, Object> update = new HashMap<>();
            update.put("lastLogin", Instant.now().toString());
            update.put("location", "New York");

            client.set("user:1002", update, true);
            GetRecordResponse updatedUser = client.get("user:1002");
            System.out.println("Updated user: " + updatedUser.getValue());
            System.out.println("---------------------");

            // Example 4: Increment counter
            System.out.println("Example 4: Increment counter");
            client.set("counter:visits", "10", false);
            GetRecordResponse initialCounter = client.get("counter:visits");
            System.out.println("Initial counter value: " + initialCounter.getValue());

            IncrementResponse incrementResult = client.increment("counter:visits", 5);
            System.out.println("After incrementing by 5: " + incrementResult.getResult());

            IncrementResponse decrementResult = client.increment("counter:visits", -2);
            System.out.println("After decrementing by 2: " + decrementResult.getResult());
            System.out.println("---------------------");

            // Example 5: Range query
            System.out.println("Example 5: Range query");
            // First, let's add some test data
            for (int i = 1; i <= 5; i++) {
                client.set("test:" + i, "Value " + i, false);
            }

            RangeQueryResponse rangeResults = client.query("test:1", "test:5", 10);
            System.out.println("Range query results:");
            for (RecordItem record : rangeResults.getRecords()) {
                System.out.println("- " + record.getKey() + ": " + record.getValue());
            }
            System.out.println("Total records: " + rangeResults.getCount());
            System.out.println("Truncated: " + rangeResults.isTruncated());
            System.out.println("---------------------");

            // Example 6: Delete a record
            System.out.println("Example 6: Delete a record");
            client.delete("test:3");
            System.out.println("Deleted test:3");

            try {
                client.get("test:3");
            } catch (HPKVException error) {
                System.out.println("Error when trying to get deleted key: " + error.getMessage());
                System.out.println("Status code: " + error.getStatusCode());
                if (error.getResponseData() != null) {
                    System.out.println("Response data: " + objectMapper.writeValueAsString(error.getResponseData()));
                }
            }
            System.out.println("---------------------");

            // Cleanup example data
            System.out.println("Cleaning up example data...");
            String[] keysToDelete = {"greeting", "user:1002", "counter:visits", "test:1", "test:2", "test:4", "test:5"};
            for (String key : keysToDelete) {
                try {
                    client.delete(key);
                } catch (HPKVException e) {
                    System.out.println("Error deleting " + key + ": " + e.getMessage());
                }
            }
            System.out.println("Cleanup complete!");

        } catch (HPKVException e) {
            System.out.println("Error: " + e.getMessage());
            System.out.println("Status code: " + e.getStatusCode());
            try {
                if (e.getResponseData() != null) {
                    System.out.println("Response data: " + objectMapper.writeValueAsString(e.getResponseData()));
                }
            } catch (IOException jsonError) {
                System.out.println("Failed to serialize error response: " + jsonError.getMessage());
            }
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 