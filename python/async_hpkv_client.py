import json
import urllib.parse
from typing import Any, Dict, List, Optional, Union
import aiohttp


class HPKVException(Exception):
    """Exception thrown for HPKV API errors"""
    
    def __init__(self, message: str, status_code: int = None, response_data: Dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data


class AsyncHPKVClient:
    """Async client for interacting with the HPKV REST API"""
    
    def __init__(self, base_url: str, api_key: str):
        """
        Create a new async HPKV client
        
        Args:
            base_url: The base URL for the HPKV API
            api_key: Your HPKV API key
        
        Raises:
            ValueError: If base_url or api_key is not provided
        """
        if not base_url:
            raise ValueError("base_url is required")
        if not api_key:
            raise ValueError("api_key is required")
        
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key
        }
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _get_session(self):
        """Get the current session or create a new one"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def set(self, key: str, value: Any, partial_update: bool = False) -> Dict[str, Any]:
        """
        Insert or update a record
        
        Args:
            key: Key to store
            value: Value to store
            partial_update: Whether to perform a partial update
        
        Returns:
            Dict containing the operation response
        
        Raises:
            HPKVException: If the API returns an error
        """
        url = f"{self.base_url}/record"
        
        # Convert value to string if it's an object
        if not isinstance(value, str):
            value = json.dumps(value)
        
        payload = {
            "key": urllib.parse.quote(key),
            "value": value,
            "partialUpdate": partial_update
        }
        
        session = self._get_session()
        async with session.post(url, headers=self.headers, json=payload) as response:
            await self._handle_errors(response)
            return await response.json()
    
    async def get(self, key: str) -> Dict[str, Any]:
        """
        Get a record by key
        
        Args:
            key: Key to retrieve
        
        Returns:
            Dict containing the record data
        
        Raises:
            HPKVException: If the API returns an error
        """
        url = f"{self.base_url}/record/{urllib.parse.quote(key)}"
        
        session = self._get_session()
        async with session.get(url, headers=self.headers) as response:
            await self._handle_errors(response)
            return await response.json()
    
    async def delete(self, key: str) -> Dict[str, Any]:
        """
        Delete a record
        
        Args:
            key: Key to delete
        
        Returns:
            Dict containing the operation response
        
        Raises:
            HPKVException: If the API returns an error
        """
        url = f"{self.base_url}/record/{urllib.parse.quote(key)}"
        
        session = self._get_session()
        async with session.delete(url, headers=self.headers) as response:
            await self._handle_errors(response)
            return await response.json()
    
    async def increment(self, key: str, increment: int = 1) -> Dict[str, Any]:
        """
        Increment or decrement a numeric value
        
        Args:
            key: Key to increment/decrement
            increment: Value to add (positive) or subtract (negative)
        
        Returns:
            Dict containing the operation response with the new value
        
        Raises:
            HPKVException: If the API returns an error
        """
        url = f"{self.base_url}/record/atomic"
        
        payload = {
            "key": urllib.parse.quote(key),
            "increment": increment
        }
        
        session = self._get_session()
        async with session.post(url, headers=self.headers, json=payload) as response:
            await self._handle_errors(response)
            return await response.json()
    
    async def query(self, start_key: str, end_key: str, limit: int = 100) -> Dict[str, Any]:
        """
        Query records within a key range
        
        Args:
            start_key: Starting key (inclusive)
            end_key: Ending key (inclusive)
            limit: Maximum number of records to return
        
        Returns:
            Dict containing the records in the range
        
        Raises:
            HPKVException: If the API returns an error
        """
        url = f"{self.base_url}/records"
        
        params = {
            "startKey": urllib.parse.quote(start_key),
            "endKey": urllib.parse.quote(end_key),
            "limit": limit
        }
        
        session = self._get_session()
        async with session.get(url, headers=self.headers, params=params) as response:
            await self._handle_errors(response)
            return await response.json()
    
    async def _handle_errors(self, response: aiohttp.ClientResponse) -> None:
        """
        Handle API errors
        
        Args:
            response: The response to check for errors
        
        Raises:
            HPKVException: If the response indicates an error
        """
        if response.status >= 400:
            error_data = None
            message = None
            
            try:
                if response.content_length and response.content_length > 0:
                    error_data = await response.json()
            except json.JSONDecodeError:
                pass
            
            if error_data and "error" in error_data:
                message = error_data["error"]
            else:
                message = f"HTTP error {response.status}"
            
            raise HPKVException(message, response.status, error_data) 