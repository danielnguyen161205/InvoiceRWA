# 🎨 Invoice RWA - Professional Animation System

## 🚀 Giới Thiệu

Hệ thống animations và effects chuyên nghiệp cho Invoice RWA Frontend, được thiết kế để mang lại trải nghiệm người dùng tuyệt vời với hiệu ứng mượt mà và hiện đại.

## 📦 Các Thành Phần

### 1. CSS Animation Libraries
- **animations.css** - 50+ keyframe animations
- **transitions.css** - Interactive transitions cho UI components
- **effects.css** - Special effects (glassmorphism, gradients, glows)

### 2. JavaScript Libraries
- **scroll-animations.js** - Scroll-triggered animations
- **page-transitions.js** - Smooth page transitions

### 3. Tailwind Config
- Custom animations, colors, shadows
- Extended utility classes

## ⚡ Cài Đặt Nhanh

### 1. Import CSS trong HTML:
```html
<link rel="stylesheet" href="assets/css/animations.css">
<link rel="stylesheet" href="assets/css/transitions.css">
<link rel="stylesheet" href="assets/css/effects.css">
<link rel="stylesheet" href="assets/css/tailwind.generated.css">
```

### 2. Import JavaScript trước closing `</body>`:
```html
<script src="assets/js/scroll-animations.js"></script>
<script src="assets/js/page-transitions.js"></script>
```

### 3. Build Tailwind CSS (nếu có thay đổi):
```bash
cd Frontend
npm run build:css
```

## 🎯 Sử Dụng Cơ Bản

### Fade Animations
```html
<div class="animate-fade-in-up delay-200">
  Fade in from bottom với delay
</div>
```

### Glassmorphism
```html
<div class="glass-card p-6 rounded-xl">
  Modern glass effect card
</div>
```

### Button Effects
```html
<button class="btn-ripple btn-glow">
  Button với ripple và glow
</button>
```

### Scroll Reveal
```html
<div class="scroll-reveal-up">
  Tự động animate khi scroll vào viewport
</div>
```

### Counter Animation
```html
<span data-count="12500" data-decimals="0">0</span>
```

### Page Transitions
```javascript
// Enable page transitions
window.pageTransitions = new PageTransitions({
  type: 'fade',
  duration: 600
});
```

## 📚 Documentation

Xem **ANIMATION_GUIDE.md** để có hướng dẫn chi tiết về:
- Tất cả animations có sẵn
- Cách sử dụng từng effect
- Best practices
- Ví dụ code

## 🎨 Demo

Mở file **animation-showcase.html** để xem tất cả animations và effects:
```
Frontend/assets/pages/animation-showcase.html
```

## 🔧 Customization

### Thay đổi màu chính:
```css
/* In tailwind.config.js */
colors: {
  primary: {
    500: '#ed4337', // Your brand color
  }
}
```

### Tùy chỉnh animation duration:
```css
.duration-custom {
  animation-duration: 1.2s;
}
```

### Tạo animation riêng:
```css
@keyframes myAnimation {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.my-animation {
  animation: myAnimation 0.5s ease-out;
}
```

## 🎁 Features

✅ 50+ Pre-built animations  
✅ Glassmorphism effects  
✅ Gradient backgrounds  
✅ Scroll-triggered animations  
✅ Page transitions  
✅ Counter animations  
✅ Loading states  
✅ Parallax scrolling  
✅ Smooth scroll  
✅ Responsive design  
✅ Performance optimized  

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (limited support)

## ⚠️ Performance Tips

1. Sử dụng `will-change` cho animations phức tạp
2. Limit số lượng animations đồng thời
3. Test trên mobile devices
4. Tôn trọng `prefers-reduced-motion`
5. Lazy load heavy animations

## 🤝 Contributing

Contributions are welcome! Để thêm animations mới:

1. Thêm keyframes vào `animations.css`
2. Tạo utility class
3. Update documentation
4. Test trên nhiều browsers

## 📄 License

MIT License - Feel free to use in your projects!

## 🎓 Learn More

- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

## 💬 Support

Có câu hỏi? Check out:
- ANIMATION_GUIDE.md - Detailed documentation
- animation-showcase.html - Live examples
- Code comments - Inline documentation

---

Made with ❤️ for Invoice RWA Project
