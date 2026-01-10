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
            rejected: 'Rejected',
            or: 'or',
            socialMedia: 'Our Social Media',
            welcome: 'Welcome',
            add: 'Add',
            notifications: 'Notifications',
            markAllAsRead: 'Mark all as read',
            noNewNotifications: 'No new notifications'
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
            rejected: 'Bị từ chối',
            or: 'hoặc',
            socialMedia: 'Mạng xã hội của chúng tôi',
            welcome: 'Chào mừng',
            add: 'Thêm',
            notifications: 'Thông báo',
            markAllAsRead: 'Đánh dấu đã đọc',
            noNewNotifications: 'Chưa có thông báo mới'
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
            termsAgree: 'I agree to the Terms and Conditions',
            signInToStart: 'Hello Developer, Sign In To Get Started',
            joinInvoiceRWA: 'Create account, Join Invoice RWA',
            organizationName: 'Organization Name'
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
            termsAgree: 'Tôi đồng ý với Điều khoản và Điều kiện',
            signInToStart: 'Xin chào, Đăng nhập để bắt đầu',
            joinInvoiceRWA: 'Tạo tài khoản, Tham gia Invoice RWA',
            organizationName: 'Tên tổ chức'
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
            shareholderList: 'Shareholder/Contributing Member List',
            shareholderName: 'Shareholder/Member Name',
            shareholderType: 'Type',
            individual: 'Individual',
            organization: 'Organization',
            ownershipPercent: 'Ownership %',
            ownershipPercentLabel: 'Ownership %',
            idNumber: 'ID Number/Tax ID',
            actions: 'Actions',
            delete: 'Delete',
            noShareholders: 'No shareholders yet. Press "Add" to start.',
            contributingMember: 'Contributing Member',
            submit: 'Submit Verification',
            pending: 'Pending Review',
            approved: 'Approved',
            rejected: 'Rejected',
            kycStatusPending: 'Your KYC profile is under review. Please wait for admin approval.',
            kycStatusRejected: 'KYC profile rejected. Please contact support.',
            kybStatusPending: 'Your KYB profile is under review. Please wait for admin approval.',
            kybStatusRejected: 'KYB profile rejected. Please contact support.',
            importantNotice: 'Important Notice',
            infoTaxMST: 'Please cross-check Tax ID status at tracuunnt.gdt.gov.vn',
            infoConsistencyRep: 'Check legal representative consistency at dangkykinhdoanh.gov.vn',
            preciseInfoRequired: 'All information must be accurate and match legal documents',
            requiredFieldsLabel: 'Fields marked with * are required',
            checkHere: 'Check here',
            processing: 'Processing...',
            kycSubmittedSuccess: 'KYC profile submitted successfully! Please wait for admin review.',
            kybSubmittedSuccess: 'KYB profile submitted successfully! Please wait for admin review.',
            completeVerification: 'Complete KYC Verification',
            provideOrgDetails: 'Please provide your organization details to complete the verification process.',
            legalNameRequired: 'Legal Name *',
            uploadDocuments: 'Upload Documents',
            uploadDocument: 'Upload Document',
            createOrganization: 'Create Organization',
            submitForReview: 'Submit for Review',
            // Profile/KYC form additional translations
            basicBusinessInfo: 'Basic Business Information',
            establishmentDate: 'Establishment Date',
            legalRepresentative: 'Legal Representative',
            headquartersAddress: 'Headquarters Address',
            legalDocuments: 'Legal Documents',
            taxVerificationStatus: 'Tax ID Verification Status',
            selectStatus: 'Select status...',
            verified: 'Verified',
            pendingVerification: 'Pending verification',
            verificationFailed: 'Verification failed',
            appointmentDecision: 'Appointment decision for legal representative',
            shareholderMemberList: 'Shareholder/Member list',
            bankAccountInfo: 'Bank account information',
            projectAuthority: 'Project participation authority',
            boardResolution: 'Board/Shareholders resolution',
            authorizedPersonsList: 'List of authorized persons',
            signatureSpecimen: 'Authorized signature specimen',
            checklistBeforeSubmit: 'Checklist before submitting:',
            checklistItem1: 'Completed basic business information',
            checklistItem2: 'Provided legal documents and tax verification',
            checklistItem3: 'Uploaded required authority documents',
            checklistItem4: 'Checked tax ID at tracuunnt.gdt.gov.vn',
            checklistItem5: 'Checked representative info at dangkykinhdoanh.gov.vn',
            personalKyc: 'Personal KYC',
            addPerson: 'Add Person',
            personalKycDescription: 'Add personal information for: Legal representative, Authorized signers, Shareholders, UBO',
            uboTitle: 'UBO (Ultimate Beneficial Owner)',
            uboNotice: 'Note: If company is listed, please provide exchange information. Otherwise, provide ownership proof documents.',
            companyListed: 'Company is listed on stock exchange',
            stockExchange: 'Stock Exchange',
            selectExchange: 'Select exchange...',
            stockExchangeHose: 'HOSE - Hochiminh Stock Exchange',
            stockExchangeHnx: 'HNX - Hanoi Stock Exchange',
            stockExchangeUpcom: 'UPCOM - Unlisted Public Company Market',
            stockCode: 'Stock Code',
            stockCodePlaceholder: 'e.g. VNM, VCB, FPT...',
            fullNamePlaceholder: 'e.g. John Doe',
            nationalityPlaceholder: 'e.g. Vietnam',
            idNumberPlaceholder: 'e.g. 001234567890',
            addressPlaceholder: 'e.g. 123 ABC Street, Ward XYZ, District 1, HCMC',
            contactPlaceholder: 'e.g. 0901234567 or email@example.com',
            personNumber: 'Person #',
            noPersonalKyc: 'No personal information yet. Press "Add Person" to start.',
            noShareholders: 'No shareholders yet. Press "Add" to start.',
            indirectOwnershipDocs: 'Indirect ownership proof documents',
            indirectOwnershipDocsDesc: 'Attach: Parent company registration, Charter, Shareholder register, Capital contribution agreement, etc.',
            submitFullVerification: 'Submit full verification (KYB + KYC + UBO)',
            // Security tab
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmNewPassword: 'Confirm New Password',
            updatePassword: 'Update Password (Coming Soon)',
            passwordNotImplemented: 'Password changes are not yet implemented',
            // Scanner modal
            scanDocument: 'Scan ID document',
            placeDocument: 'Place document on flat surface with good lighting and all corners visible',
            orUploadFile: 'Or upload from file',
            retake: 'Retake',
            processExtract: 'Process & Extract',
            processingImage: 'Processing image and extracting information...',
            pleaseWait: 'Please wait a moment',
            // Wallet section
            noWalletConnected: 'No wallet connected',
            walletAddress: 'Wallet Address',
            walletNote: 'This wallet will be used for NFT minting and blockchain transactions. Make sure it has enough ETH for gas fees.',
            // Scanner modal additional
            processingSuccess: 'Extraction successful!',
            applyToForm: 'Apply to Form',
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
            shareholderList: 'Danh sách cổ đông/thành viên góp vốn',
            shareholderName: 'Tên cổ động/Thành viên',
            shareholderType: 'Loại',
            individual: 'Cá nhân',
            organization: 'Tổ chức',
            ownershipPercent: 'Tỷ lệ sở hữu %',
            ownershipPercentLabel: 'Tỷ lệ sở hữu (%)',
            idNumber: 'Số CCCD/MST',
            actions: 'Thao tác',
            delete: 'Xóa',
            noShareholders: 'Chưa có thông tin cổ đông. Nhấn "Thêm" để bắt đầu.',
            contributingMember: 'Thành viên góp vốn',
            submit: 'Gửi xác minh',
            pending: 'Đang chờ duyệt',
            approved: 'Đã phê duyệt',
            rejected: 'Bị từ chối',
            completeVerification: 'Hoàn thành xác minh KYC',
            provideOrgDetails: 'Vui lòng cung cấp thông tin tổ chức để hoàn thành quy trình xác minh.',
            legalNameRequired: 'Tên pháp lý *',
            uploadDocuments: 'Tải lên tài liệu',
            uploadDocument: 'Tải lên tài liệu',
            createOrganization: 'Tạo tổ chức',
            submitForReview: 'Gửi để xem xét',
            // Profile/KYC form additional translations
            basicBusinessInfo: 'Thông tin cơ bản doanh nghiệp',
            establishmentDate: 'Ngày thành lập',
            legalRepresentative: 'Người đại diện pháp luật',
            headquartersAddress: 'Địa chỉ trụ sở chính',
            legalDocuments: 'Hồ sơ pháp lý doanh nghiệp',
            taxVerificationStatus: 'Trạng thái xác minh MST',
            selectStatus: 'Chọn trạng thái...',
            verified: 'Đã xác minh',
            pendingVerification: 'Đang chờ xác minh',
            verificationFailed: 'Xác minh thất bại',
            appointmentDecision: 'Quyết định bổ nhiệm người đại diện pháp luật',
            shareholderMemberList: 'Danh sách cổ đông/thành viên',
            bankAccountInfo: 'Thông tin tài khoản ngân hàng',
            projectAuthority: 'Thẩm quyền tham gia dự án',
            boardResolution: 'Nghị quyết HĐQT/ĐHCĐ',
            authorizedPersonsList: 'Danh sách người được ủy quyền',
            signatureSpecimen: 'Mẫu chữ ký người được ủy quyền',
            checklistBeforeSubmit: 'Checklist trước khi gửi:',
            checklistItem1: 'Đã điền đầy đủ thông tin cơ bản doanh nghiệp',
            checklistItem2: 'Đã cung cấp hồ sơ pháp lý và xác minh MST',
            checklistItem3: 'Đã upload các tài liệu thẩm quyền bắt buộc',
            checklistItem4: 'Đã kiểm tra MST tại tracuunnt.gdt.gov.vn',
            checklistItem5: 'Đã kiểm tra thông tin người đại diện tại dangkykinhdoanh.gov.vn',
            personalKyc: 'KYC Cá nhân',
            addPerson: 'Thêm người',
            personalKycDescription: 'Thêm thông tin cá nhân cho: Người đại diện pháp luật, Người được ủy quyền ký/thao tác, Cổ đông, UBO',
            uboTitle: 'UBO (Người thụ hưởng cuối cùng)',
            uboNotice: 'Lưu ý: Nếu công ty có niêm yết, vui lòng cung cấp thông tin sàn giao dịch. Nếu không, vui lòng cung cấp đầy đủ tài liệu chứng minh sở hữu.',
            companyListed: 'Công ty có niêm yết trên sàn',
            stockExchange: 'Sàn giao dịch',
            selectExchange: 'Chọn sàn...',
            stockExchangeHose: 'HOSE - Sở Giao dịch Chứng khoán TP.HCM',
            stockExchangeHnx: 'HNX - Sở Giao dịch Chứng khoán Hà Nội',
            stockExchangeUpcom: 'UPCOM - Sàn giao dịch cổ phiếu chưa niêm yết',
            stockCode: 'Mã chứng khoán',
            stockCodePlaceholder: 'VD: VNM, VCB, FPT...',
            fullNamePlaceholder: 'VD: Nguyễn Văn A',
            nationalityPlaceholder: 'VD: Việt Nam',
            idNumberPlaceholder: 'VD: 001234567890',
            addressPlaceholder: 'VD: Số 123, Đường ABC, Phường XYZ, Quận 1, TP.HCM',
            contactPlaceholder: 'VD: 0901234567 hoặc email@example.com',
            personNumber: 'Người #',
            noPersonalKyc: 'Chưa có thông tin cá nhân. Nhấn "Thêm người" để bắt đầu.',
            noShareholders: 'Chưa có thông tin cổ đông. Nhấn "Thêm" để bắt đầu.',
            indirectOwnershipDocs: 'Tài liệu chứng minh sở hữu gián tiếp',
            indirectOwnershipDocsDesc: 'Đính kèm: ĐKKD công ty mẹ, Điều lệ, Sổ đăng ký cổ đông, Thỏa thuận góp vốn, v.v.',
            submitFullVerification: 'Gửi yêu cầu xác minh đầy đủ (KYB + KYC + UBO)',
            kycStatusPending: 'Hồ sơ KYC của bạn đang được xem xét. Vui lòng chờ admin phê duyệt.',
            kycStatusRejected: 'Hồ sơ KYC bị từ chối. Vui lòng liên hệ support.',
            kybStatusPending: 'Hồ sơ KYB của bạn đang được xem xét. Vui lòng chờ admin phê duyệt.',
            kybStatusRejected: 'Hồ sơ KYB bị từ chối. Vui lòng liên hệ support.',
            importantNotice: 'Lưu ý quan trọng',
            infoTaxMST: 'Vui lòng đối chiếu trạng thái MST tại tracuunnt.gdt.gov.vn',
            infoConsistencyRep: 'Kiểm tra tính nhất quán người đại diện pháp luật tại dangkykinhdoanh.gov.vn',
            preciseInfoRequired: 'Tất cả thông tin phải chính xác và khớp với giấy tờ pháp lý',
            requiredFieldsLabel: 'Các trường đánh dấu * là bắt buộc',
            checkHere: 'Kiểm tra tại đây',
            processing: 'Đang gửi...',
            kycSubmittedSuccess: '✅ Hồ sơ KYC đã được gửi thành công!\n\nVui lòng chờ admin xem xét và phê duyệt.',
            kybSubmittedSuccess: '✅ Hồ sơ KYB đã được gửi thành công!\n\nVui lòng chờ admin xem xét và phê duyệt.',
            completeKyc: 'Hoàn tất KYC',
            // Security tab
            currentPassword: 'Mật khẩu hiện tại',
            newPassword: 'Mật khẩu mới',
            confirmNewPassword: 'Xác nhận mật khẩu mới',
            updatePassword: 'Cập nhật mật khẩu (Sắp có)',
            passwordNotImplemented: 'Tính năng đổi mật khẩu chưa được triển khai',
            // Scanner modal
            scanDocument: 'Scan giấy tờ tùy thân',
            placeDocument: 'Đặt giấy tờ trên mặt phẳng, đảm bảo ánh sáng đầy đủ và tất cả góc được hiển thị rõ ràng',
            orUploadFile: 'Hoặc tải lên từ file',
            retake: 'Chụp lại',
            processExtract: 'Xử lý & Trích xuất',
            processingImage: 'Đang xử lý ảnh và trích xuất thông tin...',
            pleaseWait: 'Vui lòng đợi trong giây lát',
            processingSuccess: 'Trích xuất thành công!',
            applyToForm: 'Áp dụng vào Form',
            // Wallet section
            noWalletConnected: 'Chưa kết nối ví',
            walletAddress: 'Địa chỉ ví',
            walletNote: 'Ví này sẽ được sử dụng để đúc NFT và giao dịch blockchain. Đảm bảo có đủ ETH cho phí gas.'
        }
    },

    org: {
        en: {
            noOrgFound: 'No Organization Found',
            completeKycToLink: 'Complete KYC verification to link your organization.',
            orgId: 'Organization ID',
            blockchainWallet: 'Blockchain Wallet',
            noWalletConnected: 'No wallet connected',
            walletConnected: 'Wallet Connected',
            connectWallet: 'Connect MetaMask Wallet',
            disconnect: 'Disconnect',
            copy: 'Copy',
            walletUsageNotice: 'This wallet will be used for NFT minting and blockchain transactions. Make sure it has enough ETH for gas fees.',
        },
        vi: {
            noOrgFound: 'Không tìm thấy tổ chức',
            completeKycToLink: 'Hoàn tất xác minh KYC để liên kết tổ chức của bạn.',
            orgId: 'ID Tổ chức',
            blockchainWallet: 'Ví Blockchain',
            noWalletConnected: 'Chưa kết nối ví',
            walletConnected: 'Đã kết nối ví',
            connectWallet: 'Kết nối ví MetaMask',
            disconnect: 'Ngắt kết nối',
            copy: 'Sao chép',
            walletUsageNotice: 'Ví này sẽ được sử dụng để đúc NFT và thực hiện các giao dịch trên blockchain. Hãy đảm bảo ví có đủ ETH để trả phí gas.',
        }
    },

    security: {
        en: {
            securityWarning: 'Password changes are not yet implemented',
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmPassword: 'Confirm New Password',
            updatePasswordNotice: 'Update Password (Coming Soon)',
            currentPasswordPlaceholder: 'Enter current password',
            newPasswordPlaceholder: 'Enter new password',
            confirmPasswordPlaceholder: 'Confirm new password',
        },
        vi: {
            securityWarning: 'Tính năng đổi mật khẩu chưa được triển khai',
            currentPassword: 'Mật khẩu hiện tại',
            newPassword: 'Mật khẩu mới',
            confirmPassword: 'Xác nhận mật khẩu mới',
            updatePasswordNotice: 'Cập nhật mật khẩu (Sắp có)',
            currentPasswordPlaceholder: 'Nhập mật khẩu hiện tại',
            newPasswordPlaceholder: 'Nhập mật khẩu mới',
            confirmPasswordPlaceholder: 'Xác nhận mật khẩu mới',
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
            browseApprovedDescription: 'Browse approved invoices from verified SMEs',
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
            invoiceDetails: 'Invoice Details',
            requestStatus: 'Request Status',
            lastUpdated: 'Last updated'
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
            browseApprovedDescription: 'Duyệt các hóa đơn đã được phê duyệt từ các SME đã xác minh',
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
    },

    // Validation & Alert Messages
    validation: {
        en: {
            // KYB/KYC Validation
            kybRequired: 'Please enter complete KYB information:\n- Legal Name\n- Tax ID',
            kycRequired: 'Please add at least 1 person in the KYC Personal section',
            kycPersonRequired: 'Please complete information for all KYC persons:\n- Full Name\n- ID Number/Passport\n- Role',
            shareholderRequired: 'Please complete information for all shareholders:\n- Shareholder Name\n- Ownership Percentage',
            // Wallet
            walletConnected: 'Wallet connected successfully!',
            walletConnectFailed: 'Failed to connect wallet:',
            walletDisconnected: 'Wallet disconnected successfully',
            walletDisconnectFailed: 'Error disconnecting wallet:',
            walletAddressCopied: 'Wallet address copied!',
            walletCopyFailed: 'Failed to copy address',
            // General
            formElementsNotFound: 'Form elements not found. Please refresh the page.',
            pleaseEnterValidPrice: 'Please enter a valid purchase price',
            failedToLoadInvoices: 'Failed to load invoices',
            accessDeniedBuyerOnly: 'Access denied: BUYER only',
            accessDeniedBankOnly: 'Access denied: BANK only',
            // Success messages
            verificationSubmitted: 'Verification request submitted successfully!\n\nSent complete:\n- KYB (Organization Information)\n- KYC ({kycCount} people)\n- UBO ({uboCount} shareholders)\n\nPlease wait for admin approval.'
        },
        vi: {
            // KYB/KYC Validation
            kybRequired: 'Vui lòng điền đầy đủ thông tin KYB:\n- Tên pháp lý\n- Mã số thuế',
            kycRequired: 'Vui lòng thêm ít nhất 1 người trong phần KYC Cá nhân',
            kycPersonRequired: 'Vui lòng điền đầy đủ thông tin cho tất cả người trong KYC:\n- Họ tên\n- Số CCCD/Passport\n- Vai trò',
            shareholderRequired: 'Vui lòng điền đầy đủ thông tin cho tất cả cổ đông:\n- Tên cổ đông\n- Tỷ lệ sở hữu',
            // Wallet
            walletConnected: 'Kết nối ví thành công!',
            walletConnectFailed: 'Không thể kết nối ví:',
            walletDisconnected: 'Đã ngắt kết nối ví',
            walletDisconnectFailed: 'Lỗi khi ngắt kết nối:',
            walletAddressCopied: 'Đã sao chép địa chỉ ví!',
            walletCopyFailed: 'Không thể sao chép địa chỉ',
            // General
            formElementsNotFound: 'Không tìm thấy phần tử form. Vui lòng tải lại trang.',
            pleaseEnterValidPrice: 'Vui lòng nhập giá mua hợp lệ',
            failedToLoadInvoices: 'Không thể tải hóa đơn',
            accessDeniedBuyerOnly: 'Từ chối truy cập: Chỉ dành cho BUYER',
            accessDeniedBankOnly: 'Từ chối truy cập: Chỉ dành cho BANK',
            // Success messages
            verificationSubmitted: 'Gửi yêu cầu xác minh thành công!\n\nĐã gửi đầy đủ:\n- KYB (Thông tin tổ chức)\n- KYC ({kycCount} người)\n- UBO ({uboCount} cổ đông)\n\nVui lòng chờ admin phê duyệt.'
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
