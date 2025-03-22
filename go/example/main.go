package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	hpkvclient "github.com/hpkv/rest-client/go"
)

func main() {
	// Replace with your actual API key and base URL
	const apiKey = "fa7d6c5846884d0cb56f339961531d45"
	const baseURL = "https://api-eu-1.hpkv.io"

	fmt.Println("HPKV Client Examples:")
	fmt.Println("---------------------")

	// Create a new client
	client, err := hpkvclient.NewClient(baseURL, apiKey)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	// Example 1: Set and get a simple value
	fmt.Println("Example 1: Set and get a simple value")
	if _, err := client.Set("greeting", "Hello, HPKV!", false); err != nil {
		log.Printf("Error setting greeting: %v", err)
	}

	greeting, err := client.Get("greeting")
	if err != nil {
		log.Printf("Error getting greeting: %v", err)
	} else {
		fmt.Printf("Retrieved value: %s\n", greeting.Value)
	}
	fmt.Println("---------------------")

	// Example 2: Store and retrieve a JSON object
	fmt.Println("Example 2: Store and retrieve a JSON object")
	user := map[string]interface{}{
		"id":    1001,
		"name":  "Alice Johnson",
		"email": "alice@example.com",
		"roles": []string{"admin", "user"},
	}

	if _, err := client.Set("user:1002", user, false); err != nil {
		log.Printf("Error setting user: %v", err)
	}

	retrievedUser, err := client.Get("user:1002")
	if err != nil {
		log.Printf("Error getting user: %v", err)
	} else {
		fmt.Printf("Retrieved user: %s\n", retrievedUser.Value)
	}
	fmt.Println("---------------------")

	// Example 3: Partial update (JSON merge)
	fmt.Println("Example 3: Partial update (JSON merge)")
	update := map[string]interface{}{
		"lastLogin": time.Now().UTC().Format(time.RFC3339),
		"location":  "New York",
	}

	if _, err := client.Set("user:1002", update, true); err != nil {
		log.Printf("Error updating user: %v", err)
	}

	updatedUser, err := client.Get("user:1002")
	if err != nil {
		log.Printf("Error getting updated user: %v", err)
	} else {
		fmt.Printf("Updated user: %s\n", updatedUser.Value)
	}
	fmt.Println("---------------------")

	// Example 4: Increment counter
	fmt.Println("Example 4: Increment counter")
	if _, err := client.Set("counter:visits", "10", false); err != nil {
		log.Printf("Error setting counter: %v", err)
	}

	initialCounter, err := client.Get("counter:visits")
	if err != nil {
		log.Printf("Error getting counter: %v", err)
	} else {
		fmt.Printf("Initial counter value: %s\n", initialCounter.Value)
	}

	incrementResult, err := client.Increment("counter:visits", 5)
	if err != nil {
		log.Printf("Error incrementing counter: %v", err)
	} else {
		fmt.Printf("After incrementing by 5: %d\n", incrementResult.Result)
	}

	decrementResult, err := client.Increment("counter:visits", -2)
	if err != nil {
		log.Printf("Error decrementing counter: %v", err)
	} else {
		fmt.Printf("After decrementing by 2: %d\n", decrementResult.Result)
	}
	fmt.Println("---------------------")

	// Example 5: Range query
	fmt.Println("Example 5: Range query")
	// First, let's add some test data
	for i := 1; i <= 5; i++ {
		if _, err := client.Set(fmt.Sprintf("test:%d", i), fmt.Sprintf("Value %d", i), false); err != nil {
			log.Printf("Error setting test data %d: %v", i, err)
		}
	}

	rangeResults, err := client.Query("test:1", "test:5", 10)
	if err != nil {
		log.Printf("Error executing range query: %v", err)
	} else {
		fmt.Println("Range query results:")
		for _, record := range rangeResults.Records {
			fmt.Printf("- %s: %s\n", record.Key, record.Value)
		}
		fmt.Printf("Total records: %d\n", rangeResults.Count)
		fmt.Printf("Truncated: %t\n", rangeResults.Truncated)
	}
	fmt.Println("---------------------")

	// Example 6: Delete a record
	fmt.Println("Example 6: Delete a record")
	if _, err := client.Delete("test:3"); err != nil {
		log.Printf("Error deleting test:3: %v", err)
	} else {
		fmt.Println("Deleted test:3")
	}

	// Try to get the deleted record
	_, err = client.Get("test:3")
	if err != nil {
		hpkvErr, ok := err.(*hpkvclient.HPKVError)
		if ok {
			fmt.Printf("Error when trying to get deleted key: %s\n", hpkvErr.Message)
			fmt.Printf("Status code: %d\n", hpkvErr.StatusCode)
			if hpkvErr.ResponseData != nil {
				responseJSON, _ := json.Marshal(hpkvErr.ResponseData)
				fmt.Printf("Response data: %s\n", string(responseJSON))
			}
		} else {
			fmt.Printf("Unexpected error: %v\n", err)
		}
	}
	fmt.Println("---------------------")

	// Cleanup example data
	fmt.Println("Cleaning up example data...")
	keysToDelete := []string{"greeting", "user:1002", "counter:visits", "test:1", "test:2", "test:4", "test:5"}
	for _, key := range keysToDelete {
		if _, err := client.Delete(key); err != nil {
			log.Printf("Error deleting %s: %v", key, err)
		}
	}
	fmt.Println("Cleanup complete!")
}
