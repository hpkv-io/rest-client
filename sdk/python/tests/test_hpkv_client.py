import os
import pytest
import json
import urllib.parse
from hpkv_rest_client.hpkv_client import (
    HPKVClient,
    HPKVBadRequestError,
    HPKVUnauthorizedError,
    HPKVNotFoundError,
    HPKVInternalError,
    HPKVForbiddenError
)


@pytest.fixture
def client():
    """Create a client instance using environment variables"""
    base_url = os.getenv("HPKV_API_BASE_URL")
    api_key = os.getenv("HPKV_API_KEY")
    
    if not base_url or not api_key:
        pytest.skip("HPKV_API_BASE_URL and HPKV_API_KEY environment variables must be set")
    
    return HPKVClient(base_url, api_key)


def test_set_and_get(client):
    """Test setting and getting a record"""
    # Test with string value
    key = "test:key:string"
    value = "test value"
    result = client.set(key, value)
    assert result["success"] is True
    
    result = client.get(key)
    assert result["key"] == urllib.parse.quote(key)  # API returns URL-encoded key
    assert result["value"] == value
    
    # Test with JSON value
    key = "test:key:json"
    value = {"name": "test", "age": 42}
    result = client.set(key, value)
    assert result["success"] is True
    
    result = client.get(key)
    assert result["key"] == urllib.parse.quote(key)  # API returns URL-encoded key
    assert result["value"] == json.dumps(value)


def test_delete(client):
    """Test deleting a record"""
    # First create a record
    key = "test:key:delete"
    value = "test value"
    client.set(key, value)
    
    # Delete the record
    result = client.delete(key)
    assert result["success"] is True
    
    # Verify it's deleted
    with pytest.raises(HPKVNotFoundError):
        client.get(key)


def test_increment(client):
    """Test incrementing a numeric value"""
    key = "test:key:counter"
    
    # Set initial value
    client.set(key, "0")
    
    # Test increment
    result = client.increment(key, 1)
    assert result["result"] == 1
    
    # Test decrement
    result = client.increment(key, -1)
    assert result["result"] == 0


def test_query(client):
    """Test querying records in a range"""
    # Create some test records
    records = [
        ("test:query:1", "value 1"),
        ("test:query:2", "value 2"),
        ("test:query:3", "value 3"),
        ("test:other:1", "other 1"),
    ]
    
    for key, value in records:
        client.set(key, value)
    
    # Query records
    result = client.query("test:query:1", "test:query:3")
    assert result["count"] == 3
    assert len(result["records"]) == 3
    
    # Verify record contents
    for record in result["records"]:
        assert urllib.parse.unquote(record["key"]).startswith("test:query:")  # API returns URL-encoded keys
        assert "value" in record


def test_error_handling(client):
    """Test error handling"""
    # Test invalid API key
    invalid_client = HPKVClient(client.base_url, "invalid_key")
    with pytest.raises(HPKVForbiddenError):  # Changed from UnauthorizedError to ForbiddenError
        invalid_client.get("test:key")
    
    # Test non-existent record
    with pytest.raises(HPKVNotFoundError):
        client.get("test:key:nonexistent")
    


def test_partial_update(client):
    """Test partial update functionality"""
    key = "test:key:partial"
    initial_value = {"name": "test", "age": 42}
    
    # Set initial value
    client.set(key, initial_value)
    
    # Partial update
    update_value = {"age": 43}
    client.set(key, update_value, partial_update=True)
    
    # Verify update
    result = client.get(key)
    updated_value = json.loads(result["value"])
    assert updated_value["name"] == "test"  # Original value preserved
    assert updated_value["age"] == 43  # Updated value 