package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Base response for all API calls
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BaseResponse {
    /**
     * Error message if operation failed
     */
    @JsonProperty("error")
    private String error;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
} 