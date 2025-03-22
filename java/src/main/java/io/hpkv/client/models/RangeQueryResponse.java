package io.hpkv.client.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Response for range query operations
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RangeQueryResponse extends BaseResponse {
    /**
     * List of records matching the query
     */
    @JsonProperty("records")
    private List<RecordItem> records;

    /**
     * Total number of records returned
     */
    @JsonProperty("count")
    private int count;

    /**
     * Whether there are more records available beyond the limit
     */
    @JsonProperty("truncated")
    private boolean truncated;

    public List<RecordItem> getRecords() {
        return records;
    }

    public void setRecords(List<RecordItem> records) {
        this.records = records;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public boolean isTruncated() {
        return truncated;
    }

    public void setTruncated(boolean truncated) {
        this.truncated = truncated;
    }
} 