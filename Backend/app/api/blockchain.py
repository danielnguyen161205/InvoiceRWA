"""
Blockchain API endpoints for invoice tokenization
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, date

from app.db.session import get_db
from app.models.invoice import Invoice
from app.services.web3_service import web3_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/mint/{invoice_id}")
async def mint_invoice_nft(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mint NFT for an invoice
    Only ADMIN can mint NFT
    Invoice must be in SUBMITTED or APPROVED status
    NFT is initially owned by SME, will transfer to Bank when purchased
    """
    # Check permissions - ONLY ADMIN can mint
    user_roles = current_user.get("roles") or ([current_user.get("role")] if current_user.get("role") else [])
    if "ADMIN" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ADMIN can mint NFT"
        )
    
    # Get invoice
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check invoice status - must be SUBMITTED or APPROVED
    if invoice.status not in ["SUBMITTED", "APPROVED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only mint NFT for SUBMITTED or APPROVED invoices. Current status: {invoice.status}"
        )
    
    # Check if already minted
    if invoice.token_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invoice already tokenized with token ID: {invoice.token_id}"
        )
    
    # Get seller and buyer organizations
    from app.models.organization import Organization
    seller_org = db.query(Organization).filter(
        Organization.id == invoice.sme_org_id
    ).first()
    buyer_org = db.query(Organization).filter(
        Organization.id == invoice.buyer_org_id
    ).first()
    
    # Provide specific error messages
    if not invoice.sme_org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice does not have a seller organization (sme_org_id is missing)"
        )
    if not invoice.buyer_org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice does not have a buyer organization (buyer_org_id is missing)"
        )
    if not seller_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seller organization (ID: {invoice.sme_org_id}) not found in database"
        )
    if not buyer_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Buyer organization (ID: {invoice.buyer_org_id}) not found in database"
        )
    
    # Check if organizations have wallet addresses
    if not seller_org.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seller organization does not have a wallet address. Please set up wallet first."
        )
    
    if not buyer_org.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Buyer organization does not have a wallet address. Please set up wallet first."
        )
    
    # Generate metadata URI (you can implement IPFS upload here)
    metadata_uri = f"https://api.invoicerwa.com/metadata/invoice/{invoice_id}"
    
    try:
        # Mint NFT on blockchain
        # Prepare maturity date as datetime object
        maturity_date = invoice.issue_date
        if isinstance(invoice.issue_date, str):
            # Convert string to datetime if needed
            from dateutil import parser
            maturity_date = parser.parse(invoice.issue_date)
        elif not hasattr(maturity_date, 'timestamp'):
            # If it's a date object, convert to datetime
            from datetime import date
            if isinstance(maturity_date, date):
                maturity_date = datetime.combine(maturity_date, datetime.min.time())
        
        result = web3_service.mint_invoice_nft(
            invoice_id=invoice.id,
            seller_address=seller_org.wallet_address,
            buyer_address=buyer_org.wallet_address,
            invoice_number=invoice.invoice_number,
            serial_no=invoice.serial_no or "",
            face_value=invoice.amount,
            funding_request=invoice.amount * (invoice.proposed_ltv or 0.8),
            discount_rate=invoice.discount_rate or 0.0,
            maturity_date=maturity_date,
            metadata_uri=metadata_uri
        )
        
        if result['success']:
            # Update invoice with blockchain data
            invoice.token_id = str(result['token_id'])
            invoice.nft_contract_address = web3_service.contract_address
            invoice.token_standard = "ERC-721"
            invoice.blockchain_tx_hash = result['tx_hash']
            invoice.tokenized_at = datetime.now()
            db.commit()
            
            return {
                "success": True,
                "message": "Invoice NFT minted successfully",
                "token_id": result['token_id'],
                "tx_hash": result['tx_hash'],
                "contract_address": result['contract_address'],
                "gas_used": result['gas_used'],
                "explorer_url": f"https://etherscan.io/tx/{result['tx_hash']}"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to mint NFT: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error minting NFT: {str(e)}"
        )

@router.get("/token/{invoice_id}")
async def get_invoice_token(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get blockchain token information for an invoice
    """
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    if not invoice.token_id:
        return {
            "tokenized": False,
            "message": "Invoice not yet tokenized"
        }
    
    try:
        # Get token data from blockchain
        token_id = int(invoice.token_id)
        blockchain_data = web3_service.get_invoice_data(token_id)
        owner = web3_service.get_owner(token_id)
        
        return {
            "tokenized": True,
            "token_id": token_id,
            "contract_address": invoice.nft_contract_address,
            "token_standard": invoice.token_standard,
            "mint_tx_hash": invoice.blockchain_tx_hash,
            "current_owner": owner,
            "blockchain_data": blockchain_data,
            "explorer_url": f"https://etherscan.io/token/{invoice.nft_contract_address}?a={token_id}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching token data: {str(e)}"
        )

@router.get("/status")
async def blockchain_status():
    """
    Get blockchain connection status
    """
    try:
        connected = web3_service.is_connected()
        
        if not connected:
            return {
                "connected": False,
                "message": "Not connected to blockchain"
            }
        
        # Get network info
        chain_id = web3_service.chain_id
        latest_block = web3_service.w3.eth.block_number
        
        # Get backend wallet balance
        balance = None
        if web3_service.account:
            balance = float(web3_service.get_balance(web3_service.account.address))
        
        return {
            "connected": True,
            "rpc_url": web3_service.rpc_url,
            "chain_id": chain_id,
            "network": _get_network_name(chain_id),
            "latest_block": latest_block,
            "contract_address": web3_service.contract_address,
            "backend_wallet": web3_service.account.address if web3_service.account else None,
            "backend_wallet_balance": balance
        }
        
    except Exception as e:
        return {
            "connected": False,
            "error": str(e)
        }

def _get_network_name(chain_id: int) -> str:
    """Get network name from chain ID"""
    networks = {
        1: "Ethereum Mainnet",
        5: "Goerli Testnet",
        11155111: "Sepolia Testnet",
        137: "Polygon Mainnet",
        80001: "Polygon Mumbai",
        1337: "Localhost"
    }
    return networks.get(chain_id, f"Unknown (Chain ID: {chain_id})")
