package io.hpkv.client;

import io.hpkv.client.models.BaseResponse;

/**
 * Exception thrown for HPKV API errors
 */
public class HPKVException extends Exception {
    private final int statusCode;
    private final BaseResponse responseData;

    /**
     * Creates a new HPKVException
     *
     * @param message      Error message
     * @param statusCode   HTTP status code
     * @param responseData Data returned in the error response
     */
    public HPKVException(String message, int statusCode, BaseResponse responseData) {
        super(message);
        this.statusCode = statusCode;
        this.responseData = responseData;
    }

    /**
     * HTTP status code of the response
     */
    public int getStatusCode() {
        return statusCode;
    }

    /**
     * Data returned in the error response
     */
    public BaseResponse getResponseData() {
        return responseData;
    }
} 