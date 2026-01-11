from enum import Enum

class Role(str, Enum):
    SME = "SME"
    BUYER = "BUYER"
    BANK = "BANK"
    ADMIN = "ADMIN"