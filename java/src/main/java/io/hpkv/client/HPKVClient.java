package io.hpkv.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import io.hpkv.client.models.*;
import okhttp3.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

/**
 * Client for interacting with the HPKV REST API
 */
public class HPKVClient {
    private final OkHttpClient httpClient;
    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper objectMapper;
    private final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    /**
     * Creates a new HPKV client
     *
     * @param baseUrl The base URL for the HPKV API
     * @param apiKey  Your HPKV API key
     */
    public HPKVClient(String baseUrl, String apiKey) {
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("baseUrl is required");
        }
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("apiKey is required");
        }

        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.apiKey = apiKey;

        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();

        this.objectMapper = new ObjectMapper();
    }

    /**
     * Insert or update a record
     *
     * @param key          Key to store
     * @param value        Value to store
     * @param partialUpdate Whether to perform a partial update
     * @return The API response
     * @throws HPKVException If an API error occurs
     * @throws IOException   If a communication error occurs
     */
    public OperationResponse set(String key, Object value, boolean partialUpdate) throws HPKVException, IOException {
        // If value is a string, use it directly, otherwise serialize it to JSON
        Object valueToStore;
        if (value instanceof String) {
            valueToStore = value;
        } else {
            valueToStore = objectMapper.writeValueAsString(value);
        }

        SetRecordRequest request = new SetRecordRequest();
        request.setKey(encodeKey(key));
        request.setValue(valueToStore);
        request.setPartialUpdate(partialUpdate);

        String jsonBody = objectMapper.writeValueAsString(request);
        RequestBody body = RequestBody.create(jsonBody, JSON);

        Request httpRequest = new Request.Builder()
                .url(baseUrl + "/record")
                .addHeader("x-api-key", apiKey)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(httpRequest).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            
            if (!response.isSuccessful()) {
                throw handleErrorResponse(response.code(), responseBody);
            }

            return objectMapper.readValue(responseBody, OperationResponse.class);
        }
    }

    /**
     * Get a record by key
     *
     * @param key Key to retrieve
     * @return The record
     * @throws HPKVException If an API error occurs
     * @throws IOException   If a communication error occurs
     */
    public GetRecordResponse get(String key) throws HPKVException, IOException {
        Request request = new Request.Builder()
                .url(baseUrl + "/record/" + encodeKey(key))
                .addHeader("x-api-key", apiKey)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";

            if (!response.isSuccessful()) {
                throw handleErrorResponse(response.code(), responseBody);
            }

            return objectMapper.readValue(responseBody, GetRecordResponse.class);
        }
    }

    /**
     * Delete a record
     *
     * @param key Key to delete
     * @return The API response
     * @throws HPKVException If an API error occurs
     * @throws IOException   If a communication error occurs
     */
    public OperationResponse delete(String key) throws HPKVException, IOException {
        Request request = new Request.Builder()
                .url(baseUrl + "/record/" + encodeKey(key))
                .addHeader("x-api-key", apiKey)
                .delete()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";

            if (!response.isSuccessful()) {
                throw handleErrorResponse(response.code(), responseBody);
            }

            return objectMapper.readValue(responseBody, OperationResponse.class);
        }
    }

    /**
     * Increment or decrement a numeric value
     *
     * @param key       Key to increment/decrement
     * @param increment Value to add (positive) or subtract (negative)
     * @return The API response with the new value
     * @throws HPKVException If an API error occurs
     * @throws IOException   If a communication error occurs
     */
    public IncrementResponse increment(String key, int increment) throws HPKVException, IOException {
        IncrementRequest request = new IncrementRequest();
        request.setKey(encodeKey(key));
        request.setIncrement(increment);

        String jsonBody = objectMapper.writeValueAsString(request);
        RequestBody body = RequestBody.create(jsonBody, JSON);

        Request httpRequest = new Request.Builder()
                .url(baseUrl + "/record/atomic")
                .addHeader("x-api-key", apiKey)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(httpRequest).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";

            if (!response.isSuccessful()) {
                throw handleErrorResponse(response.code(), responseBody);
            }

            return objectMapper.readValue(responseBody, IncrementResponse.class);
        }
    }

    /**
     * Query records within a key range
     *
     * @param startKey Starting key (inclusive)
     * @param endKey   Ending key (inclusive)
     * @param limit    Maximum number of records to return
     * @return Records in the range
     * @throws HPKVException If an API error occurs
     * @throws IOException   If a communication error occurs
     */
    public RangeQueryResponse query(String startKey, String endKey, int limit) throws HPKVException, IOException {
        HttpUrl.Builder urlBuilder = HttpUrl.parse(baseUrl + "/records").newBuilder()
                .addQueryParameter("startKey", URLEncoder.encode(startKey, StandardCharsets.UTF_8))
                .addQueryParameter("endKey", URLEncoder.encode(endKey, StandardCharsets.UTF_8))
                .addQueryParameter("limit", String.valueOf(limit));

        Request request = new Request.Builder()
                .url(urlBuilder.build())
                .addHeader("x-api-key", apiKey)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";

            if (!response.isSuccessful()) {
                throw handleErrorResponse(response.code(), responseBody);
            }

            return objectMapper.readValue(responseBody, RangeQueryResponse.class);
        }
    }

    /**
     * Encode a key for URL path inclusion
     *
     * @param key Key to encode
     * @return Encoded key
     */
    private String encodeKey(String key) {
        return URLEncoder.encode(key, StandardCharsets.UTF_8);
    }

    /**
     * Handle API errors
     *
     * @param statusCode HTTP status code
     * @param responseBody Response body as string
     * @return An exception with error details
     */
    private HPKVException handleErrorResponse(int statusCode, String responseBody) {
        String message;
        BaseResponse errorResponse = null;

        try {
            if (responseBody != null && !responseBody.isEmpty()) {
                errorResponse = objectMapper.readValue(responseBody, BaseResponse.class);
                if (errorResponse.getError() != null && !errorResponse.getError().isEmpty()) {
                    message = errorResponse.getError();
                } else {
                    message = "HTTP error " + statusCode;
                }
            } else {
                message = "HTTP error " + statusCode;
            }
        } catch (JsonProcessingException e) {
            message = "HTTP error " + statusCode + " (Invalid response format)";
        }

        return new HPKVException(message, statusCode, errorResponse);
    }
} 