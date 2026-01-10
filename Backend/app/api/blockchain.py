"""
Blockchain API endpoints for invoice tokenization
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

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
    Only invoice owner (SME) or admin can mint
    """
    # Get invoice
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if already minted
    if invoice.token_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invoice already tokenized with token ID: {invoice.token_id}"
        )
    
    # Check permissions (must be invoice owner or admin)
    if invoice.sme_org_id != current_user.organization_id and "ADMIN" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only invoice owner or admin can mint NFT"
        )
    
    # Get seller and buyer organizations
    from app.models.organization import Organization
    seller_org = db.query(Organization).filter(
        Organization.id == invoice.sme_org_id
    ).first()
    buyer_org = db.query(Organization).filter(
        Organization.id == invoice.buyer_org_id
    ).first()
    
    if not seller_org or not buyer_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seller or buyer organization not found"
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
        result = web3_service.mint_invoice_nft(
            invoice_id=invoice.id,
            seller_address=seller_org.wallet_address,
            buyer_address=buyer_org.wallet_address,
            invoice_number=invoice.invoice_number,
            serial_no=invoice.serial_no or "",
            face_value=invoice.amount,
            funding_request=invoice.amount * (invoice.proposed_ltv or 0.8),
            discount_rate=invoice.discount_rate or 0.0,
            maturity_date=str(invoice.issue_date) if invoice.issue_date else "",
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
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input parameters for NFT minting"
        )
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Blockchain service unavailable. Please try again later."
        )
    except Exception as e:
        # Log the actual error for debugging but don't expose to client
        import logging
        logging.error(f"Error minting NFT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mint NFT. Please contact support if the issue persists."
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
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token ID or invoice not found"
        )
    except ConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Blockchain service unavailable. Please try again later."
        )
    except Exception as e:
        import logging
        logging.error(f"Error fetching token data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch token data. Please try again later."
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
