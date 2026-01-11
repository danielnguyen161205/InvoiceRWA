"""
Web3 Service for Invoice NFT Tokenization
Tương tác với smart contract InvoiceNFT
"""

from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
import json
import os
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

class Web3Service:
    def __init__(self):
        # Load configuration from environment
        self.rpc_url = os.getenv('WEB3_RPC_URL', 'http://127.0.0.1:8545')
        self.contract_address = os.getenv('NFT_CONTRACT_ADDRESS')
        self.private_key = os.getenv('WEB3_PRIVATE_KEY')
        self.chain_id = int(os.getenv('WEB3_CHAIN_ID', '1337'))
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Add PoA middleware if needed (for some testnets)
        if self.chain_id in [11155111, 80001]:  # Sepolia, Mumbai
            self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        
        # Load contract ABI
        # Path: Backend/contracts/artifacts/...
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # Go up to Backend/
        abi_path = os.path.join(base_dir, 'contracts/artifacts/contracts/InvoiceNFT.sol/InvoiceNFT.json')
        if os.path.exists(abi_path):
            with open(abi_path, 'r') as f:
                contract_json = json.load(f)
                self.contract_abi = contract_json['abi']
        else:
            print(f"⚠️ Contract ABI not found at {abi_path}")
            print("   Please compile the contract first: cd contracts && npx hardhat compile")
            self.contract_abi = None
        
        # Initialize contract if address provided
        self.contract = None
        if self.contract_address and self.contract_abi:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=self.contract_abi
            )
            print(f"✅ Connected to InvoiceNFT contract at {self.contract_address}")
        
        # Backend wallet account
        if self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)
            print(f"✅ Loaded backend wallet: {self.account.address}")
        else:
            self.account = None
            print("⚠️ No private key provided. Minting will not work.")

    def is_connected(self) -> bool:
        """Check if connected to blockchain"""
        return self.w3.is_connected()

    def get_balance(self, address: str) -> Decimal:
        """Get ETH balance of address"""
        balance_wei = self.w3.eth.get_balance(address)
        return Decimal(self.w3.from_wei(balance_wei, 'ether'))

    def mint_invoice_nft(
        self,
        invoice_id: int,
        seller_address: str,
        buyer_address: str,
        invoice_number: str,
        serial_no: str,
        face_value: Decimal,
        funding_request: Decimal,
        discount_rate: Decimal,
        maturity_date: datetime,
        metadata_uri: str
    ) -> Optional[Dict[str, Any]]:
        """
        Mint NFT for invoice
        
        Args:
            invoice_id: ID from database
            seller_address: SME wallet address
            buyer_address: Buyer wallet address
            invoice_number: Invoice number
            serial_no: Serial number
            face_value: Total invoice value (VND)
            funding_request: Funding amount requested (VND)
            discount_rate: Annual discount rate (e.g., 12.5 for 12.5%)
            maturity_date: Maturity date
            metadata_uri: IPFS or API URL for metadata
            
        Returns:
            Transaction receipt and token ID
        """
        if not self.contract or not self.account:
            raise Exception("Contract not initialized or no wallet available")

        try:
            # Convert VND to wei (for simplicity, 1 VND = 1 wei)
            # In production, you might want to use stablecoin or conversion rate
            face_value_wei = int(face_value)
            funding_request_wei = int(funding_request)
            
            # Convert discount rate to basis points (12.5% = 1250 basis points)
            discount_rate_bp = int(discount_rate * 100)
            
            # Convert maturity date to unix timestamp
            maturity_timestamp = int(maturity_date.timestamp())
            
            # Prepare transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            # Build transaction
            transaction = self.contract.functions.mintInvoice(
                Web3.to_checksum_address(seller_address),
                invoice_id,
                invoice_number,
                serial_no,
                face_value_wei,
                funding_request_wei,
                discount_rate_bp,
                maturity_timestamp,
                Web3.to_checksum_address(buyer_address),
                metadata_uri
            ).build_transaction({
                'chainId': self.chain_id,
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            print(f"📤 Transaction sent: {tx_hash.hex()}")
            
            # Wait for receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if tx_receipt['status'] == 1:
                # Get token ID from event logs
                token_id = self._extract_token_id_from_receipt(tx_receipt)
                
                print(f"✅ Invoice NFT minted successfully!")
                print(f"   Token ID: {token_id}")
                print(f"   Transaction: {tx_hash.hex()}")
                
                return {
                    'success': True,
                    'token_id': token_id,
                    'tx_hash': tx_hash.hex(),
                    'contract_address': self.contract_address,
                    'gas_used': tx_receipt['gasUsed']
                }
            else:
                print(f"❌ Transaction failed")
                return {
                    'success': False,
                    'error': 'Transaction failed',
                    'tx_hash': tx_hash.hex()
                }
                
        except Exception as e:
            print(f"❌ Error minting NFT: {str(e)}")
            raise

    def get_invoice_data(self, token_id: int) -> Optional[Dict[str, Any]]:
        """Get invoice data from blockchain"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        try:
            data = self.contract.functions.getInvoiceData(token_id).call()
            
            return {
                'invoice_id': data[0],
                'invoice_number': data[1],
                'serial_no': data[2],
                'face_value': data[3],
                'funding_request': data[4],
                'discount_rate': data[5] / 100,  # Convert back from basis points
                'maturity_date': datetime.fromtimestamp(data[6]),
                'seller_org': data[7],
                'buyer_org': data[8],
                'bank_purchaser': data[9] if data[9] != '0x0000000000000000000000000000000000000000' else None,
                'is_paid': data[10],
                'is_closed': data[11]
            }
        except Exception as e:
            print(f"❌ Error getting invoice data: {str(e)}")
            return None

    def get_token_id_by_invoice_id(self, invoice_id: int) -> Optional[int]:
        """Get blockchain token ID from database invoice ID"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        try:
            token_id = self.contract.functions.getTokenIdByInvoiceId(invoice_id).call()
            return token_id if token_id > 0 else None
        except Exception as e:
            print(f"❌ Error getting token ID: {str(e)}")
            return None

    def get_owner(self, token_id: int) -> Optional[str]:
        """Get current owner of NFT"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        try:
            owner = self.contract.functions.ownerOf(token_id).call()
            return owner
        except Exception as e:
            print(f"❌ Error getting owner: {str(e)}")
            return None

    def _extract_token_id_from_receipt(self, tx_receipt) -> int:
        """Extract token ID from transaction receipt logs"""
        # Find InvoiceMinted event
        for log in tx_receipt['logs']:
            try:
                # Decode the event
                event_data = self.contract.events.InvoiceMinted().process_log(log)
                return event_data['args']['tokenId']
            except:
                continue
        
        # Fallback: extract from Transfer event (ERC721)
        for log in tx_receipt['logs']:
            try:
                event_data = self.contract.events.Transfer().process_log(log)
                return event_data['args']['tokenId']
            except:
                continue
        
        return None

    def transfer_nft(
        self,
        from_address: str,
        to_address: str,
        token_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Transfer NFT from one address to another (admin only)
        Used when Bank purchases invoice
        
        Args:
            from_address: Current owner (SME)
            to_address: New owner (Bank)
            token_id: Token ID to transfer
            
        Returns:
            Transaction receipt
        """
        if not self.contract or not self.account:
            raise Exception("Contract not initialized or no wallet available")
        
        try:
            # Prepare transaction - using transferFrom as contract owner
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            # Build transaction
            transaction = self.contract.functions.transferFrom(
                Web3.to_checksum_address(from_address),
                Web3.to_checksum_address(to_address),
                token_id
            ).build_transaction({
                'chainId': self.chain_id,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            print(f"📤 NFT Transfer transaction sent: {tx_hash.hex()}")
            
            # Wait for receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if tx_receipt['status'] == 1:
                print(f"✅ NFT transferred successfully from {from_address} to {to_address}")
                return {
                    'success': True,
                    'tx_hash': tx_hash.hex(),
                    'gas_used': tx_receipt['gasUsed'],
                    'from': from_address,
                    'to': to_address,
                    'token_id': token_id
                }
            else:
                print(f"❌ NFT transfer failed")
                return {
                    'success': False,
                    'error': 'Transaction failed'
                }
                
        except Exception as e:
            print(f"❌ Error transferring NFT: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

# Singleton instance
web3_service = Web3Service()
