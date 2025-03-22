package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Record item in a range query response
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecordItem {
    /**
     * Key of the record
     */
    @JsonProperty("key")
    private String key;

    /**
     * Value of the record
     */
    @JsonProperty("value")
    private String value;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
} 