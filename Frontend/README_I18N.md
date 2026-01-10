# 🌍 Internationalization (i18n) System

## Overview
Hệ thống đa ngôn ngữ cho Invoice RWA Platform hỗ trợ chuyển đổi giữa **Tiếng Việt (VI)** và **Tiếng Anh (EN)**.

## Features
✅ Automatic language detection from localStorage  
✅ Persistent language preference across sessions  
✅ Real-time UI updates when switching languages  
✅ Support for both text content and HTML attributes  
✅ Custom event emission for dynamic content  
✅ Responsive language switcher button  
✅ Smooth transition animations  

## File Structure
```
Frontend/
├── assets/
│   ├── js/
│   │   └── i18n.js          # Main i18n engine
│   ├── css/
│   │   └── i18n.css         # Language switcher styles
│   └── pages/
│       ├── login.html       # ✅ Language switcher added
│       ├── register.html    # ✅ Language switcher added
│       ├── profile.html     # ✅ Language switcher added
│       ├── sme-dashboard.html    # ✅ Language switcher added
│       ├── bank-dashboard.html   # ✅ Language switcher added
│       ├── admin-dashboard.html  # ✅ Language switcher added
│       ├── kyc-verification.html # ✅ Language switcher added
│       ├── kyb-verification.html # ✅ Language switcher added
│       └── ... (all other pages)
```

## Usage

### 1. Adding i18n to a New Page

Add the following to your HTML `<head>`:
```html
<script src="../js/i18n.js"></script>
<link rel="stylesheet" href="../css/i18n.css">
```

Add the language switcher button (choose one of these placements):

**Option A: Fixed Top-Right (for fullscreen pages)**
```html
<body>
  <!-- Language Switcher (Top Right) -->
  <div class="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white rounded-lg shadow-md p-1">
    <button class="lang-btn px-3 py-1.5 text-sm font-medium rounded transition-all duration-200" data-lang="vi">
      🇻🇳 VI
    </button>
    <button class="lang-btn px-3 py-1.5 text-sm font-medium rounded transition-all duration-200" data-lang="en">
      🇬🇧 EN
    </button>
  </div>
  
  <!-- Your page content -->
</body>
```

**Option B: Inline in Navigation (for dashboard pages)**
```html
<nav>
  <!-- Other nav items -->
  
  <!-- Language Switcher -->
  <div class="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
    <button class="lang-btn px-3 py-1.5 text-sm font-medium rounded transition-all duration-200" data-lang="vi">
      🇻🇳 VI
    </button>
    <button class="lang-btn px-3 py-1.5 text-sm font-medium rounded transition-all duration-200" data-lang="en">
      🇬🇧 EN
    </button>
  </div>
</nav>
```

### 2. Adding Translatable Text

Use the `data-i18n` attribute on any element you want to translate:

```html
<!-- Format: data-i18n="category.key" -->
<h1 data-i18n="common.welcome">Welcome</h1>
<button data-i18n="common.submit">Submit</button>
<span data-i18n="profile.status">Status</span>
```

### 3. Translating HTML Attributes

To translate attributes like `placeholder`, `title`, `alt`, use `data-i18n-attr`:

```html
<input 
  type="text" 
  data-i18n="auth.email" 
  data-i18n-attr="placeholder" 
  placeholder="Email"
>

<button 
  data-i18n="common.save" 
  data-i18n-attr="title" 
  title="Save changes"
>
  💾
</button>
```

### 4. Adding New Translations

Edit `Frontend/assets/js/i18n.js` and add to the `translations` object:

```javascript
const translations = {
    // ... existing categories
    
    // Add your new category
    myCategory: {
        en: {
            greeting: 'Hello',
            farewell: 'Goodbye',
            message: 'Welcome to our platform'
        },
        vi: {
            greeting: 'Xin chào',
            farewell: 'Tạm biệt',
            message: 'Chào mừng đến với nền tảng của chúng tôi'
        }
    }
};
```

Then use it in HTML:
```html
<h1 data-i18n="myCategory.greeting">Hello</h1>
<p data-i18n="myCategory.message">Welcome to our platform</p>
```

### 5. JavaScript API

```javascript
// Get current language
const currentLang = window.i18n.getCurrentLanguage(); // 'vi' or 'en'

// Switch language programmatically
window.i18n.switchLanguage('en');

// Get a specific translation
const text = window.i18n.t('common', 'submit'); // Returns "Submit" or "Gửi"

// Get all translations for a category
const authTranslations = window.i18n.tCategory('auth');
// Returns: { login: 'Login', register: 'Register', ... } or Vietnamese equivalents

// Listen to language change events
window.addEventListener('languageChanged', (e) => {
    console.log('Language changed to:', e.detail.language);
    // Update your dynamic content here
});
```

### 6. Dynamic Content Translation

For content generated dynamically (JavaScript), use the API:

```javascript
// Example: Dynamic alert message
function showWelcome() {
    const message = window.i18n.t('dashboard', 'welcome');
    alert(message); // Shows "Welcome" or "Chào mừng"
}

// Example: Dynamic table generation
function createInvoiceRow(invoice) {
    const statusText = window.i18n.t('invoice', invoice.status.toLowerCase());
    return `
        <tr>
            <td>${invoice.number}</td>
            <td>${statusText}</td>
        </tr>
    `;
}
```

## Available Translation Categories

### 1. `common`
Basic UI elements (save, cancel, submit, delete, etc.)

### 2. `nav`
Navigation items (dashboard, invoices, payments, etc.)

### 3. `auth`
Authentication pages (login, register, password, etc.)

### 4. `profile`
Profile page elements

### 5. `kyc`
KYC/KYB verification forms

### 6. `invoice`
Invoice-related terms

### 7. `dashboard`
Dashboard elements and statistics

## Example: Complete Page with i18n

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
    <link rel="stylesheet" href="../css/tailwind.generated.css">
    <link rel="stylesheet" href="../css/i18n.css">
    <script src="../js/i18n.js"></script>
</head>
<body>
    <!-- Language Switcher -->
    <div class="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white rounded-lg shadow-md p-1">
        <button class="lang-btn px-3 py-1.5 text-sm font-medium rounded" data-lang="vi">
            🇻🇳 VI
        </button>
        <button class="lang-btn px-3 py-1.5 text-sm font-medium rounded" data-lang="en">
            🇬🇧 EN
        </button>
    </div>

    <!-- Translatable Content -->
    <div class="container">
        <h1 data-i18n="common.welcome">Welcome</h1>
        
        <form>
            <label data-i18n="auth.email">Email</label>
            <input 
                type="email" 
                data-i18n="auth.email" 
                data-i18n-attr="placeholder"
                placeholder="Email"
            >
            
            <button type="submit" data-i18n="common.submit">Submit</button>
        </form>
    </div>

    <script>
        // Listen for language changes
        window.addEventListener('languageChanged', (e) => {
            console.log('New language:', e.detail.language);
            // Update any dynamic content here
        });
    </script>
</body>
</html>
```

## Browser Storage

Language preference is saved in localStorage:
```javascript
localStorage.getItem('preferredLanguage') // 'vi' or 'en'
```

Default language: **Vietnamese (VI)**

## Styling

The language switcher uses Tailwind CSS classes. Customize in `i18n.css`:
- `.lang-btn` - Button base styles
- `.lang-btn.active` - Active state (currently selected language)
- Animation effects for smooth transitions

## Best Practices

1. ✅ **Always use data-i18n** for user-facing text
2. ✅ **Group related translations** in the same category
3. ✅ **Use descriptive keys** (e.g., `submitButton` not `btn1`)
4. ✅ **Keep translations short** for UI elements
5. ✅ **Test both languages** before deploying
6. ⚠️ **Don't translate** technical IDs, API endpoints, or code
7. ⚠️ **Don't use HTML** in translation strings (security risk)

## Troubleshooting

**Language not switching?**
- Check browser console for errors
- Verify `data-i18n` format is correct: `"category.key"`
- Ensure i18n.js is loaded before page content

**Translation not found?**
- Check the translation key exists in `translations` object
- Verify category and key spelling
- Check browser console for warnings

**Button style not working?**
- Ensure i18n.css is loaded
- Check Tailwind CSS is available
- Verify button has class `lang-btn` and `data-lang` attribute

## Future Enhancements

- [ ] Add more languages (Chinese, Japanese, etc.)
- [ ] Lazy-load translation files for performance
- [ ] Add language detection from browser settings
- [ ] Add RTL support for Arabic/Hebrew
- [ ] Translation management UI for admins

## Support

For issues or questions:
1. Check this README
2. Review `i18n.js` source code
3. Test in browser console using `window.i18n` API
4. Contact development team

---

**Version:** 1.0.0  
**Last Updated:** January 10, 2026  
**Maintained by:** Invoice RWA Development Team
