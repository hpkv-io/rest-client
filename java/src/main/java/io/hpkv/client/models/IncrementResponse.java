package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response for increment/decrement operations
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IncrementResponse extends OperationResponse {
    /**
     * The new value after increment/decrement
     */
    @JsonProperty("result")
    private int result;

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }
} 