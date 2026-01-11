/**
 * Web3 Wallet Integration for Invoice RWA
 * Kết nối MetaMask và tương tác với smart contract
 */

class Web3Manager {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.chainId = null;
        this.contract = null;
        this.contractAddress = null;
        this.contractABI = null;
    }

    /**
     * Check if MetaMask is installed
     */
    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    /**
     * Connect to MetaMask wallet
     */
    async connectWallet() {
        if (!this.isMetaMaskInstalled()) {
            alert('Vui lòng cài đặt MetaMask extension để sử dụng tính năng blockchain!');
            window.open('https://metamask.io/download/', '_blank');
            return null;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            this.account = accounts[0];
            
            // Get chain ID
            this.chainId = await window.ethereum.request({ 
                method: 'eth_chainId' 
            });
            
            // Initialize Web3
            if (typeof Web3 !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
            } else if (typeof ethers !== 'undefined') {
                // Fallback to ethers.js
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.account = accounts[0];
                this.onAccountChanged(accounts[0]);
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                this.chainId = chainId;
                window.location.reload();
            });
            
            console.log('✅ Connected to wallet:', this.account);
            console.log('🌐 Chain ID:', this.chainId);
            
            return this.account;
            
        } catch (error) {
            console.error('❌ Error connecting to wallet:', error);
            alert('Không thể kết nối ví. Vui lòng kiểm tra MetaMask.');
            return null;
        }
    }

    /**
     * Disconnect wallet
     */
    disconnectWallet() {
        this.account = null;
        this.web3 = null;
        this.contract = null;
        console.log('🔌 Wallet disconnected');
    }

    /**
     * Get current account
     */
    async getCurrentAccount() {
        if (!this.isMetaMaskInstalled()) return null;
        
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            return accounts[0] || null;
        } catch (error) {
            console.error('Error getting account:', error);
            return null;
        }
    }

    /**
     * Get account balance
     */
    async getBalance(address = null) {
        if (!address) address = this.account;
        if (!address) return '0';
        
        try {
            if (this.web3) {
                const balance = await this.web3.eth.getBalance(address);
                return this.web3.utils.fromWei(balance, 'ether');
            } else if (this.provider) {
                const balance = await this.provider.getBalance(address);
                return ethers.utils.formatEther(balance);
            }
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    /**
     * Switch to correct network
     */
    async switchNetwork(chainId) {
        const chainIdHex = '0x' + parseInt(chainId).toString(16);
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            return true;
        } catch (switchError) {
            // Chain not added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await this.addNetwork(chainId);
                    return true;
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    return false;
                }
            }
            console.error('Failed to switch network:', switchError);
            return false;
        }
    }

    /**
     * Add network to MetaMask
     */
    async addNetwork(chainId) {
        const networks = {
            1337: {
                chainId: '0x539',
                chainName: 'Localhost 8545',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null
            },
            11155111: {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
            },
            137: {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com']
            }
        };
        
        const networkConfig = networks[chainId];
        if (!networkConfig) {
            throw new Error('Unknown network');
        }
        
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
        });
    }

    /**
     * Initialize contract
     */
    async initContract(contractAddress, contractABI) {
        this.contractAddress = contractAddress;
        this.contractABI = contractABI;
        
        if (this.web3) {
            this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
        } else if (this.provider) {
            this.contract = new ethers.Contract(contractAddress, contractABI, this.signer);
        }
        
        console.log('✅ Contract initialized at', contractAddress);
    }

    /**
     * Get NFT owner
     */
    async getTokenOwner(tokenId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        
        try {
            if (this.web3) {
                return await this.contract.methods.ownerOf(tokenId).call();
            } else {
                return await this.contract.ownerOf(tokenId);
            }
        } catch (error) {
            console.error('Error getting token owner:', error);
            return null;
        }
    }

    /**
     * Get invoice data from blockchain
     */
    async getInvoiceData(tokenId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        
        try {
            if (this.web3) {
                return await this.contract.methods.getInvoiceData(tokenId).call();
            } else {
                return await this.contract.getInvoiceData(tokenId);
            }
        } catch (error) {
            console.error('Error getting invoice data:', error);
            return null;
        }
    }

    /**
     * Format address for display
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    /**
     * Get network name
     */
    getNetworkName(chainId) {
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0x5': 'Goerli Testnet',
            '0xaa36a7': 'Sepolia Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Mumbai Testnet',
            '0x539': 'Localhost'
        };
        return networks[chainId] || `Unknown (${chainId})`;
    }

    /**
     * Callback when account changes
     */
    onAccountChanged(account) {
        console.log('Account changed to:', account);
        // You can trigger UI updates here
        if (window.updateWalletUI) {
            window.updateWalletUI(account);
        }
    }

    /**
     * Sign message
     */
    async signMessage(message) {
        if (!this.account) {
            throw new Error('No account connected');
        }
        
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, this.account],
            });
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }

    /**
     * Save wallet address to organization
     */
    async saveWalletAddress() {
        if (!this.account) {
            alert('Vui lòng kết nối ví trước!');
            return false;
        }
        
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert('Vui lòng đăng nhập!');
                return false;
            }
            
            const response = await fetch('/api/kyc/organization/wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    wallet_address: this.account
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Wallet address saved:', data);
                alert('Địa chỉ ví đã được lưu thành công!');
                return true;
            } else {
                const error = await response.json();
                alert(`Lỗi: ${error.detail || 'Không thể lưu địa chỉ ví'}`);
                return false;
            }
        } catch (error) {
            console.error('Error saving wallet address:', error);
            alert('Lỗi khi lưu địa chỉ ví');
            return false;
        }
    }
}

// Global instance
const web3Manager = new Web3Manager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Web3Manager;
}
