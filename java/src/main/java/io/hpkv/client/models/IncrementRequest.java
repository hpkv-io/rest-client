package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request model for incrementing or decrementing a numeric value
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IncrementRequest {
    /**
     * Key to increment/decrement
     */
    @JsonProperty("key")
    private String key;

    /**
     * Value to add (positive) or subtract (negative)
     */
    @JsonProperty("increment")
    private int increment;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public int getIncrement() {
        return increment;
    }

    public void setIncrement(int increment) {
        this.increment = increment;
    }
} 