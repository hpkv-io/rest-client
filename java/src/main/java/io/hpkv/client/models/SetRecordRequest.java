package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request model for inserting or updating a record
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SetRecordRequest {
    /**
     * Key to store
     */
    @JsonProperty("key")
    private String key;

    /**
     * Value to store
     */
    @JsonProperty("value")
    private Object value;

    /**
     * Whether to perform a partial update (JSON patch if both values are valid JSON)
     */
    @JsonProperty("partialUpdate")
    private boolean partialUpdate;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public boolean isPartialUpdate() {
        return partialUpdate;
    }

    public void setPartialUpdate(boolean partialUpdate) {
        this.partialUpdate = partialUpdate;
    }
} 