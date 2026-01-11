// Internationalization (i18n) System for Invoice RWA Platform
// Supports: English (EN) and Vietnamese (VI)

// Language translations database
const translations = {
    // Common UI Elements
    common: {
        en: {
            loading: 'Loading...',
            save: 'Save',
            cancel: 'Cancel',
            submit: 'Submit',
            edit: 'Edit',
            delete: 'Delete',
            confirm: 'Confirm',
            back: 'Back',
            next: 'Next',
            close: 'Close',
            search: 'Search',
            filter: 'Filter',
            export: 'Export',
            import: 'Import',
            download: 'Download',
            upload: 'Upload',
            create: 'Create',
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            yes: 'Yes',
            no: 'No',
            ok: 'OK',
            logout: 'Logout',
            profile: 'Profile',
            settings: 'Settings',
            help: 'Help',
            language: 'Language',
            verified: 'Verified',
            pending: 'Pending',
            rejected: 'Rejected'
        },
        vi: {
            loading: 'Đang tải...',
            save: 'Lưu',
            cancel: 'Hủy',
            submit: 'Gửi',
            edit: 'Sửa',
            delete: 'Xóa',
            confirm: 'Xác nhận',
            back: 'Quay lại',
            next: 'Tiếp theo',
            close: 'Đóng',
            search: 'Tìm kiếm',
            filter: 'Lọc',
            export: 'Xuất',
            import: 'Nhập',
            download: 'Tải xuống',
            upload: 'Tải lên',
            create: 'Tạo',
            success: 'Thành công',
            error: 'Lỗi',
            warning: 'Cảnh báo',
            info: 'Thông tin',
            yes: 'Có',
            no: 'Không',
            ok: 'Đồng ý',
            logout: 'Đăng xuất',
            profile: 'Hồ sơ',
            settings: 'Cài đặt',
            help: 'Trợ giúp',
            language: 'Ngôn ngữ',
            verified: 'Đã xác minh',
            pending: 'Chờ xử lý',
            rejected: 'Bị từ chối'
        }
    },
    
    // Navigation & Menu
    nav: {
        en: {
            dashboard: 'Dashboard',
            invoices: 'Invoices',
            payments: 'Payments',
            reports: 'Reports',
            users: 'Users',
            organizations: 'Organizations',
            settings: 'Settings',
            backToDashboard: 'Back to Dashboard'
        },
        vi: {
            dashboard: 'Bảng điều khiển',
            invoices: 'Hóa đơn',
            payments: 'Thanh toán',
            reports: 'Báo cáo',
            users: 'Người dùng',
            organizations: 'Tổ chức',
            settings: 'Cài đặt',
            backToDashboard: 'Về Bảng điều khiển'
        }
    },
    
    // Authentication
    auth: {
        en: {
            login: 'Login',
            register: 'Register',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            forgotPassword: 'Forgot Password?',
            rememberMe: 'Remember Me',
            noAccount: "Don't have an account?",
            hasAccount: 'Already have an account?',
            signUp: 'Sign Up',
            signIn: 'Sign In',
            welcomeBack: 'Welcome Back 👋',
            createAccount: 'Create account 👋',
            pleaseEnterDetails: 'Please enter your details.',
            signInWithGoogle: 'Sign in with Google',
            fullName: 'Full name',
            role: 'Role',
            selectRole: 'Select your role',
            sme: 'SME (Seller)',
            smeOrBuyer: 'SME or Buyer (Business User)',
            buyer: 'Buyer',
            bank: 'Bank (Financial Institution)',
            termsAgree: 'I agree to the Terms and Conditions'
        },
        vi: {
            login: 'Đăng nhập',
            register: 'Đăng ký',
            email: 'Email',
            password: 'Mật khẩu',
            confirmPassword: 'Xác nhận mật khẩu',
            forgotPassword: 'Quên mật khẩu?',
            rememberMe: 'Ghi nhớ đăng nhập',
            noAccount: 'Chưa có tài khoản?',
            hasAccount: 'Đã có tài khoản?',
            signUp: 'Đăng ký',
            signIn: 'Đăng nhập',
            welcomeBack: 'Chào mừng trở lại 👋',
            createAccount: 'Tạo tài khoản 👋',
            pleaseEnterDetails: 'Vui lòng nhập thông tin của bạn.',
            signInWithGoogle: 'Đăng nhập bằng Google',
            fullName: 'Họ và tên',
            role: 'Vai trò',
            selectRole: 'Chọn vai trò của bạn',
            sme: 'SME (Người bán)',
            smeOrBuyer: 'SME hoặc Người mua (Doanh nghiệp)',
            buyer: 'Người mua',
            bank: 'Ngân hàng (Tổ chức tài chính)',
            termsAgree: 'Tôi đồng ý với Điều khoản và Điều kiện'
        }
    },
    
    // Profile Page
    profile: {
        en: {
            title: 'Profile',
            account: 'Account Information',
            kycTab: 'KYC/KYB Verification',
            security: 'Security',
            personalInfo: 'Personal Information',
            userId: 'User ID',
            memberSince: 'Member Since',
            status: 'Status',
            available: 'Available',
            unavailable: 'Unavailable',
            wallet: 'Wallet',
            connectWallet: 'Connect Wallet',
            disconnectWallet: 'Disconnect Wallet',
            walletConnected: 'Wallet Connected',
            copyAddress: 'Copy Address',
            role: 'Role',
            verifiedAt: 'Verified At'
        },
        vi: {
            title: 'Hồ sơ',
            account: 'Thông tin tài khoản',
            kycTab: 'Xác minh KYC/KYB',
            security: 'Bảo mật',
            personalInfo: 'Thông tin cá nhân',
            userId: 'Mã người dùng',
            memberSince: 'Thành viên từ',
            status: 'Trạng thái',
            available: 'Khả dụng',
            unavailable: 'Không khả dụng',
            wallet: 'Ví',
            connectWallet: 'Kết nối ví',
            disconnectWallet: 'Ngắt kết nối',
            walletConnected: 'Đã kết nối ví',
            copyAddress: 'Sao chép địa chỉ',
            role: 'Vai trò',
            verifiedAt: 'Xác minh lúc'
        }
    },
    
    // KYC/KYB Verification
    kyc: {
        en: {
            title: 'KYC/KYB Verification',
            businessInfo: 'Business Information',
            legalName: 'Legal Name',
            foreignName: 'Foreign Name (if any)',
            tradeName: 'Trade Name/Abbreviation',
            taxId: 'Tax ID',
            registrationNumber: 'Registration Number',
            legalForm: 'Legal Form',
            operationStatus: 'Operation Status',
            selectLegalForm: 'Select legal form...',
            selectOperationStatus: 'Select status...',
            legalFormLLC: 'LLC - Limited Liability Company',
            legalFormJSC: 'Joint Stock Company',
            legalFormPrivate: 'Private Enterprise',
            legalFormCoop: 'Cooperative',
            legalFormOther: 'Other',
            statusActive: 'Active',
            statusSuspended: 'Suspended',
            statusDissolved: 'Dissolved',
            address: 'Address',
            kycPersons: 'KYC Persons',
            addPerson: 'Add Person',
            fullName: 'Full Name',
            dateOfBirth: 'Date of Birth',
            nationality: 'Nationality',
            idType: 'ID Type',
            idNumber: 'ID Number',
            role: 'Role',
            ubo: 'UBO (Ultimate Beneficial Owners)',
            shareholders: 'Shareholders',
            addShareholder: 'Add Shareholder',
            ownershipPercent: 'Ownership %',
            submit: 'Submit Verification',
            pending: 'Pending Review',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        vi: {
            title: 'Xác minh KYC/KYB',
            businessInfo: 'Thông tin doanh nghiệp',
            legalName: 'Tên pháp lý',
            foreignName: 'Tên tiếng Anh (nếu có)',
            tradeName: 'Tên viết tắt',
            taxId: 'Mã số thuế',
            registrationNumber: 'Số ĐKKD',
            legalForm: 'Loại hình pháp lý',
            operationStatus: 'Trạng thái hoạt động',
            selectLegalForm: 'Chọn loại hình...',
            selectOperationStatus: 'Chọn trạng thái...',
            legalFormLLC: 'TNHH - Trách nhiệm hữu hạn',
            legalFormJSC: 'Cổ phần',
            legalFormPrivate: 'DNTN - Doanh nghiệp tư nhân',
            legalFormCoop: 'Hợp tác xã',
            legalFormOther: 'Khác',
            statusActive: 'Đang hoạt động',
            statusSuspended: 'Tạm ngưng',
            statusDissolved: 'Đã giải thể',
            address: 'Địa chỉ',
            kycPersons: 'Người liên quan KYC',
            addPerson: 'Thêm người',
            fullName: 'Họ và tên',
            dateOfBirth: 'Ngày sinh',
            nationality: 'Quốc tịch',
            idType: 'Loại giấy tờ',
            idNumber: 'Số giấy tờ',
            role: 'Vai trò',
            ubo: 'UBO (Người thụ hưởng cuối cùng)',
            shareholders: 'Cổ đông',
            addShareholder: 'Thêm cổ đông',
            ownershipPercent: 'Tỷ lệ sở hữu %',
            submit: 'Gửi xác minh',
            pending: 'Đang chờ duyệt',
            approved: 'Đã phê duyệt',
            rejected: 'Bị từ chối'
        }
    },
    
    // Invoice
    invoice: {
        en: {
            title: 'Invoices',
            allInvoices: 'All Invoices',
            myInvoices: 'My Invoices',
            toPay: 'To Pay',
            invoicesToPay: 'Invoices to Pay',
            createInvoice: 'Create Invoice',
            createNew: 'Create New',
            invoice: 'Invoice',
            invoiceNumber: 'Invoice Number',
            invoiceDate: 'Invoice Date',
            dueDate: 'Due Date',
            amount: 'Amount',
            status: 'Status',
            nftStatus: 'NFT Status',
            created: 'Created',
            action: 'Action',
            buyer: 'Buyer',
            seller: 'Seller',
            description: 'Description',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            paid: 'Paid',
            viewDetails: 'View Details',
            tokenize: 'Tokenize',
            requestFunding: 'Request Funding',
            draft: 'Draft',
            editing: 'Editing',
            submitted: 'Submitted',
            financed: 'Financed',
            settled: 'Settled',
            closed: 'Closed',
            disputed: 'Disputed',
            all: 'ALL',
            total: 'Total',
            funded: 'Funded'
        },
        vi: {
            title: 'Hóa đơn',
            allInvoices: 'Tất cả hóa đơn',
            myInvoices: 'Hóa đơn của tôi',
            toPay: 'Cần thanh toán',
            invoicesToPay: 'Hóa đơn cần thanh toán',
            createInvoice: 'Tạo hóa đơn',
            createNew: 'Tạo mới',
            invoice: 'Hóa đơn',
            invoiceNumber: 'Số hóa đơn',
            invoiceDate: 'Ngày hóa đơn',
            dueDate: 'Ngày đến hạn',
            amount: 'Số tiền',
            status: 'Trạng thái',
            nftStatus: 'Trạng thái NFT',
            created: 'Ngày tạo',
            action: 'Thao tác',
            buyer: 'Người mua',
            seller: 'Người bán',
            description: 'Mô tả',
            pending: 'Chờ xử lý',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
            paid: 'Đã thanh toán',
            viewDetails: 'Xem chi tiết',
            tokenize: 'Token hóa',
            requestFunding: 'Yêu cầu tài trợ',
            draft: 'Bản nháp',
            editing: 'Đang chỉnh sửa',
            submitted: 'Đã gửi',
            financed: 'Đã tài trợ',
            settled: 'Đã thanh toán',
            closed: 'Đã đóng',
            disputed: 'Tranh chấp',
            all: 'TẤT CẢ',
            total: 'Tổng',
            funded: 'Đã tài trợ'
        }
    },
    
    // Dashboard
    dashboard: {
        en: {
            welcome: 'Welcome',
            overview: 'Overview',
            beginDate: 'Begin Date',
            endDate: 'End Date',
            dateError: 'End date must be the same or after Begin date.',
            dataDisclaimer: 'This data has been shown according to your given information',
            totalInvoices: 'Total Invoices',
            pendingApproval: 'Pending Approval',
            approved: 'Approved',
            totalAmount: 'Total Amount',
            recentActivity: 'Recent Activity',
            quickActions: 'Quick Actions',
            statistics: 'Statistics',
            justNow: 'Just now',
            refresh: 'Refresh',
            invoiceMarketplace: 'Invoice Marketplace',
            availableInvoices: 'Available Invoices',
            myPortfolio: 'My Portfolio',
            availableForPurchase: 'Available Invoices for Purchase',
            browseDescription: 'Browse and purchase approved invoices from verified SMEs',
            buyerName: 'Buyer Name',
            issueDate: 'Issue Date',
            paymentTerm: 'Payment Term',
            discountRate: 'Discount Rate',
            actions: 'Actions',
            purchasedDate: 'Purchased Date',
            originalAmount: 'Original Amount',
            purchasePrice: 'Purchase Price',
            purchaseInvoice: 'Purchase Invoice',
            confirmPurchase: 'Confirm Purchase',
            enterPurchasePrice: 'Enter purchase price',
            amountToPay: 'Enter the amount you will pay for this invoice',
            invoiceDetails: 'Invoice Details'
        },
        vi: {
            welcome: 'Chào mừng',
            overview: 'Tổng quan',
            beginDate: 'Ngày bắt đầu',
            endDate: 'Ngày kết thúc',
            dateError: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.',
            dataDisclaimer: 'Dữ liệu này được hiển thị theo thông tin bạn đã cung cấp',
            totalInvoices: 'Tổng hóa đơn',
            pendingApproval: 'Chờ phê duyệt',
            approved: 'Đã phê duyệt',
            totalAmount: 'Tổng số tiền',
            recentActivity: 'Hoạt động gần đây',
            quickActions: 'Thao tác nhanh',
            statistics: 'Thống kê',
            justNow: 'Vừa xong',
            refresh: 'Làm mới',
            invoiceMarketplace: 'Sàn giao dịch hóa đơn',
            availableInvoices: 'Hóa đơn khả dụng',
            myPortfolio: 'Danh mục của tôi',
            availableForPurchase: 'Hóa đơn khả dụng để mua',
            browseDescription: 'Duyệt và mua hóa đơn đã được phê duyệt từ các SME đã xác minh',
            buyerName: 'Tên người mua',
            issueDate: 'Ngày phát hành',
            paymentTerm: 'Kỳ hạn thanh toán',
            discountRate: 'Tỷ lệ chiết khấu',
            actions: 'Thao tác',
            purchasedDate: 'Ngày mua',
            originalAmount: 'Số tiền gốc',
            purchasePrice: 'Giá mua',
            purchaseInvoice: 'Mua hóa đơn',
            confirmPurchase: 'Xác nhận mua',
            enterPurchasePrice: 'Nhập giá mua',
            amountToPay: 'Nhập số tiền bạn sẽ trả cho hóa đơn này',
            invoiceDetails: 'Chi tiết hóa đơn'
        }
    }
};

// Current language state
let currentLanguage = localStorage.getItem('preferredLanguage') || 'vi'; // Default to Vietnamese

// Get translation for a key
function t(category, key) {
    try {
        return translations[category][currentLanguage][key] || key;
    } catch (e) {
        console.warn(`Translation not found: ${category}.${key}`);
        return key;
    }
}

// Get all translations for a category
function tCategory(category) {
    try {
        return translations[category][currentLanguage] || {};
    } catch (e) {
        console.warn(`Category not found: ${category}`);
        return {};
    }
}

// Switch language
function switchLanguage(lang) {
    if (lang !== 'en' && lang !== 'vi') {
        console.error('Invalid language:', lang);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update all elements with data-i18n attribute
    updatePageTranslations();
    
    // Update language switcher UI
    updateLanguageSwitcher();
    
    // Emit custom event for pages to handle custom translations
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Update all translations on the page
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const [category, translationKey] = key.split('.');
        
        if (category && translationKey) {
            const translation = t(category, translationKey);
            
            // Check if element has data-i18n-attr to update attribute instead of text
            const attr = element.getAttribute('data-i18n-attr');
            if (attr) {
                element.setAttribute(attr, translation);
            } else {
                element.textContent = translation;
            }
        }
    });
}

// Update language switcher buttons
function updateLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang === currentLanguage) {
            btn.classList.add('active', 'bg-indigo-600', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-50');
        } else {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-50');
        }
    });
}

// Initialize i18n on page load
function initI18n() {
    // Set initial language from localStorage
    const savedLang = localStorage.getItem('preferredLanguage') || 'vi';
    currentLanguage = savedLang;
    
    // Update all translations
    updatePageTranslations();
    
    // Update language switcher
    updateLanguageSwitcher();
    
    // Add click handlers to language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// Export for use in other scripts
window.i18n = {
    t,
    tCategory,
    switchLanguage,
    getCurrentLanguage: () => currentLanguage,
    translations
};
