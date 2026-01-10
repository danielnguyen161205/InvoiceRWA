from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum


# === Enums ===

class IdType(str, Enum):
    CCCD = "CCCD"
    CMND = "CMND"
    PASSPORT = "PASSPORT"


class PersonRole(str, Enum):
    LEGAL_REP = "LEGAL_REP"
    AUTHORIZED = "AUTHORIZED"
    SHAREHOLDER = "SHAREHOLDER"
    UBO = "UBO"
    OTHER = "OTHER"


class ShareholderType(str, Enum):
    INDIVIDUAL = "INDIVIDUAL"
    ORGANIZATION = "ORGANIZATION"


# === KYC Person Schemas ===

class KycPersonCreate(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    nationality: str = "Việt Nam"
    id_type: IdType = IdType.CCCD
    id_number: str
    id_issue_date: Optional[date] = None
    id_issue_place: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    role: PersonRole


class KycPersonOut(BaseModel):
    id: int
    org_id: int
    full_name: str
    date_of_birth: Optional[date]
    nationality: str
    id_type: IdType
    id_number: str
    id_issue_date: Optional[date]
    id_issue_place: Optional[str]
    address: Optional[str]
    contact: Optional[str]
    role: PersonRole
    id_document_path: Optional[str]
    
    model_config = {"from_attributes": True}


# === Shareholder Schemas ===

class ShareholderCreate(BaseModel):
    name: str
    shareholder_type: ShareholderType = ShareholderType.INDIVIDUAL
    ownership_percent: Optional[float] = None
    id_number: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None


class ShareholderOut(BaseModel):
    id: int
    org_id: int
    name: str
    shareholder_type: ShareholderType
    ownership_percent: Optional[float]
    id_number: Optional[str]
    address: Optional[str]
    contact: Optional[str]
    
    model_config = {"from_attributes": True}


# === UBO Schemas ===

class UBOCreate(BaseModel):
    is_listed: bool = False
    stock_exchange: Optional[str] = None
    stock_code: Optional[str] = None
    notes: Optional[str] = None


class UBOOut(BaseModel):
    id: int
    org_id: int
    is_listed: bool
    stock_exchange: Optional[str]
    stock_code: Optional[str]
    ownership_documents: Optional[str]
    notes: Optional[str]
    
    model_config = {"from_attributes": True}


# === Combined KYC/UBO Data Schema ===

class KycUboDataCreate(BaseModel):
    """Combined schema for submitting all KYC/UBO data at once"""
    kyc_persons: List[KycPersonCreate] = []
    shareholders: List[ShareholderCreate] = []
    ubo: Optional[UBOCreate] = None


class KycUboDataOut(BaseModel):
    """Combined schema for retrieving all KYC/UBO data"""
    kyc_persons: List[KycPersonOut] = []
    shareholders: List[ShareholderOut] = []
    ubo: Optional[UBOOut] = None
