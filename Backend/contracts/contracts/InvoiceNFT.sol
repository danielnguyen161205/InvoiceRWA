// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InvoiceNFT
 * @dev NFT Contract for Invoice Tokenization (RWA)
 * Mỗi hóa đơn = 1 NFT ERC-721
 */
contract InvoiceNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Struct lưu metadata invoice onchain
    struct InvoiceData {
        uint256 invoiceId;           // ID từ database backend
        string invoiceNumber;        // Số hóa đơn
        string serialNo;             // Ký hiệu
        uint256 faceValue;           // Mệnh giá (wei)
        uint256 fundingRequest;      // Số tiền giải ngân (wei)
        uint256 discountRate;        // Lãi suất chiết khấu (basis points: 1250 = 12.5%)
        uint256 maturityDate;        // Ngày đáo hạn (Unix timestamp)
        address sellerOrg;           // Địa chỉ ví SME
        address buyerOrg;            // Địa chỉ ví Buyer
        address bankPurchaser;       // Ngân hàng mua (nếu có)
        bool isPaid;                 // Đã thanh toán chưa
        bool isClosed;               // Đã đóng chưa
    }

    // Mapping từ tokenId → Invoice Data
    mapping(uint256 => InvoiceData) public invoices;
    
    // Mapping từ backend invoiceId → tokenId
    mapping(uint256 => uint256) public invoiceIdToTokenId;
    
    // Event khi mint invoice NFT
    event InvoiceMinted(
        uint256 indexed tokenId,
        uint256 indexed invoiceId,
        string invoiceNumber,
        address indexed seller,
        uint256 faceValue
    );
    
    // Event khi invoice được mua bởi Bank
    event InvoicePurchased(
        uint256 indexed tokenId,
        address indexed bank,
        uint256 purchasePrice
    );
    
    // Event khi invoice được thanh toán
    event InvoicePaid(
        uint256 indexed tokenId,
        address indexed payer
    );
    
    // Event khi invoice đóng hoàn tất
    event InvoiceClosed(
        uint256 indexed tokenId
    );

    constructor() ERC721("InvoiceRWA", "INVOICE") Ownable(msg.sender) {}

    /**
     * @dev Mint Invoice NFT (chỉ owner - backend service có thể gọi)
     * @param _to Địa chỉ SME nhận NFT (seller)
     * @param _invoiceId ID invoice từ database
     * @param _invoiceNumber Số hóa đơn
     * @param _serialNo Ký hiệu
     * @param _faceValue Mệnh giá (wei)
     * @param _fundingRequest Số tiền giải ngân (wei)
     * @param _discountRate Lãi suất (basis points)
     * @param _maturityDate Ngày đáo hạn (timestamp)
     * @param _buyerOrg Địa chỉ buyer
     * @param _tokenURI Metadata URI (IPFS hoặc backend API)
     */
    function mintInvoice(
        address _to,
        uint256 _invoiceId,
        string memory _invoiceNumber,
        string memory _serialNo,
        uint256 _faceValue,
        uint256 _fundingRequest,
        uint256 _discountRate,
        uint256 _maturityDate,
        address _buyerOrg,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        require(_to != address(0), "Invalid seller address");
        require(_buyerOrg != address(0), "Invalid buyer address");
        require(_faceValue > 0, "Face value must be positive");
        require(invoiceIdToTokenId[_invoiceId] == 0, "Invoice already minted");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        // Mint NFT
        _safeMint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        // Lưu invoice data
        invoices[newTokenId] = InvoiceData({
            invoiceId: _invoiceId,
            invoiceNumber: _invoiceNumber,
            serialNo: _serialNo,
            faceValue: _faceValue,
            fundingRequest: _fundingRequest,
            discountRate: _discountRate,
            maturityDate: _maturityDate,
            sellerOrg: _to,
            buyerOrg: _buyerOrg,
            bankPurchaser: address(0),
            isPaid: false,
            isClosed: false
        });

        invoiceIdToTokenId[_invoiceId] = newTokenId;

        emit InvoiceMinted(newTokenId, _invoiceId, _invoiceNumber, _to, _faceValue);
        
        return newTokenId;
    }

    /**
     * @dev Bank mua invoice (transfer ownership)
     * @param _tokenId Token ID của invoice
     */
    function purchaseInvoice(uint256 _tokenId) public payable {
        require(_ownerOf(_tokenId) != address(0), "Invoice does not exist");
        InvoiceData storage invoice = invoices[_tokenId];
        require(!invoice.isPaid, "Invoice already paid");
        require(invoice.bankPurchaser == address(0), "Already purchased");
        require(msg.value >= invoice.fundingRequest, "Insufficient payment");

        address seller = ownerOf(_tokenId);
        
        // Transfer NFT to bank
        _transfer(seller, msg.sender, _tokenId);
        
        // Update bank purchaser
        invoice.bankPurchaser = msg.sender;
        
        // Transfer funds to seller
        payable(seller).transfer(invoice.fundingRequest);
        
        // Refund excess if any
        if (msg.value > invoice.fundingRequest) {
            payable(msg.sender).transfer(msg.value - invoice.fundingRequest);
        }

        emit InvoicePurchased(_tokenId, msg.sender, invoice.fundingRequest);
    }

    /**
     * @dev Buyer thanh toán invoice (chỉ buyer có thể gọi)
     * @param _tokenId Token ID
     */
    function payInvoice(uint256 _tokenId) public payable {
        require(_ownerOf(_tokenId) != address(0), "Invoice does not exist");
        InvoiceData storage invoice = invoices[_tokenId];
        require(msg.sender == invoice.buyerOrg, "Only buyer can pay");
        require(!invoice.isPaid, "Already paid");
        require(msg.value >= invoice.faceValue, "Insufficient payment");

        invoice.isPaid = true;
        
        // Transfer payment to current owner (bank or seller)
        address currentOwner = ownerOf(_tokenId);
        payable(currentOwner).transfer(invoice.faceValue);
        
        // Refund excess
        if (msg.value > invoice.faceValue) {
            payable(msg.sender).transfer(msg.value - invoice.faceValue);
        }

        emit InvoicePaid(_tokenId, msg.sender);
    }

    /**
     * @dev Đóng invoice hoàn tất (chỉ owner contract)
     * @param _tokenId Token ID
     */
    function closeInvoice(uint256 _tokenId) public onlyOwner {
        require(_ownerOf(_tokenId) != address(0), "Invoice does not exist");
        InvoiceData storage invoice = invoices[_tokenId];
        require(invoice.isPaid, "Invoice not paid yet");
        require(!invoice.isClosed, "Already closed");

        invoice.isClosed = true;

        emit InvoiceClosed(_tokenId);
    }

    /**
     * @dev Lấy invoice data
     */
    function getInvoiceData(uint256 _tokenId) public view returns (InvoiceData memory) {
        require(_ownerOf(_tokenId) != address(0), "Invoice does not exist");
        return invoices[_tokenId];
    }

    /**
     * @dev Lấy tokenId từ invoiceId
     */
    function getTokenIdByInvoiceId(uint256 _invoiceId) public view returns (uint256) {
        return invoiceIdToTokenId[_invoiceId];
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
