import os
import pytest
import json


def pytest_configure(config):
    """Configure pytest"""
    # Add custom markers
    config.addinivalue_line(
        "markers",
        "asyncio: mark test as an async test"
    )


@pytest.fixture(autouse=True)
def check_env_vars():
    """Check if required environment variables are set"""
    required_vars = ["HPKV_API_BASE_URL", "HPKV_API_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        pytest.skip(f"Missing required environment variables: {', '.join(missing_vars)}")


@pytest.fixture
def test_data():
    """Provide test data for tests"""
    return {
        "string": "test value",
        "number": 42,
        "object": {"name": "test", "age": 42},
        "array": [1, 2, 3],
        "boolean": True,
        "null": None
    }


@pytest.fixture
def test_keys():
    """Provide test keys for tests"""
    return {
        "string": "test:key:string",
        "number": "test:key:number",
        "object": "test:key:object",
        "array": "test:key:array",
        "boolean": "test:key:boolean",
        "null": "test:key:null"
    } 