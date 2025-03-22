from dataclasses import dataclass
from typing import Dict, List, Optional, Any, Union


# Request Models

@dataclass
class SetRecordRequest:
    """Request model for inserting or updating a record"""
    key: str
    value: Union[str, Dict[str, Any]]
    partial_update: bool = False


@dataclass
class IncrementRequest:
    """Request model for incrementing or decrementing a numeric value"""
    key: str
    increment: int


# Response Models

@dataclass
class BaseResponse:
    """Base response for all API calls"""
    error: Optional[str] = None


@dataclass
class GetRecordResponse(BaseResponse):
    """Response for get record operations"""
    key: Optional[str] = None
    value: Optional[str] = None


@dataclass
class RecordItem:
    """Record item in a range query response"""
    key: str
    value: str


@dataclass
class RangeQueryResponse(BaseResponse):
    """Response for range query operations"""
    records: Optional[List[RecordItem]] = None
    count: int = 0
    truncated: bool = False


@dataclass
class OperationResponse(BaseResponse):
    """Response for basic operations (set, delete)"""
    success: bool = False
    message: Optional[str] = None


@dataclass
class IncrementResponse(OperationResponse):
    """Response for increment/decrement operations"""
    result: int = 0 