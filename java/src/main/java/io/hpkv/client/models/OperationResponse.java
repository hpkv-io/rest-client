package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response for basic operations (set, delete)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OperationResponse extends BaseResponse {
    /**
     * Whether the operation was successful
     */
    @JsonProperty("success")
    private boolean success;

    /**
     * Message describing the result of the operation
     */
    @JsonProperty("message")
    private String message;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
} 