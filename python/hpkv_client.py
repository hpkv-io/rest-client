import json
import urllib.parse
from typing import Any, Dict, List, Optional, Union
import requests


class HPKVException(Exception):
    """Exception thrown for HPKV API errors"""
    
    def __init__(self, message: str, status_code: int = None, response_data: Dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data


class HPKVClient:
    """Client for interacting with the HPKV REST API"""
    
    def __init__(self, base_url: str, api_key: str):
        """
        Create a new HPKV client
        
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
    
    def set(self, key: str, value: Any, partial_update: bool = False) -> Dict[str, Any]:
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
        
        response = requests.post(url, headers=self.headers, json=payload)
        self._handle_errors(response)
        
        return response.json()
    
    def get(self, key: str) -> Dict[str, Any]:
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
        
        response = requests.get(url, headers=self.headers)
        self._handle_errors(response)
        
        return response.json()
    
    def delete(self, key: str) -> Dict[str, Any]:
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
        
        response = requests.delete(url, headers=self.headers)
        self._handle_errors(response)
        
        return response.json()
    
    def increment(self, key: str, increment: int = 1) -> Dict[str, Any]:
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
        
        response = requests.post(url, headers=self.headers, json=payload)
        self._handle_errors(response)
        
        return response.json()
    
    def query(self, start_key: str, end_key: str, limit: int = 100) -> Dict[str, Any]:
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
        
        response = requests.get(url, headers=self.headers, params=params)
        self._handle_errors(response)
        
        return response.json()
    
    def _handle_errors(self, response: requests.Response) -> None:
        """
        Handle API errors
        
        Args:
            response: The response to check for errors
        
        Raises:
            HPKVException: If the response indicates an error
        """
        if not response.ok:
            error_data = None
            message = None
            
            try:
                if response.text:
                    error_data = response.json()
            except json.JSONDecodeError:
                pass
            
            if error_data and "error" in error_data:
                message = error_data["error"]
            else:
                message = f"HTTP error {response.status_code}"
            
            raise HPKVException(message, response.status_code, error_data) 